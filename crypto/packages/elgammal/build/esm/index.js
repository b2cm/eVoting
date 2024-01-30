import Point from "./src/point";
import { BITS, CURVE, _1n, _2n, _3n } from "./src/constant";
import { bufToBigint } from "bigint-conversion";
import CryptoJS from "crypto-js";
// import { toBigIntBE } from "bigint-buffer";
import ModMath from "./src/mod-math";
export { Point };
export { CURVE };
export * from "./src/constant";
export const Generator = Point.SECP256K1;
const { n } = CURVE;
export function GenerateRandom() {
    let num = n + _1n;
    const _crypto = typeof window === "undefined" ? require("crypto").webcrypto : window.crypto;
    const array = new Uint8Array(BITS / 8);
    while (num > n) {
        num = bufToBigint(_crypto.getRandomValues(array));
    }
    return num;
}
export function GenPublicKey(priv_key) {
    return Generator.multiplyCT(priv_key);
}
export function ElgammalEncrypt(pubkey, msg) {
    // K=kP
    const EphemeralKey = GenerateRandom();
    const K = Generator.multiplyCT(EphemeralKey);
    //C= kA+M
    const kA = pubkey.multiplyCT(EphemeralKey);
    const C = msg.add(kA);
    //console.log("c2===", c2.toString(16));
    return [K, C];
}
export function signature(message, privkey) {
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
    return [R, s, BigInt("0x" + e)];
}
export function verifySignature(s, R, e, publicKey) {
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
export function ElgammalDecrypt(privkey, K, C) {
    //S=aK
    const S = K.multiplyCT(privkey);
    //M=C-S
    return C.add(S.invert());
}
//# sourceMappingURL=index.js.map