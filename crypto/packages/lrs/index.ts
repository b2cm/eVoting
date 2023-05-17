import {
  gen,
  sign,
  verify,
  link,
  genPublicKey,
} from "./lib/Crypto.LRS.SimpleAPI";
import Big_Integer, { BigInteger } from "big-integer";

export class KeyPair {
  private readonly _party: any;

  constructor(party?: any) {
    this._party = party ? party : gen();
  }

  get publicKey(): BigInteger {
    return this._party.value0;
  }

  get privateKey(): BigInteger {
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
  private readonly signature: any;

  constructor(signature: any) {
    this.signature = signature;
  }

  get inner() {
    return this.signature;
  }

  get y0(): BigInteger {
    return this.signature.value0;
  }

  get s(): BigInteger {
    return this.signature.value1;
  }

  get c(): BigInteger[] {
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

export function signData(
  ring: BigInteger[],
  pair: KeyPair,
  data: string | BigInt | bigint | BigInteger | ArrayBuffer | ArrayBufferView
) {
  const s = sign(ring)(pair.party)(data)();
  return new Signature(s);
}

export function verifySignature(
  data: string | BigInt | bigint | BigInteger | ArrayBuffer | ArrayBufferView,
  signature: Signature,
  ring: BigInteger[]
): boolean {
  return verify(ring)(signature.inner)(data);
}

export function verifyKeyPair(privateKey: bigint, publicKey: bigint) {
  const correctPubKey = genPublicKey(Big_Integer(privateKey));
  return correctPubKey.eq(Big_Integer(publicKey));
}
