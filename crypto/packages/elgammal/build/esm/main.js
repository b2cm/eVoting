import { ElgammalEncrypt, GenPublicKey, GenerateRandom, Point, CURVE, signature, verifySignature, } from "./index";
const privateKey = GenerateRandom();
const publicKey = GenPublicKey(privateKey);
console.log("private key = ", privateKey);
console.log("public key = ", publicKey.compressed.toString(16));
// the number 423424 is just a random number which is our message
const message = Point.fromXYPair(CURVE.Gx, CURVE.Gy).multiplyCT(BigInt(423424));
console.log("message = ", message.compressed.toString(16));
const encrypted = ElgammalEncrypt(publicKey, message);
const sign = signature("423424", privateKey);
const verify = verifySignature(sign[1], sign[0], sign[2], publicKey);
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