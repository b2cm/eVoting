/// <reference types="node" />
import { Session } from './session.entity';
export declare class Vote {
    id: number;
    sessionId: string;
    session: Session;
    groupId: string;
    vote: Buffer;
    y0: Buffer;
    s: Buffer;
    token: Buffer;
    c: SignatureC[];
    proofs: Proof[];
}
export declare class SignatureC {
    idx: number;
    c: Buffer;
    vote: Vote;
}
export declare class Proof {
    idx: number;
    p: Buffer;
    vote: Vote;
    order: number;
    sign: number;
}
