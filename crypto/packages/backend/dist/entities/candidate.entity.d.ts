/// <reference types="node" />
import { Session } from './session.entity';
export declare class Candidate {
    message: Buffer;
    sessionId: string;
    session: Session;
    name: string;
}
