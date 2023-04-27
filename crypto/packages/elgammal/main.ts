import {
  ElgammalEncrypt,
  GenPublicKey,
  GenerateRandom,
  ElgammalDecrypt,
  Point,
  CURVE,
} from "./index";

const privateKey = GenerateRandom();
const publicKey = GenPublicKey(privateKey);

console.log("private key = ", privateKey);
console.log("public key = ", publicKey.compressed.toString(16));

const message = Point.fromXYPair(CURVE.Gx, CURVE.Gy).multiplyCT(BigInt(100));
console.log("message = ", message.compressed.toString(16));

const encrypted = ElgammalEncrypt(publicKey, message);

console.log(
  "encrypted = ",
  encrypted[0].compressed.toString(16),
  encrypted[1].compressed.toString(16)
);

const decrypted = ElgammalDecrypt(privateKey, ...encrypted);

console.log("decrypted = ", decrypted.x.toString(16), decrypted.y.toString(16));

console.log("decrypted compressed = ", decrypted.compressed.toString(16));

const cb = Point.fromCompressed(decrypted.compressed);

console.log("decrypted converted back = ", cb.x.toString(16), cb.y.toString(16));
