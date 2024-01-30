import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    createSession(): {
        sessionId: string;
    };
    getSessionData(sessionId: string): Promise<{
        pubKey: string;
        candidates: {
            message: string;
            title: string;
        }[];
    }>;
    putSessionData(body: {
        sessionId: string;
        N: string;
    }): Promise<void>;
    GetTallyServerPubKey(): {
        TallyKey: string;
    };
    GetTallyServerPrivKey(): {
        TallyPrivKey: string;
    };
    submitKey(body: {
        userId: string;
        pubKey: string;
        sessionId: string;
    }): Promise<void>;
    setcounterlimit(body: {
        limit: number;
        HashedId: string;
    }): Promise<void>;
    getcounterlimit(): Promise<{
        limits: any[];
        HashIds: any[];
    }>;
    setTriggerVal(body: {
        flag: number;
    }): Promise<void>;
    getTriggerVal(): Promise<{
        result: number;
    }>;
    getTokenTriggerVal(): Promise<{
        result: number;
    }>;
    setTokenTriggerVal(body: {
        flag: number;
    }): Promise<void>;
    storeTokens(body: {
        vid: string;
        HashedId: string;
        counter: string;
    }): Promise<void>;
    storeEncryptedTokens(body: {
        encryptedTokens: any[];
    }): Promise<void>;
    getTokens(): Promise<{
        tokens: any[];
    }>;
    registrationEnded(): Promise<void>;
    getHashedIDs(): Promise<{
        hashedIDs: any;
    }>;
    getLRSGroup(): Promise<{
        group: any;
    }>;
    getVotes(body: {
        voteID: string;
    }): Promise<{
        votes: any;
    }>;
}
