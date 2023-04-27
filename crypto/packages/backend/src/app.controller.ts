import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
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
    //console.log('body', body.HashedId);
    
    
      const res= await this.appService.getcounterlimit();
      const limits = res.map((element: any) => element.limit);
      const HashIds = res.map((element: any) => element.HashedId.toString());
      //console.log('res',res);
      //console.log('limits',limits);
      //console.log('HashIds',HashIds);
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

  @Post('StoreTokens')
  async storeTokens(
    @Body() body: { vid: string; HashedId: string; counter: string },
  ) {
    //console.log('body', body.vid, body.HashedId, body.counter);
    await this.appService.storeTokens(body.vid, body.HashedId, body.counter);
  }

 

  
}
