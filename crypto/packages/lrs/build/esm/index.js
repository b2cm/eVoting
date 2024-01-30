import { gen, sign, verify, genPublicKey, } from "./lib/Crypto.LRS.SimpleAPI";
import Big_Integer from "big-integer";
export class KeyPair {
    constructor(party) {
        this._party = party ? party : gen();
    }
    get publicKey() {
        return this._party.value0;
    }
    get privateKey() {
        return this._party.value1;
    }
    get party() {
        return this._party;
    }
}
export function generatePair() {
    return new KeyPair();
}
export class Signature {
    constructor(signature) {
        this.signature = signature;
    }
    get inner() {
        return this.signature;
    }
    get y0() {
        return this.signature.value0;
    }
    get s() {
        return this.signature.value1;
    }
    get c() {
        return this.signature.value2;
    }
    toJSON(_k) {
        const y0 = this.y0.toString(16);
        const s = this.s.toString(16);
        const c = this.c.map((x) => x.toString(16));
        return {
            y0,
            s,
            c,
        };
    }
}
export function signData(ring, pair, data) {
    const s = sign(ring)(pair.party)(data)();
    return new Signature(s);
}
export function verifySignature(data, signature, ring) {
    return verify(ring)(signature.inner)(data);
}
export function verifyKeyPair(privateKey, publicKey) {
    const correctPubKey = genPublicKey(Big_Integer(privateKey));
    return correctPubKey.eq(Big_Integer(publicKey));
}
