import { SubmitVoteService } from './submit.service';
import { LookUpservice } from './lookup.service';
export declare class VoteController {
    private voteService;
    private LookUpService;
    constructor(voteService: SubmitVoteService, LookUpService: LookUpservice);
    submitVote(body: {
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
        token: string;
    }): Promise<void>;
    getFilteredVotes(): Promise<{
        partyID: string;
        votes: string;
    }[]>;
    getFilteredOne(): Promise<any>;
    getVoterData(pubkey: string, body: {
        sessionId: string;
    }): Promise<{
        publicKey: string;
        tokens: {
            vid: string;
            partyId: string;
            counter: string;
        }[][];
    }>;
    getVoterGroups(): Promise<{
        [id: string]: any[];
    }>;
    getEncryptedTokens(body: {
        publicKey: string;
    }): Promise<{
        encryptedCounter: string;
        encryptedVid: string;
        signature: string;
        counterIndex: Number;
        pubkey: string;
    }[]>;
    getVotes(sessionId: string): Promise<{
        vote: string;
        groupId: string;
        y0: string;
        s: string;
        c: string[];
        proof: string[][];
        token: string;
    }[]>;
    addVoter(body: {
        pubKey: string;
    }): Promise<{
        [id: string]: any[];
    }>;
    addHashedId(body: {
        pubKey: string;
        hashedId: string;
    }): Promise<void>;
    storefilteredVotes(body: {
        partyID: string;
        votes: string;
    }): Promise<void>;
}
