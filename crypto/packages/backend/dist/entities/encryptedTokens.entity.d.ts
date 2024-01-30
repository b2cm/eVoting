/// <reference types="node" />
export declare class encryptedTokens {
    id: number;
    encryptedCounter: Buffer;
    encryptedVid: Buffer;
    HashedId: Buffer;
    signature: Buffer;
    counterIndex: Number;
    pubkey: string;
}
