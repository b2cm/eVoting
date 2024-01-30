import { BehaviorSubject } from 'rxjs';
import { Socket } from 'socket.io';
import { DBService } from './db.service';
export interface Session {
    parties: {
        socket: Socket;
        id: string;
    }[];
}
export declare class AppService {
    private db;
    readonly sessions: BehaviorSubject<Map<string, Session>>;
    constructor(db: DBService);
    createSession(): string;
    hasSession(id: string): boolean;
    addParty(sessionId: string, sock: Socket, userId?: string): {
        id: string;
        socket: Socket<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
    };
    addSessionDetails(sessionId: string, pubKey: bigint): Promise<void>;
    getSessionDetails(sessionId: string): Promise<{
        pubKey: bigint;
        candidates: {
            title: string;
            message: bigint;
        }[];
    }>;
    submitKey(partyId: string, pubKey: string, sessionId: string): Promise<void>;
    counterlimit(limit: number, HashedId: string): Promise<void>;
    getcounterlimit(): Promise<import("./entities/limit.entity").Limit[]>;
    getTokenTriggerVal(): Promise<0 | 1>;
    setTokenTriggerVal(flag: number): Promise<void>;
    getTriggerVal(): Promise<0 | 1>;
    setTriggerVal(flag: number): Promise<void>;
    storeTokens(vid: string, HashedId: string, counter: string): Promise<void>;
    getTokens(): Promise<any[]>;
    storeEncryptedTokens(tokens: any[]): Promise<void>;
    getHashedIDs(): Promise<any>;
    getLRSGroup(): Promise<any>;
    getVotes(voteID: string): Promise<any>;
}
