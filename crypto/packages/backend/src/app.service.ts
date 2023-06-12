import { Injectable } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';
import { Socket } from 'socket.io';
import { updateBehaviorSubject } from './utils';
import { v4 as UUID } from 'uuid';
import { DBService } from './db.service';
import { ethers } from 'ethers';
import { Contract , Provider, Wallet, utils } from "zksync-web3";
import  { abi as REGISTER_ABI }  from './artifacts-zk/contracts/Register.sol/Register.json';
import { abi as FACTORY_ABI } from './artifacts-zk/contracts/FactoryEvoting.sol/FactoryEvoting.json';
import { abi as EVOTING_ABI } from './artifacts-zk/contracts/Evoting.sol/Evoting.json';

export interface Session {
  parties: {
    socket: Socket;
    id: string;
  }[];
}


const REGISTER_ADDR = '0x3041abcb251FF01A41a9FA7D533186D9C92FbDb4';
const FACTORY_ADDR = '0x3516FdFB9997A225901212cF090d339f0804739D';
const l2Provider = new Provider("https://zksync2-testnet.zksync.dev");
const register = new Contract(REGISTER_ADDR, REGISTER_ABI, l2Provider);
const factory = new Contract(FACTORY_ADDR, FACTORY_ABI, l2Provider);

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

  async getHashedIDs(){
    
    try {
      const voters = await register.getVoterIDs();
      return voters;
    } catch (error: any) {
      console.error('Error:', error);
      return error;
    }
    
  }

  async getLRSGroup(){
    
    try {
      const voters = await register.getLRSGroup();
      return voters;
    } catch (error: any) {
      console.error('Error:', error);
      return error;
    }
    
  }

  async getVotes(voteID: string) {
    const message = 'Wrong vote id';
    try {
        const voteAddr = await factory.get_voting(voteID);
        //console.log('address', voteAddr);
        const STATE = ['IN_PREPARATION', 'LIVE', 'COMPLETED', 'CANCELLED'];
        const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
        if (voteAddr != ZERO_ADDRESS) {
            const voting = new Contract(voteAddr, EVOTING_ABI, l2Provider);
            const state = STATE[await voting.get_state()];
            if (state === STATE[2]) { // The voting phase is completed
                const votes = await voting.get_votes()
                return votes;
            } else {
                return { message: 'No votes' };
            }
        }
        else {
            return { message };
        }
    } catch (error: any) {
        console.log('Error:', error);
        const code = error.code;
        const reason = error.reason;
        const status = 'Wrong vote id'
        return { message, reason, code };
    }
    
}

}
