/// <reference types="node" />
import { Signature } from 'lrs';
import { Connection, Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { Candidate } from './entities/candidate.entity';
import { Voter } from './entities/voter.entity';
import { pubkeys } from './entities/pubkeys.entity';
import { HashedId } from './entities/HashedId.entity';
import { Vote } from './entities/vote.entity';
import { Trigger } from './entities/trigger.entity';
import { Token } from './entities/tokens.entity';
import { Limit } from './entities/limit.entity';
import { FilteredVotes } from './entities/FilteredVotes.entity';
import { TokenTrigger } from './entities/TokenTrigger.entity';
import { encryptedTokens } from './entities/encryptedTokens.entity';
export declare class DBService {
    private sessionRep;
    private candRep;
    private voterRep;
    private voteRep;
    private pubkeysRep;
    private hashedIdRep;
    private triggerRep;
    private tokenTriggerRep;
    private tokensRep;
    private limitRep;
    private encryptedTokensRep;
    private filteredVotesRep;
    private connection;
    constructor(sessionRep: Repository<Session>, candRep: Repository<Candidate>, voterRep: Repository<Voter>, voteRep: Repository<Vote>, pubkeysRep: Repository<pubkeys>, hashedIdRep: Repository<HashedId>, triggerRep: Repository<Trigger>, tokenTriggerRep: Repository<TokenTrigger>, tokensRep: Repository<Token>, limitRep: Repository<Limit>, encryptedTokensRep: Repository<encryptedTokens>, filteredVotesRep: Repository<FilteredVotes>, connection: Connection);
    addSession(id: string, pubKey: bigint, candidates: {
        name: string;
        message: bigint;
    }[]): Promise<void>;
    getSessionDetails(sessionId: string): Promise<{
        pubKey: bigint;
        candidates: {
            title: string;
            message: bigint;
        }[];
    }>;
    getGroups(): Promise<{
        [id: string]: any[];
    }>;
    getVoter(pubKey: bigint): Promise<Voter | undefined>;
    getVoterHash(pubKey: bigint): Promise<HashedId | undefined>;
    getTokens(hashedId: Buffer): Promise<Token[]>;
    saveVoter(voter: Voter): Promise<void>;
    addVoter(key: bigint, groupId: string, Vid: bigint, counter: bigint): Promise<void>;
    addVote(sessionId: string, vote: bigint, signature: Signature, groupId: string, proof: [bigint[], bigint[], bigint[]], token: string): Promise<void>;
    getSessionVotes(sessionId: string): Promise<{
        vote: bigint;
        y0: bigint;
        s: bigint;
        c: bigint[];
        proof: bigint[][];
        groupId: string;
        token: string;
    }[]>;
    submitKey(partyId: string, pubKey: string, sessionID: string): Promise<void>;
    addHashedId(hashedId: string, pubKey: bigint): Promise<void>;
    counterlimit(limit: number, HashedId: string): Promise<void>;
    getcounterlimit(): Promise<Limit[]>;
    getTriggerVal(): Promise<0 | 1>;
    setTriggerVal(flag: number): Promise<void>;
    storeTokens(vid: string, HashedId: string, counter: string): Promise<void>;
    getKeys(sessionID: string): Promise<{
        partyId: string;
        TallypubKey: string;
    }[]>;
    storeFilteredVotes(partyID: string, votes: string): Promise<void>;
    getFilteredVotes(): Promise<{
        partyID: string;
        votes: string;
    }[]>;
    getTokenTriggerVal(): Promise<0 | 1>;
    setTokenTriggerVal(flag: number): Promise<void>;
    getTokensAll(): Promise<any[]>;
    storeEncryptedTokens(tokens: any[]): Promise<void>;
    getEncryptedTokens(pubKey: string): Promise<{
        encryptedCounter: string;
        encryptedVid: string;
        signature: string;
        counterIndex: Number;
        pubkey: string;
    }[]>;
}
