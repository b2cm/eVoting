"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("./constant");
const utils_1 = require("./utils");
class ModMath {
    static weistrass(x) {
        const { a, b } = constant_1.CURVE;
        const x2 = ModMath.mod(x * x);
        const x3 = ModMath.mod(x2 * x);
        return ModMath.mod(x3 + a * x + b);
    }
}
exports.default = ModMath;
ModMath.mod = (a, b = constant_1.CURVE.P) => {
    const result = a % b;
    return result >= 0 ? result : result + b;
};
ModMath.invert = (a, b = constant_1.CURVE.P) => {
    if (a === constant_1._0n || b <= constant_1._0n) {
        throw new Error(`invert: expected positive integers, got n=${a} mod=${b}`);
    }
    let r2 = ModMath.mod(a, b);
    let r1 = b;
    let t1 = constant_1._0n;
    let t2 = constant_1._1n;
    let t;
    let r;
    while (r2 > 0) {
        let q = r1 / r2;
        r = r1 % r2;
        t = t1 - q * t2;
        r1 = r2;
        r2 = r;
        t1 = t2;
        t2 = t;
    }
    if (r1 !== constant_1._1n) {
        throw new Error(`invert doesn't not exist on ${a.toString()}`);
    }
    return ModMath.mod(t1, b);
};
ModMath.pow = (a, expo, mod = constant_1.CURVE.P) => {
    const bin = (0, utils_1.intToBinary)(expo);
    let ret = a;
    for (let i = 1; i < bin.length; i++) {
        ret = ModMath.mod(ret * ret, mod);
        if (bin[i]) {
            ret = ModMath.mod(ret * a, mod);
        }
    }
    return ret;
};
ModMath.sqrt = (a, b = constant_1.CURVE.P) => ModMath.pow(a, (b + constant_1._1n) / constant_1._4n, b);
//# sourceMappingURL=mod-math.js.map