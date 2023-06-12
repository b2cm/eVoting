import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { async } from 'rxjs';
import { AppService } from './app.service';
import { TALLY_SERVER_KEY } from './constants';
import { TALLY_SERVER_KEY_PRIV } from './constants';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('CreateSession')
  createSession() {
    const id = this.appService.createSession();

    return {
      sessionId: id,
    };
  }

  @Get('SessionData/:sessionId')
  async getSessionData(@Param('sessionId') sessionId: string) {
    const { pubKey, candidates } = await this.appService.getSessionDetails(
      sessionId,
    );

    return {
      pubKey: pubKey.toString(16),
      candidates: candidates.map((c) => ({
        ...c,
        message: c.message.toString(16),
      })),
    };
  }

  @Put('SessionData')
  async putSessionData(@Body() body: { sessionId: string; N: string }) {
    await this.appService.addSessionDetails(
      body.sessionId,
      BigInt('0x' + body.N),
    );
  }

  @Get('TallyServerPubKey')
  GetTallyServerPubKey() {
    return { TallyKey: TALLY_SERVER_KEY.toString(16) };
  }

  @Get('TallyServerPrivKey')
  GetTallyServerPrivKey() {
    return { TallyPrivKey: TALLY_SERVER_KEY_PRIV };
  }

  @Post('Submitkey')
  async submitKey(
    @Body()
    body: {
      //userID is the partyId
      userId: string;
      pubKey: string;
      sessionId: string;
    },
  ) {
    //console.log('body', body.userId, BigInt('0x' + body.pubKey).toString(16));
    await this.appService.submitKey(body.userId, body.pubKey, body.sessionId);
  }

  @Post('counterlimit')
  async setcounterlimit(@Body() body: { limit: number; HashedId: string }) {
    //console.log('body', body.limit, body.HashedId);
    await this.appService.counterlimit(body.limit, body.HashedId);
  }

  @Get('getCounterlimit')
  async getcounterlimit() {
    const res = await this.appService.getcounterlimit();
    const limits = res.map((element: any) => element.limit);
    const HashIds = res.map((element: any) => element.HashedId.toString());
    return { limits: limits, HashIds: HashIds };
  }

  @Post('SetTriggerVal')
  async setTriggerVal(@Body() body: { flag: number }) {
    console.log('body', body.flag);
    await this.appService.setTriggerVal(body.flag);
  }

  @Get('TriggerVal')
  async getTriggerVal() {
    const result = await this.appService.getTriggerVal();
    return { result: result };
  }
  @Get('TokenTriggerVal')
  async getTokenTriggerVal() {
    const result = await this.appService.getTokenTriggerVal();
    return { result: result };
  }

  @Post('SetTokenTriggerVal')
  async setTokenTriggerVal(@Body() body: { flag: number }) {
    console.log('body', body.flag);
    await this.appService.setTokenTriggerVal(body.flag);
  }

  @Post('StoreTokens')
  async storeTokens(
    @Body() body: { vid: string; HashedId: string; counter: string },
  ) {
    //console.log('body', body.vid, body.HashedId, body.counter);
    await this.appService.storeTokens(body.vid, body.HashedId, body.counter);
  }


  @Post('StoreEncryptedTokens')
  async storeEncryptedTokens(
    @Body() body: { encryptedTokens: any[] },
  ) {
    //console.log('body', body.vid, body.HashedId, body.counter);
   // console.log('received encrypted tokens', body.encryptedTokens);


    await this.appService.storeEncryptedTokens(body.encryptedTokens);
  }


 // get all the tokens 
  @Get('getTokensAll')
  async getTokens() {
  
    const res = await this.appService.getTokens();
    return { tokens : res };
  }

  // Inform the election parties that the registration period ended, so they can start generate the countera  and limmits for voters
  @Post('RegistrationEnded')
  async registrationEnded() {

  }

  @Get('getHashedIDs')
  async getHashedIDs() {
    const hashedIDs = await this.appService.getHashedIDs();
    return { hashedIDs };
  }

  @Get('getLRSGroup')
  async getLRSGroup() {
    const group = await this.appService.getLRSGroup();
    return { group };
  }

  @Get('getVotes')
  async getVotes(
    @Body() body: { voteID: string}
  ) {
    const votes = await this.appService.getVotes(body.voteID);
    return { votes };
  }

  

}
