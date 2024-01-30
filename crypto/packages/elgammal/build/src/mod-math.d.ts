export default class ModMath {
    static mod: (a: bigint, b?: bigint) => bigint;
    static invert: (a: bigint, b?: bigint) => bigint;
    static weistrass(x: bigint): bigint;
    static pow: (a: bigint, expo: bigint, mod?: bigint) => bigint;
    static sqrt: (a: bigint, b?: bigint) => bigint;
}
