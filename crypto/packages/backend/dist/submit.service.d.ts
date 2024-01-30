import { DBService } from './db.service';
export declare class SubmitVoteService {
    private db;
    constructor(db: DBService);
    submitVote(sessionId: string, ciphertext: bigint, proof: [bigint[], bigint[], bigint[]], signature: {
        y0: bigint;
        s: bigint;
        c: bigint[];
    }, groupId: string, token: string): Promise<void>;
    getSessionVotes(sessionId: string): Promise<{
        vote: bigint;
        y0: bigint;
        s: bigint;
        c: bigint[];
        proof: bigint[][];
        groupId: string;
        token: string;
    }[]>;
    getVoter(pubKey: bigint): Promise<{
        HashedId: string;
        counter: string;
        vid: string;
    }[] | null>;
    getVoterGroups(): Promise<{
        [id: string]: any[];
    }>;
    addVoter(pubKey: bigint): Promise<void>;
    addHashedId(hashid: string, pubKey: bigint): Promise<void>;
    getKeys(sessionID: string): Promise<{
        partyId: string;
        TallypubKey: string;
    }[]>;
    storeFilteredVotes(partyID: string, votes: string): Promise<void>;
    getFilteredVotes(): Promise<{
        partyID: string;
        votes: string;
    }[]>;
    getEncryptedTokens(publicKey: string): Promise<{
        encryptedCounter: string;
        encryptedVid: string;
        signature: string;
        counterIndex: Number;
        pubkey: string;
    }[]>;
}
