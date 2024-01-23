import Point from "./src/point";
import { BITS, CURVE, _0n, _1n, _2n, _3n } from "./src/constant";
import { bufToBigint } from "bigint-conversion";
import CryptoJS from "crypto-js";
// import { toBigIntBE } from "bigint-buffer";
import ModMath from "./src/mod-math";
export { Point };
export { CURVE };
export * from "./src/constant";

export const Generator = Point.SECP256K1;
const { n } = CURVE;

/**
 *
 *
 * @export
 * @returns {*}
 */
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

/**
 * @description Generate Public Key
 *
 * @export
 * @param {bigint} priv_key
 * @returns {Point}
 */
export function GenPublicKey(priv_key: bigint) {
  return Generator.multiplyCT(priv_key);
}

/**
 * @description ELGAMMAL ENCRYPTION
 *
 * @export
 * @param {Point} pubkey
 * @param {Point} msg
 * @returns {readonly [Point, Point]}
 */
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

/**
 * @description ELGAMMAL signature
 *
 * @export
 * @param {string} message
 * @param {bigint} privkey
 * @returns {readonly [Point, bigint, any]}
 */
export function signature(message: string, privkey: bigint) {
  // random integer k in [1, n-1]
  const k = GenerateRandom();
  // compute point (x1, y1) = kG
  const R = Generator.multiplyCT(k);

  // compute x1 mod n
  const x1 = R.x;
  const r = x1 % n;
  // compute e = H(m) using SHA-256
  const e = CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
  // convert e to bigint

  // compute s = k^-1(e + x1*d) mod n
  const invertedK = ModMath.invert(k, n);
  const s = (invertedK * (BigInt("0x" + e) + r * privkey)) % n;

  return [R, s, BigInt("0x" + e)] as const;
}

/**
 * @description ELGAMMAL signature verification
 *
 * @export
 * @param {bigint} s
 * @param {Point} R
 * @param {bigint} e
 * @param {Point} publicKey
 * @returns {boolean}
 */
export function verifySignature(
  s: bigint,
  R: Point,
  e: bigint,
  publicKey: Point
): boolean {
  // verify that s is in [1, n-1]
  if (s < _1n || s > n - _1n) {
    throw new Error("Invalid signature s");
  }
  // check if R is a valid point on the curve through equation y^2 = x^3 + 7
  const { x, y } = R;
  const left = ModMath.pow(y, _2n);
  const right = ModMath.pow(x, _3n) + CURVE.b;
  console.log("left = ", left.toString(16));
  console.log("right = ", right.toString(16));

  if (left !== right) {
    throw new Error("Invalid signature R");
  }
  // compute V1 = sR
  const V1 = R.multiplyCT(s);
  // compute V2 = eG
  const hashMul = Generator.multiplyCT(e);
  const rA = publicKey.multiplyCT(R.x);
  const V2 = hashMul.add(rA);
  console.log("V1 = ", V1.x.toString(16), V1.y.toString(16));
  console.log("V2 = ", V2.x.toString(16), V2.y.toString(16));

  return V1.x === V2.x && V1.y === V2.y;
}

// export function stringifyCompressed([])

/**
 * @description ELGAMMAL DECRYPTION
 *
 * @export
 * @param {bigint} privkey
 * @param {Point} K
 * @param {Point} C
 * @returns {Point}
 */
export function ElgammalDecrypt(privkey: bigint, K: Point, C: Point) {
  //S=aK
  const S = K.multiplyCT(privkey);

  //M=C-S
  return C.add(S.invert());
}
