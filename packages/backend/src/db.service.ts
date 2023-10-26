import { Injectable } from '@nestjs/common';
import { toBufferBE, toBigIntBE } from 'bigint-buffer';
import { Signature } from 'lrs';
import { Connection, In, Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { Voter } from './entities/voter.entity';
import { pubkeys } from './entities/pubkeys.entity';
import { HashedId } from './entities/HashedId.entity';
import { Proof, SignatureC, Vote } from './entities/vote.entity';
import * as BigInteger from 'big-integer';
import { Trigger } from './entities/trigger.entity';
import { Token } from './entities/tokens.entity';
import { Limit } from './entities/limit.entity';
import { FilteredVotes } from './entities/FilteredVotes.entity';
import { TokenTrigger } from './entities/TokenTrigger.entity';
import { encryptedTokens } from './entities/encryptedTokens.entity';

/**
 * Service for interacting with the database
 */
@Injectable()
export class DBService {
  /**
   * Creates an instance of DBService.
   *
   * @constructor
   * @param {Repository<Session>} sessionRep
   * @param {Repository<Candidate>} candRep
   * @param {Repository<Voter>} voterRep
   * @param {Repository<Vote>} voteRep
   * @param {Repository<pubkeys>} pubkeysRep
   * @param {Repository<HashedId>} hashedIdRep
   * @param {Repository<Trigger>} triggerRep
   * @param {Repository<TokenTrigger>} tokenTriggerRep
   * @param {Repository<Token>} tokensRep
   * @param {Repository<Limit>} limitRep
   * @param {Repository<encryptedTokens>} encryptedTokensRep
   * @param {Repository<FilteredVotes>} filteredVotesRep
   * @param {Connection} connection
   */
  constructor(
    @InjectRepository(Session) private sessionRep: Repository<Session>,
    @InjectRepository(Candidate) private candRep: Repository<Candidate>,

    //Votes  and voter Repositories
    @InjectRepository(Voter) private voterRep: Repository<Voter>,
    @InjectRepository(Vote) private voteRep: Repository<Vote>,

    //pubkeys Repository
    @InjectRepository(pubkeys) private pubkeysRep: Repository<pubkeys>,

    //HashedId Repository from keygen
    @InjectRepository(HashedId) private hashedIdRep: Repository<HashedId>,

    //Trigger Repository
    @InjectRepository(Trigger) private triggerRep: Repository<Trigger>,

    //TokensTrigger Repository
    @InjectRepository(TokenTrigger)
    private tokenTriggerRep: Repository<TokenTrigger>,

    //Tokens Repository
    @InjectRepository(Token) private tokensRep: Repository<Token>,

    //Limit Repository
    @InjectRepository(Limit) private limitRep: Repository<Limit>,

    @InjectRepository(encryptedTokens)
    private encryptedTokensRep: Repository<encryptedTokens>,

    //Filtered Votes Repository
    @InjectRepository(FilteredVotes)
    private filteredVotesRep: Repository<FilteredVotes>,

    private connection: Connection,
  ) {}

  /**
   * @description add the session to the database
   *
   * @async
   * @param {string} id
   * @param {bigint} pubKey
   * @param {{ name: string; message: bigint }[]} candidates
   * @returns {*}
   */
  async addSession(
    id: string,
    pubKey: bigint,
    candidates: { name: string; message: bigint }[],
  ) {
    const sesEntity = new Session();
    sesEntity.id = id;
    sesEntity.pubKey = toBufferBE(pubKey, 64);

    await this.sessionRep.insert(sesEntity);

    const candidateEntities = candidates.map((c) => {
      const ent = new Candidate();
      ent.message = toBufferBE(c.message, 64);
      ent.name = c.name;
      ent.session = sesEntity;
      return ent;
    });

    await this.candRep.insert(candidateEntities);
  }

  /**
   * @description get the session details from the database
   *
   * @param {string} sessionId
   * @return {*}
   * @memberof DBService
   */
  async getSessionDetails(sessionId: string) {
    const session = await this.sessionRep.findOne(sessionId, {
      relations: ['candidates'],
    });

    if (!session) {
      throw new Error('Session Not created');
    }

    return {
      pubKey: toBigIntBE(session.pubKey),
      candidates: session.candidates.map((c) => ({
        title: c.name,
        message: toBigIntBE(c.message),
      })),
    };
  }

  /**
   * Get all voters from the databse and group them by group id
   * This is done to help with lrs: with smaller ring size,
   * we get faster signature and verification times
   *
   * So each voter will sign their vote with the public keys of
   * only the voters in their group
   *
   * @async
   * @returns {unknown}
   */
  async getGroups() {
    const voters = await this.voterRep.find();

    let groups = {} as { [id: string]: any[] };

    for (const voter of voters) {
      const id = voter.groupId;
      if (!groups[id]) {
        groups[id] = [];
      }
      groups[id].push([voter.id, toBigIntBE(voter.pubKey)]);
    }

    for (const id in groups) {
      groups[id] = groups[id]
        .sort(([idx1], [idx2]) => idx1 - idx2)
        .map(([_, key]) => key);
    }

    return groups;
  }

  /**
   * Get a single voter from db based on their public key
   *
   * @param {bigint} pubKey
   * @returns {*}
   */
  getVoter(pubKey: bigint) {
    return this.voterRep.findOne({
      pubKey: toBufferBE(pubKey, 1024),
    });
  }
  /**
   *
   *
   * @param {bigint} pubKey
   * @returns {*}
   */
  getVoterHash(pubKey: bigint) {
    return this.hashedIdRep.findOne({
      where: { PubKey: toBufferBE(pubKey, 1024) },
    });
  }

  /**
   *
   * @description get the tokens from the database
   * @param {Buffer} hashedId
   * @return {*}
   * @memberof DBService
   */
  getTokens(hashedId: Buffer) {
    return this.tokensRep.find({
      where: { HashedId: hashedId },
    });
  }

  /**
   * @description  This is used on the keygen page whwere we need to get the public key of the voter
   *
   * @param {Voter} vote
   * @return {*}
   * @memberof DBService
   * */

  async saveVoter(voter: Voter) {
    await this.voterRep.update(
      {
        pubKey: voter.pubKey,
      },
      voter,
    );
  }

  /**
   * Add a voter to database
   *
   * @async
   * @param {bigint} key Voter public key
   * @param {string} groupId
   * @param {bigint} Vid
   * @param {bigint} counter
   * @returns {*}
   */
  async addVoter(key: bigint, groupId: string, Vid: bigint, counter: bigint) {
    const voter = new Voter();

    voter.groupId = groupId;
    voter.pubKey = toBufferBE(key, 1024);
    voter.counter = toBufferBE(counter, 1024);
    voter.voterID = toBufferBE(Vid, 1024);

    await this.voterRep.insert(voter);
  }

  /**
   * Algorithm for submitting a vote
   * We transform the data into db entities and insert into relevant tables
   *
   *
   * @param {string} sessionId
   * @param {bigint} vote
   * @param {Signature} signature
   * @param {string} groupId
   * @param {[bigint[], bigint[], bigint[]]} proof
   * @param {string} token
   * @memberof DBService
   */
  async addVote(
    sessionId: string,
    vote: bigint,
    signature: Signature,
    groupId: string,
    proof: [bigint[], bigint[], bigint[]],
    //  counter: bigint,
    // vid: bigint,
    token: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const voteEnt = new Vote();
      voteEnt.sessionId = sessionId;
      voteEnt.vote = toBufferBE(vote, 1024);
      voteEnt.y0 = toBufferBE((signature.y0 as any).value, 1024);
      voteEnt.s = toBufferBE((signature.s as any).value, 1024);
      voteEnt.groupId = groupId;
      voteEnt.token = Buffer.from(token);
      // voteEnt.counter = toBufferBE(counter, 1024);
      // voteEnt.voterID = toBufferBE(vid, 1024);

      await queryRunner.manager.insert(Vote, voteEnt);

      const cEnts = signature.c.map((c) => {
        const cEnt = new SignatureC();
        cEnt.c = toBufferBE((c as any).value, 1024);
        cEnt.vote = voteEnt;
        return cEnt;
      });

      await queryRunner.manager.insert(SignatureC, cEnts);

      const proofs = proof.flat().map((p, ind) => {
        const pEnt = new Proof();
        pEnt.p = toBufferBE((BigInteger(p).abs() as any).value, 1024);
        pEnt.sign = p < BigInt(0) ? -1 : 1;
        pEnt.vote = voteEnt;
        pEnt.order = ind;
        return pEnt;
      });

      await queryRunner.manager.insert(Proof, proofs);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get all votes for a session
   *
   * @param {string} sessionId
   * @return {*}
   * @memberof DBService
   */
  async getSessionVotes(sessionId: string) {
    const votes = await this.voteRep.find({
      where: {
        sessionId,
      },
      relations: ['proofs', 'c'],
    });

    if (votes.length == 0) {
      //throw new Error('Session does not exist');
      console.log('Session does not exist');
    }

    return votes.map((vote) => {
      const y0 = toBigIntBE(vote.y0);

      const proof: bigint[][] = [];
      let currProof: bigint[] = [];
      const nProofs = vote.proofs.length / 3;
      vote.proofs.sort((a, b) => a.order - b.order);
      for (const p of vote.proofs) {
        const baseNumber = toBigIntBE(p.p);
        let proofNumber: bigint;
        if (p.sign < 1) {
          proofNumber = baseNumber * BigInt(-1);
        } else {
          proofNumber = baseNumber;
        }
        currProof.push(proofNumber);
        if (currProof.length >= nProofs) {
          proof.push(currProof);
          currProof = [];
        }
      }

      return {
        vote: toBigIntBE(vote.vote),
        y0,
        s: toBigIntBE(vote.s),
        c: vote.c.sort((a, b) => a.idx - b.idx).map((c) => toBigIntBE(c.c)),
        proof,
        groupId: vote.groupId,
        token: vote.token.toString(),
      };
    });
  }

  /**
   *
   *
   * @async
   * @param {string} partyId
   * @param {string} pubKey
   * @param {string} sessionID
   * @returns {*}
   */
  async submitKey(partyId: string, pubKey: string, sessionID: string) {
    const partykey = new pubkeys();
    partykey.partyid = Buffer.from(partyId);
    partykey.Tallypubkey = toBufferBE(BigInt('0x' + pubKey), 1024);
    partykey.sessionId = Buffer.from(sessionID);

    //console.log('partykey', partykey);
    await this.pubkeysRep.insert(partykey);
  }

  /**
   *
   *
   * @async
   * @param {string} hashedId
   * @param {bigint} pubKey
   * @returns {*}
   */
  async addHashedId(hashedId: string, pubKey: bigint) {
    const hashedIdEnt = new HashedId();
    hashedIdEnt.Hash = Buffer.from(hashedId);
    hashedIdEnt.PubKey = toBufferBE(pubKey, 1024);
    // console.log('hashedIdEnt', hashedId);
    // console.log('pubkey', pubKey);

    await this.hashedIdRep.insert(hashedIdEnt);
  }

  /**
   *
   *
   * @async
   * @param {number} limit
   * @param {string} HashedId
   * @returns {*}
   */
  async counterlimit(limit: number, HashedId: string) {
    const rows = await this.limitRep.find();
    if (rows.length == 15) {
      console.log('limit reached');
      return;
    } else {
      const counterlimit = new Limit();
      counterlimit.limit = limit;
      counterlimit.HashedId = Buffer.from(HashedId);

      await this.limitRep.insert(counterlimit);
    }
  }

  // dbrepo.find({ where: { userId } });

  /**
   *
   *
   * @async
   * @returns {unknown}
   */
  async getcounterlimit() {
    const limit = await this.limitRep.find();
    // console.log('limit', limit);
    return limit;
  }

  /**
   *
   *
   * @async
   * @returns {unknown}
   */
  async getTriggerVal() {
    const trigger = await this.triggerRep.find();
    console.log('gettrigger', trigger);
    if (trigger.length == 0) {
      return 0;
    } else return 1;
  }

  /**
   *
   *
   * @param {number} flag
   * @memberof DBService
   */
  async setTriggerVal(flag: number) {
    const result = await this.getTriggerVal();
    console.log('result', result);
    if (result == 1) {
      console.log('updating');
      await this.triggerRep.update({ name: 'limitset' }, { val: flag });
    } else {
      console.log('creating trigger');
      const trigger = new Trigger();
      trigger.name = 'limitset';
      trigger.val = flag;
      await this.triggerRep.insert(trigger);
    }
  }

  /**
   * This is used to store the tokens in the database generated by the token geneeration party
   *
   * @async
   * @param {string} vid
   * @param {string} HashedId
   * @param {string} counter
   * @returns {*}
   */
  async storeTokens(vid: string, HashedId: string, counter: string) {
    const token = new Token();
    token.vid = Buffer.from(vid);
    token.HashedId = Buffer.from(HashedId);
    token.counter = Buffer.from(counter);
    await this.tokensRep.insert(token);
  }

  /**
   * Fucntion to retrieve The tally server key
   *
   * @async
   * @param {string} sessionID
   * @returns {unknown}
   */
  async getKeys(sessionID: string) {
    const keys = await this.pubkeysRep.find({
      where: {
        sessionId: Buffer.from(sessionID),
      },
    });

    return keys.map((key) => {
      return {
        partyId: key.partyid.toString(),
        TallypubKey: toBigIntBE(key.Tallypubkey).toString(16),
      };
    });
  }

  /**
   * This function stores the filtering results in the database
   *
   * @async
   * @param {string} partyID
   * @param {string} votes
   * @param {string} counters
   * @returns {*}
   */
  async storeFilteredVotes(partyID: string, votes: string, counters: string) {
    //console.log('partyID', partyID);
    //console.log('votes', votes);
    const filteredVotes = new FilteredVotes();
    filteredVotes.partyID = Buffer.from(partyID);
    filteredVotes.votes = Buffer.from(votes);
    filteredVotes.counters = Buffer.from(counters);
    await this.filteredVotesRep.insert(filteredVotes);

    // const votee= this.getFilteredVotes();
    // console.log('votee', votee);
  }

  /**
   *
   *
   * @async
   * @returns {unknown}
   */
  async getFilteredVotes() {
    const votes = await this.filteredVotesRep.find();
    console.log('Allvotes', votes);
    return votes.map((vote) => {
      return {
        partyID: vote.partyID.toString(),
        votes: vote.votes.toString(),
        counters: vote.counters.toString(),
      };
    });
  }
  /**
   *
   * Function to get the trigger value for token generation
   *
   * @async
   * @returns {number}
   */
  async getTokenTriggerVal() {
    const trigger = await this.tokenTriggerRep.find();
    console.log('get trigger token', trigger);
    if (trigger.length == 0) {
      return 0;
    } else return 1;
  }

  /**
   * The token generate party sets the trigger value to 1 when it has generated all the tokens
   *
   * @async
   * @param {number} flag
   * @returns {*}
   */
  async setTokenTriggerVal(flag: number) {
    const result = await this.getTokenTriggerVal();
    console.log('result', result);
    if (result == 1) {
      console.log('updating token Trigger Value');
      await this.tokenTriggerRep.update({ name: 'limitset' }, { val: flag });
    } else {
      console.log('creating trigger');
      const trigger = new TokenTrigger();
      trigger.name = 'limitset';
      trigger.val = flag;
      await this.tokenTriggerRep.insert(trigger);
    }
  }

  /**
   *
   * Function to get all the tokens from the database
   * Used by parties to encrypt the tokens
   *
   * @async
   * @returns {unknown}
   */
  async getTokensAll() {
    const tokens = await this.tokensRep.find();
    const allTokens = tokens.map((token) => {
      return {
        vid: token.vid.toString(),
        HashedId: token.HashedId.toString(),
        counter: token.counter.toString(),
      };
    });

    let groupedTokens: any[] = [];
    // group by vid and put counters in an array

    allTokens.forEach((token) => {
      const index = groupedTokens.findIndex(
        (element) => element.vid == token.vid,
      );
      if (index == -1) {
        groupedTokens.push({
          vid: token.vid,
          counters: [token.counter],
          HashedId: token.HashedId,
        });
      } else {
        groupedTokens[index].counters.push(token.counter);
      }
    });

    // sort it by counters
    groupedTokens.forEach((token) => {
      token.counters.sort(function (a: string, b: string) {
        return parseInt(a) - parseInt(b);
      });
    });
    console.log('groupedTokens', groupedTokens);
    return groupedTokens;
  }

  /**
   * Store the encrypted tokens in the database
   *
   * @async
   * @param {any[]} tokens
   * @returns {*}
   */
  async storeEncryptedTokens(tokens: any[]) {
    //console.log('tokens', tokens);
    await Promise.all(
      tokens.map(async (token) => {
        console.log('storing token', token);
        const tokenToStore = new encryptedTokens();
        tokenToStore.encryptedCounter = Buffer.from(token.counter!);
        tokenToStore.encryptedVid = Buffer.from(token.vid);
        tokenToStore.HashedId = Buffer.from(token.HashedId);
        tokenToStore.signature = Buffer.from(token.signature);
        tokenToStore.counterIndex = token.counterIndex;
        tokenToStore.pubkey = token.pubkey;
        await this.encryptedTokensRep.insert(token);
      }),
    );

    const encTokens = await this.encryptedTokensRep.find();
    console.log('encTokens', encTokens.length);
  }

  /**
   *
   *
   * @async
   * @param {string} pubKey
   * @returns {unknown}
   */
  async getEncryptedTokens(pubKey: string) {
    const hash = await this.getVoterHash(BigInt('0x' + pubKey));
    console.log('hash', hash);
    const tokens = await this.encryptedTokensRep.find({});
    console.log('tokens from the vote page ', tokens);

    return tokens.map((token) => {
      return {
        encryptedCounter: token.encryptedCounter.toString(),
        encryptedVid: token.encryptedVid.toString(),
        signature: token.signature.toString(),
        counterIndex: token.counterIndex,
        pubkey: token.pubkey,
      };
    });
  }
}

/**
 * import { InsertQueryBuilder } from 'typeorm';

const user = new User();
user.name = 'John';
user.age = 30;

const queryBuilder = new InsertQueryBuilder();
await queryBuilder
  .into(User)
  .values(user)
  .execute();


  import { UpdateQueryBuilder } from 'typeorm';

const queryBuilder = new UpdateQueryBuilder();
await queryBuilder
  .update(User)
  .set({ age: 31 })
  .where('name = :name', { name: 'John' })
  .execute();

 * 
 * 
 * 
 * 
 */
