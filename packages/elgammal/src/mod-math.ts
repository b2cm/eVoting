import { CURVE, _0n, _1n, _4n } from "./constant";
import { intToBinary } from "./utils";

/**
 *
 *
 * @export
 * @class ModMath
 * @typedef {ModMath}
 */
export default class ModMath {
  /**
   *
   *
   * @static
   * @param {bigint} a
   * @param {*} [b=CURVE.P]
   * @memberof ModMath
   */
  static mod = (a: bigint, b = CURVE.P) => {
    const result = a % b;
    return result >= 0 ? result : result + b;
  };

  /**
   * @description Inverse of a mod b
   *
   * @param {bigint} a
   * @param {*} [b=CURVE.P]
   * @returns {bigint}
   */
  static invert = (a: bigint, b = CURVE.P): bigint => {
    if (a === _0n || b <= _0n) {
      throw new Error(
        `invert: expected positive integers, got n=${a} mod=${b}`
      );
    }

    let r2 = ModMath.mod(a, b);
    let r1 = b;

    let t1 = _0n;
    let t2 = _1n;

    let t: bigint;
    let r: bigint;

    while (r2 > 0) {
      let q = r1 / r2;
      r = r1 % r2;
      t = t1 - q * t2;

      r1 = r2;
      r2 = r;
      t1 = t2;
      t2 = t;
    }
    if (r1 !== _1n) {
      throw new Error(`invert doesn't not exist on ${a.toString()}`);
    }
    return ModMath.mod(t1, b);
  };

  /**
   *
   *
   * @static
   * @param {bigint} x
   * @returns {bigint}
   */
  static weistrass(x: bigint): bigint {
    const { a, b } = CURVE;
    const x2 = ModMath.mod(x * x);
    const x3 = ModMath.mod(x2 * x);
    return ModMath.mod(x3 + a * x + b);
  }

  /**
   *
   *
   * @param {bigint} a
   * @param {bigint} expo
   * @param {*} [mod=CURVE.P]
   * @returns {bigint}
   */
  static pow = (a: bigint, expo: bigint, mod = CURVE.P) => {
    const bin = intToBinary(expo);
    let ret = a;
    for (let i = 1; i < bin.length; i++) {
      ret = ModMath.mod(ret * ret, mod);
      if (bin[i]) {
        ret = ModMath.mod(ret * a, mod);
      }
    }
    return ret;
  };

  /**
   *
   *
   * @param {bigint} a
   * @param {*} [b=CURVE.P]
   * @returns {bigint}
   */
  static sqrt = (a: bigint, b = CURVE.P) => ModMath.pow(a, (b + _1n) / _4n, b);
}
