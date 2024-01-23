import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { async } from 'rxjs';
import { AppService } from './app.service';
import { TALLY_SERVER_KEY } from './constants';
import { TALLY_SERVER_KEY_PRIV } from './constants';

/**
 *
 * @description App Controller
 * @export
 * @class AppController
 * @typedef {AppController}
 */
@Controller()
export class AppController {
  /**
   * Creates an instance of AppController.
   *
   * @constructor
   * @param {AppService} appService
   */
  constructor(private readonly appService: AppService) {}

  /**
   * @description Create a new session
   *
   * @returns {{ sessionId: string; }}
   */
  @Post('CreateSession')
  createSession() {
    const id = this.appService.createSession();

    return {
      sessionId: id,
    };
  }

  /**
   * @description Get the public key and candidates for a session
   *
   * @async
   * @param {string} sessionId
   * @returns {unknown}
   */
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

  /**
   * @description insert session details
   *
   * @async
   * @param {{ sessionId: string; N: string }} body
   * @returns {*}
   */
  @Put('SessionData')
  async putSessionData(@Body() body: { sessionId: string; N: string }) {
    await this.appService.addSessionDetails(
      body.sessionId,
      BigInt('0x' + body.N),
    );
  }

  /**
   * @description Get the Tally server public key
   *
   * @returns {{ TallyKey: string; }}
   */
  @Get('TallyServerPubKey')
  GetTallyServerPubKey() {
    return { TallyKey: TALLY_SERVER_KEY.toString(16) };
  }

  /**
   * @description 
   *  
   * @async
   * @param {{
        //userID is the partyId
        userId: string;
        pubKey: string;
        sessionId: string;
      }} body
   * @returns {*}
   */
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

  /**
   * @description Theres a party for generating the tokens and a party for counting the tokens
   * This is the function to set the counter limit against the hashedIDs
   *
   *
   * @async
   * @param {{ limit: number; HashedId: string }} body
   * @returns {*}
   */
  @Post('counterlimit')
  async setcounterlimit(@Body() body: { limit: number; HashedId: string }) {
    //console.log('body', body.limit, body.HashedId);
    await this.appService.counterlimit(body.limit, body.HashedId);
  }

  /**
   *
   *
   * @async
   * @returns {unknown}
   */
  @Get('getCounterlimit')
  async getcounterlimit() {
    const res = await this.appService.getcounterlimit();
    const limits = res.map((element: any) => element.limit);
    const HashIds = res.map((element: any) => element.HashedId.toString());
    return { limits: limits, HashIds: HashIds };
  }

  /**
   *
   *
   * @async
   * @param {{ flag: number }} body
   * @returns {*}
   */
  @Post('SetTriggerVal')
  async setTriggerVal(@Body() body: { flag: number }) {
    console.log('body', body.flag);
    await this.appService.setTriggerVal(body.flag);
  }

  /**
   * @description This trigger value represents
   * when the party has generated the tokens and is ready to send them to the tally server
   *
   *
   * @async
   * @returns {unknown}
   */
  @Get('TriggerVal')
  async getTriggerVal() {
    const result = await this.appService.getTriggerVal();
    return { result: result };
  }
  /**
   *
   *
   * @async
   * @returns {unknown}
   */
  @Get('TokenTriggerVal')
  async getTokenTriggerVal() {
    const result = await this.appService.getTokenTriggerVal();
    return { result: result };
  }

  /**
   * @description
   * {
   * token refers to counter and vid
   * }
   *
   * @async
   * @param {{ flag: number }} body
   * @returns {*}
   */
  @Post('SetTokenTriggerVal')
  async setTokenTriggerVal(@Body() body: { flag: number }) {
    console.log('body', body.flag);
    await this.appService.setTokenTriggerVal(body.flag);
  }

  /**
   *
   *
   * @async
   * @param {{ vid: string; HashedId: string; counter: string }} body
   * @returns {*}
   */
  @Post('StoreTokens')
  async storeTokens(
    @Body() body: { vid: string; HashedId: string; counter: string },
  ) {
    //console.log('body', body.vid, body.HashedId, body.counter);
    await this.appService.storeTokens(body.vid, body.HashedId, body.counter);
  }

  /**
   * { use cases for where tokens are encrypted }
   *
   * @async
   * @param {{ encryptedTokens: any[] }} body
   * @returns {*}
   */
  @Post('StoreEncryptedTokens')
  async storeEncryptedTokens(@Body() body: { encryptedTokens: any[] }) {
    //console.log('body', body.vid, body.HashedId, body.counter);
    // console.log('received encrypted tokens', body.encryptedTokens);

    await this.appService.storeEncryptedTokens(body.encryptedTokens);
  }

  // get all the tokens
  /**
   *
   *
   * @async
   * @returns {unknown}
   */
  @Get('getTokensAll')
  async getTokens() {
    const res = await this.appService.getTokens();
    return { tokens: res };
  }
}
