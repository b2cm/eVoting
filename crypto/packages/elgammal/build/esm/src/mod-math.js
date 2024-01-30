import { CURVE, _0n, _1n, _4n } from './constant';
import { intToBinary } from './utils';
export default class ModMath {
    static weistrass(x) {
        const { a, b } = CURVE;
        const x2 = ModMath.mod(x * x);
        const x3 = ModMath.mod(x2 * x);
        return ModMath.mod(x3 + a * x + b);
    }
}
ModMath.mod = (a, b = CURVE.P) => {
    const result = a % b;
    return result >= 0 ? result : result + b;
};
ModMath.invert = (a, b = CURVE.P) => {
    if (a === _0n || b <= _0n) {
        throw new Error(`invert: expected positive integers, got n=${a} mod=${b}`);
    }
    let r2 = ModMath.mod(a, b);
    let r1 = b;
    let t1 = _0n;
    let t2 = _1n;
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
    if (r1 !== _1n) {
        throw new Error(`invert doesn't not exist on ${a.toString()}`);
    }
    return ModMath.mod(t1, b);
};
ModMath.pow = (a, expo, mod = CURVE.P) => {
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
ModMath.sqrt = (a, b = CURVE.P) => ModMath.pow(a, (b + _1n) / _4n, b);
//# sourceMappingURL=mod-math.js.map