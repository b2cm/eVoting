import { Injectable } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';
import { Socket } from 'socket.io';
import { updateBehaviorSubject } from './utils';
import { v4 as UUID } from 'uuid';
import { DBService } from './db.service';

export interface Session {
  parties: {
    socket: Socket;
    id: string;
  }[];
}

@Injectable()
export class AppService {
 
  readonly sessions = new BehaviorSubject(new Map() as Map<string, Session>);

  constructor(private db: DBService) {}

  createSession() {
    const id = UUID();
    const s = this.sessions.getValue();
    s.set(id + '/encrypt', { parties: [] });
    s.set(id + '/decrypt', { parties: [] });
    this.sessions.next(s);
    return id;
  }

  hasSession(id: string) {
    return this.sessions.getValue().has(id);
  }

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

  async getSessionDetails(sessionId: string) {
    return await this.db.getSessionDetails(sessionId);
  }

  async submitKey(partyId: string, pubKey: string, sessionId: string) {
    await this.db.submitKey(partyId, pubKey, sessionId);
  }

  async counterlimit(limit: number, HashedId: string) {
    await this.db.counterlimit(limit, HashedId);
  }

  async getcounterlimit() {
    return await this.db.getcounterlimit();
  }

  async getTokenTriggerVal() {
    return await this.db.getTokenTriggerVal();
  }

  async setTokenTriggerVal(flag: number) {
    await this.db.setTokenTriggerVal(flag);
  }

  async getTriggerVal() {
    return await this.db.getTriggerVal();
  }

  async setTriggerVal(flag: number) {
    await this.db.setTriggerVal(flag);
  }

  async storeTokens(vid: string, HashedId: string, counter: string) {
    await this.db.storeTokens(vid, HashedId, counter);
  }

  async getTokens() { 
    return await this.db.getTokensAll();
  }
  async storeEncryptedTokens(tokens: any[]) {
    await this.db.storeEncryptedTokens(tokens);
  }

}
