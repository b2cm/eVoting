import { BigInteger } from "big-integer";
export declare class KeyPair {
    private readonly _party;
    constructor(party?: any);
    get publicKey(): BigInteger;
    get privateKey(): BigInteger;
    get party(): any;
}
export declare function generatePair(): KeyPair;
export declare class Signature {
    private readonly signature;
    constructor(signature: any);
    get inner(): any;
    get y0(): BigInteger;
    get s(): BigInteger;
    get c(): BigInteger[];
    toJSON(_k: any): {
        y0: string;
        s: string;
        c: string[];
    };
}
export declare function signData(ring: BigInteger[], pair: KeyPair, data: string | BigInt | bigint | BigInteger | ArrayBuffer | ArrayBufferView): Signature;
export declare function verifySignature(data: string | BigInt | bigint | BigInteger | ArrayBuffer | ArrayBufferView, signature: Signature, ring: BigInteger[]): boolean;
export declare function verifyKeyPair(privateKey: bigint, publicKey: bigint): any;
