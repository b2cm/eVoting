import { Injectable } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';
import { Socket } from 'socket.io';
import { updateBehaviorSubject } from './utils';
import { v4 as UUID } from 'uuid';
import { DBService } from './db.service';

/**
 *
 *
 * @export
 * @interface Session
 * @typedef {Session}
 */
export interface Session {
  /**
   * 
   *
   * @type {{
      socket: Socket;
      id: string;
    }[]}
   */
  parties: {
    socket: Socket;
    id: string;
  }[];
}

/**
 *
 *
 * @export
 * @class AppService
 * @typedef {AppService}
 */
@Injectable()
export class AppService {
  /**
   *
   *
   * @readonly
   * @type {*}
   */
  readonly sessions = new BehaviorSubject(new Map() as Map<string, Session>);

  /**
   * Creates an instance of AppService.
   *
   * @constructor
   * @param {DBService} db
   */
  constructor(private db: DBService) {}

  /**
   * Create a new session
   * Session constitutes of the following entities:
   * 1. Parties
   * 2. Session Id
   * 3. Public Key
   * 4. A websocket room for the parties to communicate
   *
   * @returns {*}
   */
  createSession() {
    const id = UUID();
    const s = this.sessions.getValue();
    s.set(id + '/encrypt', { parties: [] });
    s.set(id + '/decrypt', { parties: [] });
    this.sessions.next(s);
    return id;
  }

  /**
   * Check if a session exists
   *
   * @param {string} id
   * @returns {*}
   */
  hasSession(id: string) {
    return this.sessions.getValue().has(id);
  }

  /**
   * Add a party to the session.
   * This allows the server to broadcast messages to this party along with others
   *
   * @param {string} sessionId
   * @param {Socket} sock
   * @param {?string} [userId]
   * @returns {{ id: string; socket: Socket; }}
   */
  addParty(sessionId: string, sock: Socket, userId?: string) {
    const uId = userId || UUID();

    const p = {
      id: uId,
      socket: sock,
    };

    updateBehaviorSubject(this.sessions, (s) => {
      let session = s.get(sessionId);
      if (!session) {
        if (!sessionId.endsWith('decrypt')) {
          return s;
        }
        session = {
          parties: [],
        };
        s.set(sessionId, session);
      }

      session.parties.push(p);

      return s;
    });

    return p;
  }

  /**
   * Add session info to the database
   * This includes the session id, public key and candidates
   *
   * @async
   * @param {string} sessionId
   * @param {bigint} pubKey
   * @returns {*}
   */
  async addSessionDetails(sessionId: string, pubKey: bigint) {
    const b = BigInt(50);
    let pow = BigInt(0);
    const candidates = Array(3)
      .fill({})
      .map((_, idx) => {
        const message = b ** pow;
        pow++;
        return {
          name: 'Candidate ' + (idx + 1),
          message,
        };
      });

    await this.db.addSession(sessionId, pubKey, candidates);
  }

  /**
   *
   *
   * @async
   * @param {string} sessionId
   * @returns {unknown}
   */
  async getSessionDetails(sessionId: string) {
    return await this.db.getSessionDetails(sessionId);
  }

  /**
   * Whenever a party joins a session
   * Its public key is stored for further encryptions
   *
   * @async
   * @param {string} partyId
   * @param {string} pubKey
   * @param {string} sessionId
   * @returns {*}
   */
  async submitKey(partyId: string, pubKey: string, sessionId: string) {
    await this.db.submitKey(partyId, pubKey, sessionId);
  }

  /**
   * @description set the counter limit
   *
   * counter limit is the number of votes a user can cast
   *
   * @async
   * @param {number} limit
   * @param {string} HashedId
   * @returns {*}
   */
  async counterlimit(limit: number, HashedId: string) {
    await this.db.counterlimit(limit, HashedId);
  }

  /**
   *
   * @description get the counter limit
   * @async
   * @returns {number}
   */
  async getcounterlimit() {
    return await this.db.getcounterlimit();
  }

  /**
   *
   *
   * @async
   * @returns {unknown}
   */
  async getTokenTriggerVal() {
    return await this.db.getTokenTriggerVal();
  }

  /**
   *
   *
   * @async
   * @param {number} flag
   * @returns {*}
   */
  async setTokenTriggerVal(flag: number) {
    await this.db.setTokenTriggerVal(flag);
  }

  /**
   *
   *
   * @async
   * @returns {unknown}
   */
  async getTriggerVal() {
    return await this.db.getTriggerVal();
  }

  /**
   *
   *
   * @async
   * @param {number} flag
   * @returns {*}
   */
  async setTriggerVal(flag: number) {
    await this.db.setTriggerVal(flag);
  }

  /**
   *
   *
   * @async
   * @param {string} vid
   * @param {string} HashedId
   * @param {string} counter
   * @returns {*}
   */
  async storeTokens(vid: string, HashedId: string, counter: string) {
    await this.db.storeTokens(vid, HashedId, counter);
  }

  /**
   *
   *
   * @async
   * @returns {Tokens}
   */
  async getTokens() {
    return await this.db.getTokensAll();
  }
  /**
   *
   *
   * @async
   * @param {string[]} tokens
   * @returns {*}
   */
  async storeEncryptedTokens(tokens: any[]) {
    await this.db.storeEncryptedTokens(tokens);
  }
}
