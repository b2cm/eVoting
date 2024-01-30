"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElgammalDecrypt = exports.verifySignature = exports.signature = exports.ElgammalEncrypt = exports.GenPublicKey = exports.GenerateRandom = exports.Generator = exports.CURVE = exports.Point = void 0;
const tslib_1 = require("tslib");
const point_1 = tslib_1.__importDefault(require("./src/point"));
exports.Point = point_1.default;
const constant_1 = require("./src/constant");
Object.defineProperty(exports, "CURVE", { enumerable: true, get: function () { return constant_1.CURVE; } });
const bigint_conversion_1 = require("bigint-conversion");
const crypto_js_1 = tslib_1.__importDefault(require("crypto-js"));
// import { toBigIntBE } from "bigint-buffer";
const mod_math_1 = tslib_1.__importDefault(require("./src/mod-math"));
tslib_1.__exportStar(require("./src/constant"), exports);
exports.Generator = point_1.default.SECP256K1;
const { n } = constant_1.CURVE;
function GenerateRandom() {
    let num = n + constant_1._1n;
    const _crypto = typeof window === "undefined" ? require("crypto").webcrypto : window.crypto;
    const array = new Uint8Array(constant_1.BITS / 8);
    while (num > n) {
        num = (0, bigint_conversion_1.bufToBigint)(_crypto.getRandomValues(array));
    }
    return num;
}
exports.GenerateRandom = GenerateRandom;
function GenPublicKey(priv_key) {
    return exports.Generator.multiplyCT(priv_key);
}
exports.GenPublicKey = GenPublicKey;
function ElgammalEncrypt(pubkey, msg) {
    // K=kP
    const EphemeralKey = GenerateRandom();
    const K = exports.Generator.multiplyCT(EphemeralKey);
    //C= kA+M
    const kA = pubkey.multiplyCT(EphemeralKey);
    const C = msg.add(kA);
    //console.log("c2===", c2.toString(16));
    return [K, C];
}
exports.ElgammalEncrypt = ElgammalEncrypt;
function signature(message, privkey) {
    // random integer k in [1, n-1]
    const k = GenerateRandom();
    // compute point (x1, y1) = kG
    const R = exports.Generator.multiplyCT(k);
    // compute x1 mod n
    const x1 = R.x;
    const r = x1 % n;
    // compute e = H(m) using SHA-256
    const e = crypto_js_1.default.SHA256(message).toString(crypto_js_1.default.enc.Hex);
    // convert e to bigint
    // compute s = k^-1(e + x1*d) mod n
    const invertedK = mod_math_1.default.invert(k, n);
    const s = (invertedK * (BigInt("0x" + e) + r * privkey)) % n;
    return [R, s, BigInt("0x" + e)];
}
exports.signature = signature;
function verifySignature(s, R, e, publicKey) {
    // verify that s is in [1, n-1]
    if (s < constant_1._1n || s > n - constant_1._1n) {
        throw new Error("Invalid signature s");
    }
    // check if R is a valid point on the curve through equation y^2 = x^3 + 7
    const { x, y } = R;
    const left = mod_math_1.default.pow(y, constant_1._2n);
    const right = mod_math_1.default.pow(x, constant_1._3n) + constant_1.CURVE.b;
    console.log("left = ", left.toString(16));
    console.log("right = ", right.toString(16));
    if (left !== right) {
        throw new Error("Invalid signature R");
    }
    // compute V1 = sR
    const V1 = R.multiplyCT(s);
    // compute V2 = eG
    const hashMul = exports.Generator.multiplyCT(e);
    const rA = publicKey.multiplyCT(R.x);
    const V2 = hashMul.add(rA);
    console.log("V1 = ", V1.x.toString(16), V1.y.toString(16));
    console.log("V2 = ", V2.x.toString(16), V2.y.toString(16));
    return V1.x === V2.x && V1.y === V2.y;
}
exports.verifySignature = verifySignature;
// export function stringifyCompressed([])
function ElgammalDecrypt(privkey, K, C) {
    //S=aK
    const S = K.multiplyCT(privkey);
    //M=C-S
    return C.add(S.invert());
}
exports.ElgammalDecrypt = ElgammalDecrypt;
//# sourceMappingURL=index.js.map