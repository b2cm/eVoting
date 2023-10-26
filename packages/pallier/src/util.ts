import * as bigintCryptoUtils from "bigint-crypto-utils";

export function RandomBnd(n: bigint) {
  return bigintCryptoUtils.randBetween(n);
}

export const prime = bigintCryptoUtils.prime;
export const PowerMod = bigintCryptoUtils.modPow;
export const InvMod = bigintCryptoUtils.modInv;

export function factorial(n: number) {
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

export function Gen_Coprime(n: bigint) {
  let ret;
  while (true) {
    ret = RandomBnd(n);

    if (GCD(ret, n) == 1) {
      return ret;
    }
  }
}

export function GCD(a: any, b: any): any {
  if (a == 0) return b;
  return GCD(modulus(b, a), a);
}

export function modulus(a: bigint, b: bigint) {
  if (b === 0n) return b;
  return ((a % b) + b) % b;
}

export function MulMod(a: bigint, b: bigint, n: bigint) {
  return modulus(a * b, n);
}

export function coefficient_generation(PP: bigint, nParties: number) {
  const t = Math.floor((nParties - 1) / 2);
  const p = generate_polynomial(t, PP);
  const pp = generate_polynomial(t, PP);
  const q = generate_polynomial(t, PP);
  const qq = generate_polynomial(t, PP);
  const h = generate_polynomial(t * 2, PP);
  const hh = generate_polynomial(t * 2, PP);

  return [p, pp, q, qq, h, hh] as const;
}

export function pick_pq(i = 1, keyLength: bigint) {
  let pq = 2n;

  if (i === 1) {
    while (MulMod(pq, 1n, 4n) !== 3n || pq - 2n ** (keyLength - 1n) <= 0) {
      pq = RandomBnd(2n ** keyLength);
    }
  } else {
    while (MulMod(pq, 1n, 4n) !== 0n || pq - 2n ** (keyLength - 1n) <= 0) {
      pq = RandomBnd(2n ** keyLength);
    }
  }

  return pq;
}

export function compute_tuple(
  j: bigint,
  PP: bigint,
  pi: bigint,
  qi: bigint,
  [p, pp, q, qq, h, hh]: any
) {
  let pij = (pi + evaluate_polynomial(p, j)) % PP;
  let qij = (qi + evaluate_polynomial(q, j)) % PP;
  let hij = (0n + evaluate_polynomial(h, j)) % PP;

  return [pij, qij, hij] as const;
}

export function evaluate_polynomial(coeff: bigint[], x: bigint) {
  let curr = 1n;
  return coeff.reduce((ans, c) => {
    curr = curr * x;
    return ans + c * curr;
  }, 0n);
}

export function generate_polynomial(n: number, bound: bigint) {
  const c = Array(n);
  for (const idx of c.keys()) {
    c[idx] = RandomBnd(bound);
  }
  return c;
}

export function Jacobi(a: bigint, n: bigint) {
  if (a >= n) a %= n;
  let result = 1;
  while (a) {
    //@ts-ignore
    while ((a & 1n) === 0) {
      a >>= 1n;
      //@ts-ignore
      if ((n & 7n) === 3 || (n & 7n) === 5n) result = -result;
    }
    let t = a;
    a = n;
    n = t;

    if ((a & 3n) === 3n && (n & 3n) === 3n) result = -result;
    a %= n;
  }
  if (n === 1n) return result;
  return 0;
}
