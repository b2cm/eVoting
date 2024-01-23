import { encrypt } from ".";
import { Gen_Coprime, InvMod, MulMod, PowerMod, RandomBnd } from "./util";
import * as bigintCryptoUtils from "bigint-crypto-utils";
import { generator } from "./generator";
import { hash } from "./hash";
import { get_l, get_t } from "./t";
import { getK } from "./K";

export function createMemberShipZKP(
  message: bigint,
  validMessages: bigint[],
  N: bigint,
  bits = 256n
) {
  const r = Gen_Coprime(N);
  const cipher = encrypt(message, N, r);

  const epsilon = Gen_Coprime(N);
  const ui = PowerMod(epsilon, N, N * N);

  let i: number;

  const us = [],
    es = [],
    vs = [];

  for (const [idx, validMessage] of validMessages.entries()) {
    //Working variables
    const gmk = PowerMod(generator(N), validMessage, N * N);
    const uk = (cipher * InvMod(gmk, N * N)) % (N * N);

    if (message != validMessage) {
      //confirm these two
      //zk
      const vj = Gen_Coprime(N);
      //ek
      const ej = Gen_Coprime(N);

      const vn = PowerMod(vj, N, N * N);
      const ue = PowerMod(uk, ej, N * N);
      const uj = (vn * InvMod(ue, N * N)) % (N * N);

      us.push(uj);
      vs.push(vj);
      es.push(ej);
    } else {
      us.push(ui);
      vs.push(0n);
      es.push(0n);
      i = idx;
    }
  }

  const uHash =
    BigInt("0x" + hash(BigInt(us.join("")).toString(16), "hex")) % N;
  const eSum = es.filter((e) => e != 0n).reduce((acc, e) => (acc + e) % N, 0n);
  const ei = (uHash - eSum) % N;
  //Also confirm this
  const rep = PowerMod(r, ei, N);
  const vi = (epsilon * rep * PowerMod(generator(N), ei, N)) % N;

  es[i!] = ei;
  vs[i!] = vi;

  return [cipher, [es, us, vs]] as const;
}

export function verifyMembershipZkp(
  ciphertext: bigint,
  [es, us, vs]: [bigint[], bigint[], bigint[]],
  validMessages: bigint[],
  N: bigint
) {
  const e = BigInt("0x" + hash(BigInt(us.join("")).toString(16), "hex")) % N;
  const as = validMessages.map((m) => {
    const gmk = PowerMod(generator(N), m, N * N);
    const uk = (ciphertext * InvMod(gmk, N * N)) % (N * N);
    return uk;
  });

  const eSum = es.reduce((acc, e) => (acc + e) % N, 0n);

  if (eSum != e) {
    return false;
  }

  return vs.every((v, idx) => {
    const ui = us[idx];
    const ei = es[idx];
    const ai = as[idx];

    const vin = PowerMod(v, N, N * N);
    const aie = PowerMod(ai, ei, N * N);
    const uiae = (ui * aie) % (N * N);
    return vin == uiae;
  });
}

export function ZKP_gen_R(
  c: bigint,
  N: bigint,
  vk: bigint,
  delta: bigint,
  keyLength: bigint
) {
  //step 1,2 chaintegrity
  let power1 = 2n ** (get_t() + get_l());
  let power2 = 2n ** (2n * keyLength);
  let Bound = power1 * getK() * getK() * getK() * power2;
  let r = RandomBnd(Bound);
  let R1 = PowerMod(vk, delta * r, N * N);
  let R2 = PowerMod(c, 4n * delta * r, N * N);

  return [r, R1, R2] as const;
}

export function ZKP_gen_cc(
  c: bigint,
  ci: bigint,
  vki: bigint,
  R1: bigint,
  R2: bigint,
  vk: bigint,
  N: bigint
) {
  // step 4 challange
  let Bound = 2n ** get_t();
  //converting the numbers to strings to concatenate them
  const concatenated = BigInt(
    c.toString() +
      ci.toString() +
      vk.toString() +
      vki.toString() +
      R1.toString() +
      R2.toString()
  );
  // console.log({ concatenated });
  //convert the concatenated numbers into hex
  //The hash function calculates and returns sha256 hash as a string, which we parse
  // as a BigInt
  const hashOfConcat = "0x" + hash(concatenated.toString(16), "hex");
  console.log({ hashOfConcat });
  let cc = BigInt(hashOfConcat) % N;
  console.log({ cc });
  return cc;
}

export function ZKP_comput_z(r: bigint, cc: bigint, fi: bigint) {
  // step 5 response
  let z = r + cc * fi;
  return z;
}

export function ZKP_check(
  c: bigint,
  ci: bigint,
  R1: bigint,
  R2: bigint,
  z: bigint,
  cc: bigint,
  vki: bigint,
  N: bigint,
  delta: bigint,
  vk: bigint
) {
  let equality_1_left = PowerMod(vk, delta * z, N * N);
  let equality_1_right = MulMod(R1, PowerMod(vki, cc, N * N), N * N);
  let equality_2_left = PowerMod(c, 4n * delta * z, N * N);
  let equality_2_right = MulMod(R2, PowerMod(ci, 2n * cc, N * N), N * N);

  let partial_ZKP_check =
    equality_1_left == equality_1_right && equality_2_left == equality_2_right;
  return partial_ZKP_check;
}
