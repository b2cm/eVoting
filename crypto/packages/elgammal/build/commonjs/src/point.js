"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const constant_1 = require("./constant");
const mod_math_1 = tslib_1.__importDefault(require("./mod-math"));
const { mod, invert, sqrt } = mod_math_1.default;
const bigint_buffer_1 = require("bigint-buffer");
const bigint_conversion_1 = require("bigint-conversion");
function ECPointCompress(x, y) {
    const out = new Uint8Array(constant_1.BYTES + 1);
    out[0] = 2 + (y[y.length - 1] & 1);
    out.set(x, 1);
    return out;
}
class Point {
    constructor(...args) {
        this.precomputes = [];
        //http://hyperelliptic.org/EFD/g1p/auto-shortw.html
        this.add = (p) => {
            const [y1, x1, y2, x2] = [this.y, this.x, p.y, p.x];
            if (x1 === constant_1._0n || y1 === constant_1._0n)
                return p;
            if (x2 === constant_1._0n || y2 === constant_1._0n)
                return this;
            if (x1 === x2 && y1 === y2)
                return this.double();
            if (x1 === x2 && y1 === -y2)
                return Point.ZERO;
            /*
                    x3 = (y2-y1)^2 / (x2-x1)^2 - x1 - x2
                    y3 = (2*x1+x2) * (y2-y1) / (x2-x1) - (y2-y1)^3 / (x2-x1)^3 - y1
                */
            const rep = mod((y2 - y1) * invert(x2 - x1));
            const x3 = mod(rep * rep - x1 - x2);
            const y3 = mod((constant_1._2n * x1 + x2) * rep - rep ** constant_1._3n - y1);
            return new Point(x3, y3);
        };
        //http://hyperelliptic.org/EFD/g1p/auto-shortw.html
        this.double = () => {
            const { x, y } = this;
            const { a } = constant_1.CURVE;
            /*
                    x2 = (3 * x1^2 + a)^2 / (2 * y1)^2 - x1 - x1
                    y2 = (2 * x1 + x1) * (3 * x1^2 + a) / (2 * y1) - (3 * x1^2 + a)^3 / (2 * y1)^3 - y1
                */
            const rep1 = mod(constant_1._3n * x ** constant_1._2n + a);
            const rep2 = mod(constant_1._2n * y);
            const rep3 = mod(rep1 * invert(rep2));
            const x2 = rep3 ** constant_1._2n - constant_1._2n * x;
            const y2 = constant_1._3n * x * rep3 - rep3 ** constant_1._3n - y;
            return new Point(x2, y2);
        };
        this.getPrecomputes = () => {
            if (this.precomputes.length)
                return this.precomputes;
            this.precomputes = [];
            let dbl = this;
            for (let i = 0; i < constant_1.BITS; i++) {
                this.precomputes.push(dbl);
                dbl = dbl.double();
            }
            return this.precomputes;
        };
        //https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication
        this.multiplyCT = (n) => {
            let ret = Point.ZERO;
            let fake = Point.ZERO;
            const dbls = this.getPrecomputes();
            for (let i = 0; i < constant_1.BITS; i++) {
                if (n & constant_1._1n)
                    ret = ret.add(dbls[i]);
                else
                    fake = fake.add(dbls[i]);
                n >>= constant_1._1n;
            }
            return ret;
        };
        if (args.length === 1) {
            this._compressed_lazy = args[0];
        }
        if (args.length === 2) {
            this._x_lazy = args[0];
            this._y_lazy = args[1];
        }
    }
    get x() {
        if (this._x_lazy == null) {
            if (this._compressed_lazy == null) {
                throw new Error("Invalid State");
            }
            const { x, y } = ECPointDecompress((0, bigint_buffer_1.toBufferBE)(this._compressed_lazy, constant_1.BYTES + 1));
            this._x_lazy = x;
            this._y_lazy = y;
        }
        return this._x_lazy;
    }
    get y() {
        if (this._y_lazy == null) {
            if (this._compressed_lazy == null) {
                throw new Error("Invalid State");
            }
            const { x, y } = ECPointDecompress((0, bigint_buffer_1.toBufferBE)(this._compressed_lazy, constant_1.BYTES + 1));
            this._x_lazy = x;
            this._y_lazy = y;
        }
        return this._y_lazy;
    }
    invert() {
        return Point.fromXYPair(this.x, BigInt(-1) * this.y);
    }
    get compressed() {
        if (this._compressed_lazy == null) {
            this._compressed_lazy = (0, bigint_conversion_1.bufToBigint)(ECPointCompress(new Uint8Array((0, bigint_buffer_1.toBufferBE)(this.x, constant_1.BYTES)), new Uint8Array((0, bigint_buffer_1.toBufferBE)(this.y, constant_1.BYTES))));
        }
        return this._compressed_lazy;
    }
    static fromXYPair(x, y) {
        return new Point(x, y);
    }
    static fromCompressed(comp) {
        return new Point(comp);
    }
}
exports.default = Point;
Point.SECP256K1 = new Point(constant_1.CURVE.Gx, constant_1.CURVE.Gy);
Point.ZERO = new Point(constant_1._0n, constant_1._0n);
function ECPointDecompress(comp) {
    const signY = comp[0] - 2, // This value must be 2 or 3. 4 indicates an uncompressed key, and anything else is invalid.
    x = comp.subarray(1), 
    // Import x into bigInt library
    xBig = (0, bigint_conversion_1.bufToBigint)(x);
    // y^2 = x^3 + b
    let y2 = xBig ** constant_1._3n + constant_1.CURVE.b;
    let y = sqrt(y2);
    // If the parity doesn't match it's the *other* root
    if (y % constant_1._2n !== BigInt(signY)) {
        // y = prime - y
        y = constant_1.CURVE.P - y;
    }
    return {
        x: xBig,
        y: y,
    };
}
//# sourceMappingURL=point.js.map