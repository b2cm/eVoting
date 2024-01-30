/// <reference types="node" />
import { Candidate } from './candidate.entity';
export declare class Session {
    id: string;
    pubKey: Buffer;
    candidates: Candidate[];
}
