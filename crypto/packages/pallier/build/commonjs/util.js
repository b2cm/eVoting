"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Jacobi = exports.generate_polynomial = exports.evaluate_polynomial = exports.compute_tuple = exports.pick_pq = exports.coefficient_generation = exports.MulMod = exports.modulus = exports.GCD = exports.Gen_Coprime = exports.factorial = exports.InvMod = exports.PowerMod = exports.prime = exports.RandomBnd = void 0;
const tslib_1 = require("tslib");
const bigintCryptoUtils = (0, tslib_1.__importStar)(require("bigint-crypto-utils"));
function RandomBnd(n) {
    return bigintCryptoUtils.randBetween(n);
}
exports.RandomBnd = RandomBnd;
exports.prime = bigintCryptoUtils.prime;
exports.PowerMod = bigintCryptoUtils.modPow;
exports.InvMod = bigintCryptoUtils.modInv;
function factorial(n) {
    if (n < 1) {
        throw new Error("Cannot evaluate factorial of negative number");
    }
    let curr = n;
    let f = 1n;
    while (curr > 1) {
        f = f * BigInt(curr--);
    }
    return f;
}
exports.factorial = factorial;
function Gen_Coprime(n) {
    let ret;
    while (true) {
        ret = RandomBnd(n);
        if (GCD(ret, n) == 1) {
            return ret;
        }
    }
}
exports.Gen_Coprime = Gen_Coprime;
function GCD(a, b) {
    if (a == 0)
        return b;
    return GCD(modulus(b, a), a);
}
exports.GCD = GCD;
function modulus(a, b) {
    if (b === 0n)
        return b;
    return ((a % b) + b) % b;
}
exports.modulus = modulus;
function MulMod(a, b, n) {
    return modulus(a * b, n);
}
exports.MulMod = MulMod;
function coefficient_generation(PP, nParties) {
    const t = Math.floor((nParties - 1) / 2);
    const p = generate_polynomial(t, PP);
    const pp = generate_polynomial(t, PP);
    const q = generate_polynomial(t, PP);
    const qq = generate_polynomial(t, PP);
    const h = generate_polynomial(t * 2, PP);
    const hh = generate_polynomial(t * 2, PP);
    return [p, pp, q, qq, h, hh];
}
exports.coefficient_generation = coefficient_generation;
function pick_pq(i = 1, keyLength) {
    let pq = 2n;
    if (i === 1) {
        while (MulMod(pq, 1n, 4n) !== 3n || pq - 2n ** (keyLength - 1n) <= 0) {
            pq = RandomBnd(2n ** keyLength);
        }
    }
    else {
        while (MulMod(pq, 1n, 4n) !== 0n || pq - 2n ** (keyLength - 1n) <= 0) {
            pq = RandomBnd(2n ** keyLength);
        }
    }
    return pq;
}
exports.pick_pq = pick_pq;
function compute_tuple(j, PP, pi, qi, [p, pp, q, qq, h, hh]) {
    let pij = (pi + evaluate_polynomial(p, j)) % PP;
    let qij = (qi + evaluate_polynomial(q, j)) % PP;
    let hij = (0n + evaluate_polynomial(h, j)) % PP;
    return [pij, qij, hij];
}
exports.compute_tuple = compute_tuple;
function evaluate_polynomial(coeff, x) {
    let curr = 1n;
    return coeff.reduce((ans, c) => {
        curr = curr * x;
        return ans + c * curr;
    }, 0n);
}
exports.evaluate_polynomial = evaluate_polynomial;
function generate_polynomial(n, bound) {
    const c = Array(n);
    for (const idx of c.keys()) {
        c[idx] = RandomBnd(bound);
    }
    return c;
}
exports.generate_polynomial = generate_polynomial;
function Jacobi(a, n) {
    if (a >= n)
        a %= n;
    let result = 1;
    while (a) {
        //@ts-ignore
        while ((a & 1n) === 0) {
            a >>= 1n;
            //@ts-ignore
            if ((n & 7n) === 3 || (n & 7n) === 5n)
                result = -result;
        }
        let t = a;
        a = n;
        n = t;
        if ((a & 3n) === 3n && (n & 3n) === 3n)
            result = -result;
        a %= n;
    }
    if (n === 1n)
        return result;
    return 0;
}
exports.Jacobi = Jacobi;
//# sourceMappingURL=util.js.map