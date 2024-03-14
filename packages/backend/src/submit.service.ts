import { Injectable } from '@nestjs/common';
import { Signature } from 'lrs';
import { DBService } from './db.service';
import bigInt, * as BigInteger from 'big-integer';
import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import { GenerateRandom } from 'elgammal';

const groups = [
  '3dab9a0c-7ac6-46f8-93ad-659723058b38',

  'a0c4a4cb-e627-4afe-a9f3-2c7fbb4af1be',

  'cf3f9f79-bbbe-472c-bebb-13641d3d8328',

  'aa8e90c1-3889-4dfe-a083-af13717e68e2',

  'eb33a74b-e8b2-4ca0-9346-555d5c4ce043',
];

const groupLimit = 5;

@Injectable()
export class SubmitVoteService {
  constructor(private db: DBService) {}

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

  async getSessionVotes(sessionId: string) {
    const votes = await this.db.getSessionVotes(sessionId);

    return votes;
  }

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
    //  console.log('formattedTokens', formattedTokens);
    formattedTokens.sort(function (a, b) {
      return parseInt(a.counter) - parseInt(b.counter);
    });
    // console.log('sortedformattedTokens', formattedTokens);

    // if (voter) {
    //   const counter = toBigIntBE(voter.counter) + BigInt(1);
    //   voter.counter = toBufferBE(counter, 1024);
    //   await this.db.saveVoter(voter);
    // }

    return formattedTokens;
  }

  getVoterGroups() {
    return this.db.getGroups();
  }

  async addVoter(pubKey: bigint) {
    const dbGroups = await this.db.getGroups();
    const selectableGroups = groups.filter(
      (gid) => !dbGroups[gid] || dbGroups[gid].length < groupLimit,
    );
    const gIdx = Math.round(Math.random() * (selectableGroups.length - 1));
    const group = selectableGroups[gIdx];

    const Vid = GenerateRandom();
    const counter = BigInt(Math.floor(Math.random() * 10000000).toString(10));

    return this.db.addVoter(pubKey, group, Vid, counter);
  }

  async addHashedId(hashid: string, pubKey: bigint) {
    return this.db.addHashedId(hashid, pubKey);
  }

  async getKeys(sessionID: string) {
    const keys = this.db.getKeys(sessionID);
    // console.log(keys);
    return keys;
  }

  async storeFilteredVotes(partyID: string, votes: string) {
    //console.log('filteredVotes',filteredVotes);
    //console.log('partyId in submit ', partyID);
    // console.log('votes', votes);
    await this.db.storeFilteredVotes(partyID, votes);
  }

  async getFilteredVotes() {
    const filteredVotes = await this.db.getFilteredVotes();
    console.log('filteredVotes', filteredVotes);
    //const votesToReturn = {partyID:filteredVotes.partyID,

    return filteredVotes;
  }


  async getEncryptedTokens(publicKey: string) {
    console.log('publicKey', publicKey);
    return await this.db.getEncryptedTokens( publicKey);
  }
}
