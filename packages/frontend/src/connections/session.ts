import axios from "axios";
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  filter,
  first,
  from,
  map,
  pairwise,
  ReplaySubject,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs";
import { BACKEND_URL } from "./api";
import {
  GeneratedKeys,
  startGeneration,
  decrypt,
  verifyMembershipZkp,
  combineCiphertext,
} from "pallier";
import { createParty, Party } from "./party";
import { createSignaller, Signaller } from "./signalling";
import { Signature, verifySignature } from "lrs";
import BigInteger from "big-integer";
import VrfGenerator from "../Vrf/vrf";
import messagePossibilities from "./possibilities";
/**
 *
 *
 * @type {80n}
 */
const keyLength = 80n;
/**
 *
 *
 * @type {2}
 */
const threshold = 2;

/**
 *
 *
 * @interface Vote
 * @typedef {Vote}
 */
interface Vote {
  /**
   *
   *
   * @type {string}
   */
  vote: string;
}

/**
 *
 *
 * @interface FilterOneResponse
 * @typedef {FilterOneResponse}
 */
interface FilterOneResponse {
  /**
   *
   *
   * @type {Vote[]}
   */
  filteredData: Vote[];
  /**
   *
   *
   * @type {string[]}
   */
  filteredCounters: string[]; // assuming counters are string
}
/**
 * Session class represents either an encryption or decryption session
 * Since both of these flows require freqeunt p2p communication, this class
 * provides a common interface for both of them. The class manages the lifecycle
 * of webrtc connection with all the other parties in the session.
 *
 * @export
 * @abstract
 * @class Session
 * @typedef {Session}
 */
export abstract class Session {
  /**
   * This flag indicates whether the session is ready to start the generation/decryption
   *
   * @private
   * @type {*}
   */
  private _ready = new BehaviorSubject(false);
  /**
   *
   * This flag indicates wether the generation/decryption is in progress
   *
   * @private
   * @type {boolean}
   */
  private _generationInProgress = false;
  /**
   *
   *
   * @private
   * @type {*}
   */
  private _vrf: any;

  /**
   * Current party's userId
   *
   * @readonly
   * @type {*}
   */
  get userId$() {
    return this.signaller.userId$;
  }

  /**
   * Getter for `_ready`
   *
   * @readonly
   * @type {*}
   */
  get isReady() {
    return this._ready.getValue();
  }

  /**
   *
   *
   * @readonly
   * @type {*}
   */
  get vrf() {
    return this._vrf;
  }

  /**
   *
   *
   * @readonly
   * @type {boolean}
   */
  get generationInProgress() {
    return this._generationInProgress;
  }

  /**
   * Creates an instance of Session.
   *
   * @constructor
   * @param {Signaller} signaller
   * @param {string} sessionId
   */
  constructor(
    private signaller: Signaller,
    protected readonly sessionId: string
  ) {
    this._vrf = VrfGenerator();
  }

  /**
   * This observable emits whenever a new party is added or removed from the session
   * It gets this data directly from the websocket server
   *
   * We use the list of parties to negotiate webrtc connections with each other, and/or
   * destroy existing webrtc connections
   *
   */
  readonly partiesChange$ = this.signaller.parties$.pipe(
    startWith({ parties: [] }),
    pairwise(),
    switchMap(([{ parties: currentParties }, { parties: serverParties }]) => {
      const removed = currentParties
        .filter((p) => {
          return !serverParties.some((sP) => sP.id === p.id);
        })
        .map((party) => ({ act: "rem", party } as const));

      const added = serverParties
        .filter(
          (sParty) => !currentParties.some((cParty) => cParty.id === sParty.id)
        )
        .map((party) => ({ act: "add", party } as const));

      return from([...removed, ...added]);
    })
  );

  /**
   * This is where connection negotiation happens.
   * We get the list of parties from the partiesChange$ observable, (as well as added/removed parties),
   * and use that information to create webrtc connections with each other
   *
   * We also send our ready flag to newly connected party, to handle the case where we were ready before
   * that party joined
   *
   */
  readonly parties$ = this.partiesChange$.pipe(
    withLatestFrom(this.signaller.userId$),
    filter(([{ party }, userId]) => party.id !== userId),
    concatMap(async ([party, userId]) => {
      if (party.act === "add") {
        const n = await createParty(userId, party.party.id, this.signaller);
        return {
          party: n,
          act: party.act,
        } as const;
      } else {
        return {
          partyId: party.party.id,
          act: party.act,
        } as const;
      }
    }),
    scan((parties, nParty) => {
      if (nParty.act === "add") {
        nParty.party.sendReady(this._ready.getValue());
        return [...parties, nParty.party];
      } else {
        return parties.filter((p) => {
          const toRemove = p.partyId !== nParty.partyId;
          if (!toRemove) {
            p.cleanup();
          }
          return toRemove;
        });
      }
    }, [] as Party[]),
    shareReplay({
      bufferSize: 1,
      refCount: false,
    })
  );

  /**
   * This observable emits whenever all parties are ready to start the generation/decryption
   */
  readonly allReady$ = this.parties$
    .pipe(
      switchMap((parties) =>
        combineLatest([
          combineLatest(
            parties.map((p) =>
              p.ready$.pipe(map((ready) => ({ ready, party: p })))
            )
          ),
          this.signaller.userId$,
          this._ready,
        ])
      ),
      map(([states, userId]) => {
        if (this.isReady && states.every((s) => s.ready)) {
          if (!this.generationInProgress) {
            this.performAction(
              userId,
              states.map((p) => p.party)
            );
            this._generationInProgress = true;
            console.log("starting generation");
          }
          return true;
        }
        return false;
      }),
      filter((val) => val),
      first()
    )
    .subscribe();

  /**
   * Set the value for our own ready flag
   *
   * @param {boolean} ready
   */
  ready(ready: boolean) {
    this._ready.next(ready);
    this.parties$
      .pipe(first())
      .subscribe((parties) =>
        parties.forEach((p) => p.sendReady(ready, this.vrf))
      );
  }

  /**
   * Child classes will overrided this function to either generate keys, or decrypt votes
   *
   * @protected
   * @abstract
   * @param {string} userId
   * @param {Party[]} parties
   * @returns {*}
   */
  protected abstract performAction(userId: string, parties: Party[]): any;

  /**
   *
   */
  cleanup() {
    this.signaller.cleanup();
    this.parties$.pipe(first()).subscribe((ps) => {
      ps.forEach((p) => p.cleanup());
    });
  }
}

/**
 *
 *
 * @export
 * @class EncryptSession
 * @typedef {EncryptSession}
 * @extends {Session}
 */
export class EncryptSession extends Session {
  /**
   * Observable that emits the generated keys
   */
  readonly generatedKeys$ = new ReplaySubject<GeneratedKeys>();

  /**
   *
   * Generate the public/private keys using pallier algorithm.
   *
   * Also save these to local storage, and post the data to backend
   * which will save our public key to the database
   * @async
   * @param {string} userId
   * @param {Party[]} parties
   * @returns {*}
   */
  async performAction(userId: string, parties: Party[]) {
    startGeneration(userId, parties, keyLength, threshold).then((data) => {
      this.generatedKeys$.next(data);
      this.saveKeys(data, userId);
      window.localStorage.setItem(
        `parties:${this.sessionId}`,
        JSON.stringify(data.allParties)
      );
      console.log("finished generation" + data.allParties);
      if (data.isFirstParty) {
        return axios.put(BACKEND_URL + "/SessionData", {
          sessionId: this.sessionId,
          N: data.public.N.toString(16),
        });
      }
    });
  }

  /**
   * Save to local storage
   *
   * @private
   * @param {GeneratedKeys} data
   * @param {string} userId
   */
  private saveKeys(data: GeneratedKeys, userId: string) {
    window.localStorage.setItem(
      `keys:${this.sessionId}`,
      JSON.stringify({
        theta: data.public.theta.toString(),
        delta: data.public.delta.toString(),
        vk: data.public.vk.toString(),
        f: data.private.f.toString(),
        vki: data.private.vki.toString(),
        userId,
      })
    );
  }
}

/**
 *
 *
 * @export
 * @interface Tally
 * @typedef {Tally}
 */
export interface Tally {
  /**
   *
   *
   * @type {bigint[]}
   */
  encodings: bigint[];
}
/**
 *
 *
 * @export
 * @class DecryptSession
 * @typedef {DecryptSession}
 * @extends {Session}
 */
export class DecryptSession extends Session {
  /**
   *
   *
   * @readonly
   * @type {*}
   */
  readonly tally$ = new ReplaySubject<bigint[]>(1);
  /**
   *
   *
   * @readonly
   * @type {*}
   */
  readonly voteData$ = new ReplaySubject<
    {
      vote: bigint;
      y0: bigint;
      groupId: string;
      zkp: boolean;
      signature: boolean;
      token: string;
    }[]
  >(1);

  /**
   * Creates an instance of DecryptSession.
   *
   * @constructor
   * @param {Signaller} signaller
   * @param {string} sessionId
   * @param {bigint} delta
   * @param {bigint} theta
   * @param {bigint} vk
   * @param {bigint} fi
   * @param {bigint} vki
   */
  constructor(
    signaller: Signaller,
    sessionId: string,
    private readonly delta: bigint,
    private readonly theta: bigint,
    private readonly vk: bigint,
    private readonly fi: bigint,
    private readonly vki: bigint
  ) {
    super(signaller, sessionId);
  }

  /**
   *  Get votes from the backend, and verify them.
   *
   * If verification was successful, we can then decrypt the votes, and show the results to the user
   *
   * @async
   * @param {string} userId
   * @param {Party[]} parties
   * @returns {*}
   */
  async performAction(userId: string, parties: Party[]) {
    const { voteVerification, candidates, pubKey } = await getAndVerifyVotes(
      this.sessionId
    );

    this.voteData$.next(voteVerification);

    const partyNumbers = this.readPartyNumbers();
    const tallyarray: bigint[] = [];
    for (const vote of voteVerification) {
      const tally = await decrypt(
        vote.vote,
        userId,
        parties,
        partyNumbers,
        BigInt("0x" + pubKey),
        this.delta,
        this.theta,
        this.vk,
        this.fi,
        this.vki,
        candidates.map((c) => c.message),
        keyLength,
        threshold
      );

      console.log("tally", tally);
      tallyarray.push(tally!);
    }
    console.log("tallyarray", tallyarray);
    this.tally$.next(tallyarray);
  }

  /**
   *
   *
   * @private
   * @returns {{}}
   */
  private readPartyNumbers() {
    const d = window.localStorage.getItem(`parties:${this.sessionId}`);
    if (!d) {
      throw new Error("Party numbers not present in local storage!");
    }
    return JSON.parse(d) as { id: string; number: number }[];
  }
}

// Read from local storage and return the keys
/**
 *
 *
 * @export
 * @param {string} sessionId
 * @returns {{ theta: any; delta: any; vk: any; fi: any; vki: any; userId: string; }}
 */
export function readKeys(sessionId: string) {
  const s = window.localStorage.getItem(`keys:${sessionId}`);
  if (s) {
    const obj = JSON.parse(s);

    return {
      theta: BigInt(obj.theta),
      delta: BigInt(obj.delta),
      vk: BigInt(obj.vk),
      fi: BigInt(obj.f),
      vki: BigInt(obj.vki),
      userId: obj.userId as string,
    };
  }
  return null;
}

/**
 * Join an encryption session, and returns an instance of EncryptSession.
 *
 * @export
 * @async
 * @param {string} sessionId
 * @returns {unknown}
 */
export async function joinEncryptSession(sessionId: string) {
  const signaller = await createSignaller(sessionId + "/encrypt");
  return new EncryptSession(signaller, sessionId);
}

/**
 * Join a decryption session, and returns an instance of DecryptSession.
 *
 * @export
 * @async
 * @param {string} sessionId
 * @param {string} userId
 * @param {bigint} delta
 * @param {bigint} theta
 * @param {bigint} vk
 * @param {bigint} fi
 * @param {bigint} vki
 * @returns {unknown}
 */
export async function joinDecryptSession(
  sessionId: string,
  userId: string,
  delta: bigint,
  theta: bigint,
  vk: bigint,
  fi: bigint,
  vki: bigint
) {
  const signaller = await createSignaller(sessionId + "/decrypt", userId);
  return new DecryptSession(signaller, sessionId, delta, theta, vk, fi, vki);
}

/**
 * We get filtered and shuffled votes from the backend, and verify them.
 *
 * Verification includes verifying the lrs signature, and the zkp
 *
 * @export
 * @async
 * @param {string} sessionId
 * @param {number} [flag=0]
 * @returns {unknown}
 */
export async function getAndVerifyVotes(sessionId: string, flag = 0) {
  const { data } = await axios.get<any[]>(BACKEND_URL + "/Vote/" + sessionId);
  const conv = (arr: string[]) =>
    arr.map(
      (v) =>
        (v.startsWith("-") ? BigInt(-1) : BigInt(1)) *
        BigInt("0x" + v.replace("-", ""))
    );

  // Filtered + Shuffled votes:
  let votesToInclude: Set<string>;
  if (!flag) {
    const {
      data: { filteredData },
    } = await axios.get<FilterOneResponse>(BACKEND_URL + "/Vote/FilterOne");
    // // //create a set to speed lookup
    votesToInclude = new Set(filteredData.map((vote) => vote.vote.slice(2)));
    console.log("votesToInclude", votesToInclude);
  }

  //  VotesToInclude must have hex representation of the vote
  let votes;

  if (!flag) {
    votes = data
      .filter((v) => votesToInclude.has(v.vote))
      .map((v) => ({
        vote: BigInt("0x" + v.vote),
        groupId: v.groupId,
        y0: BigInt("0x" + v.y0),
        s: BigInt("0x" + v.s),
        c: (v.c as string[]).map((c: string) => BigInt("0x" + c)),
        proof: (v.proof as string[][]).map((pArr) => conv(pArr)),
        token: v.token,
      }));
  } else {
    votes = data.map((v) => ({
      vote: BigInt("0x" + v.vote),
      groupId: v.groupId,
      y0: BigInt("0x" + v.y0),
      s: BigInt("0x" + v.s),
      c: (v.c as string[]).map((c: string) => BigInt("0x" + c)),
      proof: (v.proof as string[][]).map((pArr) => conv(pArr)),
      token: v.token,
    }));
  }
  console.log("votes", { votes });

  const {
    data: { candidates: cand, pubKey },
  } = await axios.get(BACKEND_URL + "/SessionData/" + sessionId);

  const candidates = (cand as []).map((c: any) => ({
    title: c.title,
    message: BigInt("0x" + c.message),
  }));

  const { data: groupData } = await axios.get<{ [id: string]: string[] }>(
    BACKEND_URL + "/Vote/Voter"
  );

  const groups = Object.entries(groupData)
    .map(
      ([id, pubKeys]) => [id, pubKeys.map((key) => BigInt("0x" + key))] as const
    )
    .reduce((acc, [id, data]) => {
      acc[id] = data;
      return acc;
    }, {} as { [id: string]: bigint[] });

  const voteVerification = votes.map((vote) => {
    //verify signature
    const group = groups[vote.groupId];

    const sign = new Signature({
      value0: BigInteger(vote.y0),
      value1: BigInteger(vote.s),
      value2: vote.c.map((n: any) => BigInteger(n)),
    });

    const sigVerified = verifySignature(
      vote.vote,
      sign,
      group.map((k) => BigInteger(k))
    );

    const possibilities = messagePossibilities();
    //verify zkp
    const valid = verifyMembershipZkp(
      vote.vote,
      vote.proof as [bigint[], bigint[], bigint[]],
      possibilities,
      BigInt("0x" + pubKey)
    );

    return {
      vote: vote.vote,
      groupId: vote.groupId,
      y0: vote.y0,
      zkp: valid,
      signature: sigVerified,
      token: vote.token,
    };
  });

  return { voteVerification, candidates, pubKey };
}

/**
 *
 *
 * @export
 * @async
 * @returns {unknown}
 */
export async function GetLookUpTable() {
  const { data } = await axios.get<{ value: string; point: string }[]>(
    BACKEND_URL + "/Lookup"
  );
  return data;
}

export async function GetLookUpTableHash() {
  const { data } = await axios.get<string>(
    BACKEND_URL + "/Lookup/Hash"
  );
  return data;
}
