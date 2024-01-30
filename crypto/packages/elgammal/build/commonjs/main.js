"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const privateKey = (0, index_1.GenerateRandom)();
const publicKey = (0, index_1.GenPublicKey)(privateKey);
console.log("private key = ", privateKey);
console.log("public key = ", publicKey.compressed.toString(16));
// the number 423424 is just a random number which is our message
const message = index_1.Point.fromXYPair(index_1.CURVE.Gx, index_1.CURVE.Gy).multiplyCT(BigInt(423424));
console.log("message = ", message.compressed.toString(16));
const encrypted = (0, index_1.ElgammalEncrypt)(publicKey, message);
const sign = (0, index_1.signature)("423424", privateKey);
const verify = (0, index_1.verifySignature)(sign[1], sign[0], sign[2], publicKey);
console.log("verify = ", verify);
// console.log(
//   "encrypted = ",
//   encrypted[0].compressed.toString(16),
//   encrypted[1].compressed.toString(16)
// );
// const decrypted = ElgammalDecrypt(privateKey, ...encrypted);
// console.log("decrypted = ", decrypted.x.toString(16), decrypted.y.toString(16));
// console.log("decrypted compressed = ", decrypted.compressed.toString(16));
// const cb = Point.fromCompressed(decrypted.compressed);
// console.log("decrypted converted back = ", cb.x.toString(16), cb.y.toString(16));
//# sourceMappingURL=main.js.map