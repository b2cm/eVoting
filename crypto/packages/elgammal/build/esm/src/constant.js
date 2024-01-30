export const BITS = 256;
export const BYTES = BITS / 8;
export const _0n = BigInt(0);
export const _1n = BigInt(1);
export const _2n = BigInt(2);
export const _3n = BigInt(3);
export const _4n = BigInt(4);
export const _8n = BigInt(8);
export const CURVE = Object.freeze({
    // Params: a, b
    a: _0n,
    b: BigInt(7),
    // Field over which we'll do calculations. Verify with:
    //   console.log(CURVE.P === (2n**256n - 2n**32n - 977n))
    P: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
    // Curve order, total count of valid points in the field. Verify with:
    //   console.log(CURVE.n === (2n**256n - 432420386565659656852420866394968145599n))
    n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
    // Cofactor. It's 1, so other subgroups don't exist, and default subgroup is prime-order
    h: _1n,
    // Base point (x, y) aka generator point
    Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
    Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
});
export const PUBKEY_COMPRESSED_LENGTH = 33;
export const PUBKEY_LENGTH = 65;
//# sourceMappingURL=constant.js.map