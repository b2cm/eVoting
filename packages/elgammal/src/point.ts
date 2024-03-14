import { BITS, BYTES, CURVE, _0n, _1n, _2n, _3n, _4n } from "./constant";
import ModMath from "./mod-math";
const { mod, invert, sqrt } = ModMath;
import { toBufferBE } from "bigint-buffer";
import { bufToBigint } from "bigint-conversion";

/**
 * @description Point Compression
 *
 * @param {Uint8Array} x
 * @param {Uint8Array} y
 * @returns {*}
 */
function ECPointCompress(x: Uint8Array, y: Uint8Array) {
  const out = new Uint8Array(BYTES + 1);

  out[0] = 2 + (y[y.length - 1] & 1);
  out.set(x, 1);

  return out;
}

/**
 * @description Point class
 *
 * @export
 * @class Point
 * @typedef {Point}
 */

export default class Point {
  /**
   *
   *
   * @static
   * @type {Point}
   */
  static SECP256K1 = new Point(CURVE.Gx, CURVE.Gy);
  /**
   *
   *
   * @static
   * @type {Point}
   */
  static ZERO = new Point(_0n, _0n);

  /**
   *
   *
   * @private
   * @type {?bigint}
   */
  private _compressed_lazy?: bigint;
  /**
   *
   *
   * @private
   * @type {?bigint}
   */
  private _x_lazy?: bigint;
  /**
   *
   *
   * @private
   * @type {?bigint}
   */
  private _y_lazy?: bigint;

  /**
   *
   *
   * @private
   * @type {Point[]}
   */
  private precomputes: Point[] = [];

  /**
   * Creates an instance of Point.
   *
   * @constructor
   * @private
   * @param {...([bigint, bigint] | [bigint])} args
   */
  private constructor(...args: [bigint, bigint] | [bigint]) {
    if (args.length === 1) {
      this._compressed_lazy = args[0];
    }
    if (args.length === 2) {
      this._x_lazy = args[0];
      this._y_lazy = args[1];
    }
  }

  /**
   *
   *
   * @readonly
   * @type {bigint}
   */
  get x() {
    if (this._x_lazy == null) {
      if (this._compressed_lazy == null) {
        throw new Error("Invalid State");
      }
      const { x, y } = ECPointDecompress(
        toBufferBE(this._compressed_lazy, BYTES + 1)
      );
      this._x_lazy = x;
      this._y_lazy = y;
    }
    return this._x_lazy;
  }

  /**
   *
   *
   * @readonly
   * @type {bigint}
   */
  get y() {
    if (this._y_lazy == null) {
      if (this._compressed_lazy == null) {
        throw new Error("Invalid State");
      }
      const { x, y } = ECPointDecompress(
        toBufferBE(this._compressed_lazy, BYTES + 1)
      );
      this._x_lazy = x;
      this._y_lazy = y;
    }

    return this._y_lazy;
  }

  //http://hyperelliptic.org/EFD/g1p/auto-shortw.html
  /**
   *
   *
   * @param {Point} p
   * @returns {Point}
   */
  add = (p: Point) => {
    const [y1, x1, y2, x2] = [this.y, this.x, p.y, p.x];
    if (x1 === _0n || y1 === _0n) return p;
    if (x2 === _0n || y2 === _0n) return this;
    if (x1 === x2 && y1 === y2) return this.double();
    if (x1 === x2 && y1 === -y2) return Point.ZERO;

    /*
            x3 = (y2-y1)^2 / (x2-x1)^2 - x1 - x2
            y3 = (2*x1+x2) * (y2-y1) / (x2-x1) - (y2-y1)^3 / (x2-x1)^3 - y1
        */
    const rep = mod((y2 - y1) * invert(x2 - x1));
    const x3 = mod(rep * rep - x1 - x2);
    const y3 = mod((_2n * x1 + x2) * rep - rep ** _3n - y1);

    return new Point(x3, y3);
  };
  //http://hyperelliptic.org/EFD/g1p/auto-shortw.html
  /**
   *
   *
   * @returns {Point}
   */
  double = () => {
    const { x, y } = this;
    const { a } = CURVE;
    /*
            x2 = (3 * x1^2 + a)^2 / (2 * y1)^2 - x1 - x1
            y2 = (2 * x1 + x1) * (3 * x1^2 + a) / (2 * y1) - (3 * x1^2 + a)^3 / (2 * y1)^3 - y1
        */
    const rep1 = mod(_3n * x ** _2n + a);
    const rep2 = mod(_2n * y);
    const rep3 = mod(rep1 * invert(rep2));

    const x2 = rep3 ** _2n - _2n * x;
    const y2 = _3n * x * rep3 - rep3 ** _3n - y;

    return new Point(x2, y2);
  };

  /**
   * @description speeding up scalar multiplication
   *
   * @returns {{}}
   */
  getPrecomputes = () => {
    if (this.precomputes.length) return this.precomputes;
    this.precomputes = [];
    let dbl: Point = this;
    for (let i = 0; i < BITS; i++) {
      this.precomputes.push(dbl);
      dbl = dbl.double();
    }
    return this.precomputes;
  };

  //https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication

  /**
   * @description multiply a point by a scalar
   * @param {bigint} n
   * @returns {Point}
   */
  multiplyCT = (n: bigint) => {
    let ret = Point.ZERO;
    let fake = Point.ZERO;

    const dbls = this.getPrecomputes();
    for (let i = 0; i < BITS; i++) {
      if (n & _1n) ret = ret.add(dbls[i]);
      else fake = fake.add(dbls[i]);
      n >>= _1n;
    }
    return ret;
  };

  /**
   * @description invert a point
   *
   * @returns {Point}
   */
  invert() {
    return Point.fromXYPair(this.x, BigInt(-1) * this.y);
  }

  /**
   *
   *
   * @readonly
   * @type {bigint}
   */
  get compressed() {
    if (this._compressed_lazy == null) {
      this._compressed_lazy = bufToBigint(
        ECPointCompress(
          new Uint8Array(toBufferBE(this.x, BYTES)),
          new Uint8Array(toBufferBE(this.y, BYTES))
        )
      );
    }
    return this._compressed_lazy;
  }

  /**
   *
   *
   * @public
   * @static
   * @param {bigint} x
   * @param {bigint} y
   * @returns {Point}
   */
  public static fromXYPair(x: bigint, y: bigint) {
    return new Point(x, y);
  }

  /**
   *
   *
   * @public
   * @static
   * @param {bigint} comp
   * @returns {Point}
   */
  public static fromCompressed(comp: bigint) {
    return new Point(comp);
  }
}

/**
 * @description Point Decompression
 *
 * @param {Uint8Array} comp
 * @returns {{ x: Uint8Array; y: Uint8Array; }}
 */
function ECPointDecompress(comp: Uint8Array) {
  const signY = comp[0] - 2, // This value must be 2 or 3. 4 indicates an uncompressed key, and anything else is invalid.
    x = comp.subarray(1),
    // Import x into bigInt library
    xBig = bufToBigint(x);

  // y^2 = x^3 + b
  let y2 = xBig ** _3n + CURVE.b;
  let y = sqrt(y2);

  // If the parity doesn't match it's the *other* root
  if (y % _2n !== BigInt(signY)) {
    // y = prime - y
    y = CURVE.P - y;
  }

  return {
    x: xBig,
    y: y,
  };
}