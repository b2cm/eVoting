import { Injectable } from '@nestjs/common';
import { Signature } from 'lrs';
import { DBService } from './db.service';
import bigInt, * as BigInteger from 'big-integer';
import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import { GenerateRandom } from 'elgammal';

/**
 *
 *
 * @type {{}}
 */
const groups = [
  '3dab9a0c-7ac6-46f8-93ad-659723058b38',

  'a0c4a4cb-e627-4afe-a9f3-2c7fbb4af1be',

  'cf3f9f79-bbbe-472c-bebb-13641d3d8328',

  'aa8e90c1-3889-4dfe-a083-af13717e68e2',

  'eb33a74b-e8b2-4ca0-9346-555d5c4ce043',
];

/**
 *
 *
 * @type {5}
 */
const groupLimit = 5;

/**
 *
 *
 * @export
 * @class SubmitVoteService
 * @typedef {SubmitVoteService}
 */
@Injectable()
export class SubmitVoteService {
  /**
   * Creates an instance of SubmitVoteService.
   *
   * @constructor
   * @param {DBService} db
   */
  constructor(private db: DBService) {}

  /**
   * Store the vote in the database
   *
   * @async
   * @param {string} sessionId
   * @param {bigint} ciphertext
   * @param {[bigint[], bigint[], bigint[]]} proof
   * @param {{
        y0: bigint;
        s: bigint;
        c: bigint[];
      }} signature
   * @param {string} groupId
   * @param {string} token
   * @returns {*}
   */
  async submitVote(
    sessionId: string,
    ciphertext: bigint,
    proof: [bigint[], bigint[], bigint[]],
    signature: {
      y0: bigint;
      s: bigint;
      c: bigint[];
    },
    groupId: string,
    // counter: bigint,
    // vid: bigint,
    token: string,
  ) {
    const sign = new Signature({
      value0: BigInteger(signature.y0),
      value1: BigInteger(signature.s),
      value2: signature.c.map((n) => BigInteger(n)),
    });

    await this.db.addVote(
      sessionId,
      ciphertext,
      sign,
      groupId,
      proof,
      // counter,
      // vid,
      token,
    );
  }

  /**
   * Get the votes for a session
   *
   * @async
   * @param {string} sessionId
   * @returns {unknown}
   */
  async getSessionVotes(sessionId: string) {
    const votes = await this.db.getSessionVotes(sessionId);

    return votes;
  }

  /**
   * Get voter by public key
   *
   * @async
   * @param {bigint} pubKey
   * @returns {unknown}
   */
  async getVoter(pubKey: bigint) {
    // *get hashID from pubKey
    const hashId = await this.db.getVoterHash(pubKey);
    // console.log('hashid', hashId?.Hash.toString());
    if (!hashId) return null;

    // *get tokens from hashID
    const tokens = await this.db.getTokens(hashId.Hash);
    // console.log("tokens",tokens);

    tokens.forEach((token) => {
      const HashedId = token.HashedId.toString();
      token.counter.toString();
      token.vid.toString();
    });
    //
    // * convert buffers to strings
    const formattedTokens = tokens.map((token) => ({
      HashedId: token.HashedId.toString(),
      counter: token.counter.toString(),
      vid: token.vid.toString(),
    }));

    formattedTokens.sort(function (a, b) {
      return parseInt(a.counter) - parseInt(b.counter);
    });

    return formattedTokens;
  }

  /**
   * Get all voter groups`
   *
   * @returns {*}
   */
  getVoterGroups() {
    return this.db.getGroups();
  }

  /**
   * Add a voter to a group
   * The group Id is decided randomly based on a predefined list of groups
   *
   * The randomness is there to ensure that there is an equal distribution of
   * voters in each group
   *
   * @async
   * @param {bigint} pubKey
   * @returns {unknown}
   */
  async addVoter(pubKey: bigint) {
    const dbGroups = await this.db.getGroups();
    const selectableGroups = groups.filter(
      (gid) => !dbGroups[gid] || dbGroups[gid].length < groupLimit,
    );
    const gIdx = Math.round(Math.random() * (selectableGroups.length - 1));
    const group = selectableGroups[gIdx];

    const Vid = GenerateRandom();
    // Initialize counter to a random number
    const counter = BigInt(Math.floor(Math.random() * 10000000).toString(10));

    return this.db.addVoter(pubKey, group, Vid, counter);
  }

  /**
   *
   *
   * @async
   * @param {string} hashid
   * @param {bigint} pubKey
   * @returns {unknown}
   */
  async addHashedId(hashid: string, pubKey: bigint) {
    return this.db.addHashedId(hashid, pubKey);
  }

  /**
   *
   *
   * @async
   * @param {string} sessionID
   * @returns {unknown}
   */
  async getKeys(sessionID: string) {
    const keys = this.db.getKeys(sessionID);
    // console.log(keys);
    return keys;
  }

  /**
   *
   *
   * @async
   * @param {string} partyID
   * @param {string} votes
   * @param {string} counters
   * @returns {*}
   */
  async storeFilteredVotes(partyID: string, votes: string, counters: string) {
    //console.log('filteredVotes',filteredVotes);
    //console.log('partyId in submit ', partyID);
    // console.log('votes', votes);
    await this.db.storeFilteredVotes(partyID, votes, counters);
  }

  /**
   * gets the filtered votes
   *
   * @async
   * @returns {unknown}
   */
  async getFilteredVotes() {
    const filteredVotes = await this.db.getFilteredVotes();
    console.log('filteredVotes', filteredVotes);

    return filteredVotes;
  }

  /**
   *
   *
   * @async
   * @param {string} publicKey
   * @returns {unknown}
   */
  async getEncryptedTokens(publicKey: string) {
    console.log('publicKey', publicKey);
    return await this.db.getEncryptedTokens(publicKey);
  }
}
