import Point from "./src/point";
import { BITS, CURVE, _0n, _1n, _2n, _3n } from "./src/constant";
import { bufToBigint } from "bigint-conversion";
// import { toBigIntBE } from "bigint-buffer";

export { Point };
export { CURVE };
export * from "./src/constant";

export const Generator = Point.SECP256K1;
const { n } = CURVE;

export function GenerateRandom() {
  let num = n + _1n;
  const _crypto =
    typeof window === "undefined" ? require("crypto").webcrypto : window.crypto;
  const array = new Uint8Array(BITS / 8);

  while (num > n) {
    num = bufToBigint(_crypto.getRandomValues(array));
  }
  return num;
}

export function GenPublicKey(priv_key: bigint) {
  return Generator.multiplyCT(priv_key);
}

export function ElgammalEncrypt(pubkey: Point, msg: Point) {
  // K=kP
  const EphemeralKey = GenerateRandom();
  const K = Generator.multiplyCT(EphemeralKey);

  //C= kA+M
  const kA = pubkey.multiplyCT(EphemeralKey);
  const C = msg.add(kA);
  //console.log("c2===", c2.toString(16));
  return [K, C] as const;
}

// export function stringifyCompressed([])

export function ElgammalDecrypt(privkey: bigint, K: Point, C: Point) {
  //S=aK
  const S = K.multiplyCT(privkey);

  //M=C-S
  return C.add(S.invert());
}
