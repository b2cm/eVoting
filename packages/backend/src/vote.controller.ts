import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { SubmitVoteService } from './submit.service';
import { ElgammalEncrypt, Point, Generator, BITS } from 'elgammal';
import { toBigIntBE } from 'bigint-buffer';
import { LookUpservice } from './lookup.service';
import { Any } from 'typeorm';

@Controller('Vote')
export class VoteController {
  constructor(
    private voteService: SubmitVoteService,
    private LookUpService: LookUpservice,
  ) {}

  @Post()
  async submitVote(
    @Body()
    body: {
      pubKey: string;
      sessionId: string;
      ciphertext: string;
      proof: [string[], string[], string[]];
      signature: {
        y0: string;
        s: string;
        c: string[];
      };
      groupId: string;
      // counter: string;
      // vid: string;
      token: string;
    },
  ) {
    const conv = (arr: string[]) =>
      arr.map(
        (v) =>
          (v.startsWith('-') ? BigInt(-1) : BigInt(1)) *
          BigInt('0x' + v.replace('-', '')),
      );

    await this.voteService.submitVote(
      body.sessionId,
      BigInt('0x' + body.ciphertext),
      [conv(body.proof[0]), conv(body.proof[1]), conv(body.proof[2])],
      {
        y0: BigInt('0x' + body.signature.y0),
        s: BigInt('0x' + body.signature.s),
        c: body.signature.c.map((x) => BigInt('0x' + x)),
      },
      body.groupId,
      //  BigInt('0x' + body.counter),
      /// BigInt('0x' + body.vid),
      body.token,
    );
  }

  @Get('FilterVotes')
  async getFilteredVotes() {
    console.log('request received for filtered votes');
    return await this.voteService.getFilteredVotes();
  }

  @Get('FilterOne')
  async getFilteredOne() {
    console.log('request received for filtered one');
    const results = await this.voteService.getFilteredVotes();

    const parsed = JSON.parse(results[0].votes);
    console.log('parsed', parsed);
    const filteredData = parsed.map((vote: any) => ({ vote }));
    return filteredData;
  }

  //  this is what gets called from the vote page
  @Post('Voter/:pubkey')
  async getVoterData(
    @Param('pubkey') pubkey: string,
    @Body() body: { sessionId: string },
  ) {
    const tokens = await this.voteService.getVoter(BigInt('0x' + pubkey));
    if (!tokens) {
      //throw new NotFoundException('No voter found');
      console.log('No voter found');
    }
    //console.log('tokens', tokens);
    // //* map vids to EC
    // // convert vid to a point on the curve
    const vidP = Generator.multiplyCT(BigInt(tokens![0].vid));

    // //* map counters to EC
    const counterPoints = tokens!.map((n) =>
      Generator.multiplyCT(BigInt(n.counter)),
    );
    console.log('cpppp', counterPoints);

    const limit = counterPoints.length;

    // console.log('counterPoints', counterPoints);

    // //* get the public key of all tally servers
    //const pubKey = Point.fromCompressed(TALLY_SERVER_KEY);
    const keys = await this.voteService.getKeys(body.sessionId);

    const encryptedTokensAll = [];

    for (let j = 0; j < counterPoints.length; j++) {
      const encryptedTokens = [];
      for (let i = 0; i < keys.length; i++) {
        const TallypubKey = Point.fromCompressed(
          BigInt('0x' + keys[i].TallypubKey),
        );

        const encryptedVid = ElgammalEncrypt(TallypubKey, vidP)
          .map((n) => n.compressed.toString(16).padStart(BITS / 4 + 1))
          .join('');

        const encryptedCounter = ElgammalEncrypt(TallypubKey, counterPoints[j])
          .map((n) => n.compressed.toString(16).padStart(BITS / 4 + 1))
          .join('');
        encryptedTokens.push({
          vid: encryptedVid,
          partyId: keys[i].partyId,
          counter: encryptedCounter,
        });
      }
      encryptedTokensAll.push(encryptedTokens);
    }
    await Promise.all([
      ...counterPoints.map((counterP, index) => {
        return this.LookUpService.add(BigInt(tokens![index].counter), counterP);
      }),
      this.LookUpService.add(BigInt(tokens![0].vid), vidP),
    ]);

    return {
      publicKey: pubkey, //toBigIntBE(voter.pubKey).toString(16),
      tokens: encryptedTokensAll,
      // limit: limit,
    };
  }

  @Get('Voter')
  async getVoterGroups() {
    const groups = await this.voteService.getVoterGroups();
    for (const id in groups) {
      groups[id] = groups[id].map((n) => n.toString(16));
    }
    return groups;
  }

  @Post('getEncryptedTokens')
  async getEncryptedTokens(@Body() body: { publicKey: string }) {
    console.log('hitting API');
    const res = await this.voteService.getEncryptedTokens(body.publicKey);
    return res;
  }

  // * this has changed
  @Get(':sessionId')
  async getVotes(@Param('sessionId') sessionId: string) {
    console.log('here at wrong place');
    const v = await this.voteService.getSessionVotes(sessionId);

    return v.map((vote) => {
      return {
        vote: vote.vote.toString(16),
        groupId: vote.groupId,
        y0: vote.y0.toString(16),
        s: vote.s.toString(16),
        c: vote.c.map((c) => c.toString(16)),
        proof: vote.proof.map((pArr) => pArr.map((p) => p.toString(16))),
        // counter: vote.counter,
        // vid: vote.vid,
        token: vote.token,
      };
    });
  }

  @Post('Voter')
  async addVoter(@Body() body: { pubKey: string }) {
    const key = BigInt('0x' + body.pubKey);
    await this.voteService.addVoter(key);
    const groups = await this.voteService.getVoterGroups();
    for (const id in groups) {
      groups[id] = groups[id].map((n) => n.toString(16));
    }
    return groups;
  }

  @Post('HashedId')
  async addHashedId(@Body() body: { pubKey: string; hashedId: string }) {
    const key = BigInt('0x' + body.pubKey);
    console.log(body.pubKey);

    //console.log(body);
    await this.voteService.addHashedId(body.hashedId, key);
  }

  @Post('StoreFiltered')
  async storefilteredVotes(@Body() body: { partyID: string; votes: string }) {
    //console.log("request received")
    //console.log(body.partyID)
    await this.voteService.storeFilteredVotes(body.partyID, body.votes);
  }
}
