"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUBKEY_LENGTH = exports.PUBKEY_COMPRESSED_LENGTH = exports.CURVE = exports._8n = exports._4n = exports._3n = exports._2n = exports._1n = exports._0n = exports.BYTES = exports.BITS = void 0;
exports.BITS = 256;
exports.BYTES = exports.BITS / 8;
exports._0n = BigInt(0);
exports._1n = BigInt(1);
exports._2n = BigInt(2);
exports._3n = BigInt(3);
exports._4n = BigInt(4);
exports._8n = BigInt(8);
exports.CURVE = Object.freeze({
    // Params: a, b
    a: exports._0n,
    b: BigInt(7),
    // Field over which we'll do calculations. Verify with:
    //   console.log(CURVE.P === (2n**256n - 2n**32n - 977n))
    P: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
    // Curve order, total count of valid points in the field. Verify with:
    //   console.log(CURVE.n === (2n**256n - 432420386565659656852420866394968145599n))
    n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
    // Cofactor. It's 1, so other subgroups don't exist, and default subgroup is prime-order
    h: exports._1n,
    // Base point (x, y) aka generator point
    Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
    Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
});
exports.PUBKEY_COMPRESSED_LENGTH = 33;
exports.PUBKEY_LENGTH = 65;
//# sourceMappingURL=constant.js.map