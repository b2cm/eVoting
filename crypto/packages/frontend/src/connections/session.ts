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

const keyLength = 80n;
const threshold = 2;

export abstract class Session {
  private _ready = new BehaviorSubject(false);
  private _generationInProgress = false;
  private _vrf: any;

  get userId$() {
    return this.signaller.userId$;
  }

  get isReady() {
    return this._ready.getValue();
  }

  get vrf() {
    return this._vrf;
  }

  get generationInProgress() {
    return this._generationInProgress;
  }

  constructor(
    private signaller: Signaller,
    protected readonly sessionId: string
  ) {
    this._vrf = VrfGenerator();
  }

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

  ready(ready: boolean) {
    this._ready.next(ready);
    this.parties$
      .pipe(first())
      .subscribe((parties) => parties.forEach((p) => p.sendReady(ready, this.vrf)));
  }

  protected abstract performAction(userId: string, parties: Party[]): any;

  cleanup() { 
    this.signaller.cleanup();
    this.parties$.pipe(first()).subscribe((ps) => {
      ps.forEach((p) => p.cleanup());
    });
  }
}

export class EncryptSession extends Session {
  readonly generatedKeys$ = new ReplaySubject<GeneratedKeys>();

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

  // Save to local storage
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

export interface Tally {
  name: string;
  message: bigint;
  votes: number;
}
export class DecryptSession extends Session {
  readonly tally$ = new ReplaySubject<Tally[]>(1);
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

  async performAction(userId: string, parties: Party[]) {
    const { voteVerification, candidates, pubKey } = await getAndVerifyVotes(
      this.sessionId
    );

    this.voteData$.next(voteVerification);

    const combinedVotes = voteVerification
      .filter((vote) => vote.signature && vote.zkp)
      .reduce((existing, vote) => combineCiphertext(existing, vote.vote), 1n);

    const partyNumbers = this.readPartyNumbers();

    const tally = await decrypt(
      combinedVotes,
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

    console.log({ tally });

    this.tally$.next(
      tally.map((t) => ({
        message: t.candidate,
        votes: Number.parseInt(t.votes.toString()),
        name: candidates.find((c) => c.message === t.candidate)?.title,
      }))
    );
  }

  private readPartyNumbers() {
    const d = window.localStorage.getItem(`parties:${this.sessionId}`);
    if (!d) {
      throw new Error("Party numbers not present in local storage!");
    }
    return JSON.parse(d) as { id: string; number: number }[];
  }
}

// Read from local storage and return the keys
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

// Create a new session
export async function joinEncryptSession(sessionId: string) {
  const signaller = await createSignaller(sessionId + "/encrypt");
  return new EncryptSession(signaller, sessionId);
}

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
    const { data: filteredData } = await axios.get<{ vote: string }[]>(
      BACKEND_URL + "/Vote/FilterOne"
    );
    // // //create a set to speed lookup
    votesToInclude = new Set(filteredData.map((vote) => vote.vote.slice(2)));

    console.log("votesToInclude", votesToInclude);
    console.log("dataFilter", filteredData);
    console.log("dataoldd", data);
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
        //  counter: v.counter,
        //  voterID: v.vid,
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
      //  counter: v.counter,
      //  voterID: v.vid,
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

    //verify zkp
    const valid = verifyMembershipZkp(
      vote.vote,
      vote.proof as [bigint[], bigint[], bigint[]],
      candidates.map((c) => c.message),
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

export async function GetLookUpTable() {
  const { data } = await axios.get<{ value: string; point: string }[]>(
    BACKEND_URL + "/Lookup"
  );
  return data;
}
