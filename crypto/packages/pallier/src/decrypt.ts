import { firstValueFrom, map, of, zip } from "rxjs";
import { ZKP_check, ZKP_comput_z, ZKP_gen_cc, ZKP_gen_R } from ".";
import { Party } from "./party";
import { InvMod, MulMod, PowerMod } from "./util";

function partialDecrypt(
  ciphertext: bigint,
  N: bigint,
  fi: bigint,
  delta: bigint
) {
  return PowerMod(ciphertext, 2n * delta * fi, N * N);
}

export async function decrypt(
  ciphertext: bigint,
  userId: string,
  parties: Party[],
  partyNumbers: { id: string; number: number }[],
  N: bigint,
  delta: bigint,
  theta: bigint,
  vk: bigint,
  fi: bigint,
  vki: bigint,
  candidates: bigint[],
  keyLength = 16n,
  threshold = 2
) {
  const partial_dec_res = partialDecrypt(ciphertext, N, fi, delta);

  const allParties = [
    ...parties.map((p) => ({ type: "other", party: p } as const)),
    { party: { partyId: userId }, type: "this" } as const,
  ]
    .sort(({ party: a }, { party: b }) => a.partyId.localeCompare(b.partyId))
    .map((partyType, idx) => ({ partyNumber: idx + 1, ...partyType } as const));

  const otherParties = allParties
    .filter((party) => party.party.partyId !== userId)
    .map((party) => (party as { party: Party }).party);

  //generate zkp
  const [r, R1, R2] = ZKP_gen_R(ciphertext, N, vk, delta, keyLength);
  let cc = ZKP_gen_cc(ciphertext, partial_dec_res, vki, R1, R2, vk, N);
  let z = ZKP_comput_z(r, cc, fi);

  //broadcast zkp and partial decryption to all parties
  otherParties.forEach((party) => {
    party.send(
      JSON.stringify({
        partial_dec_res: partial_dec_res.toString(),
        R1: R1.toString(),
        R2: R2.toString(),
        z: z.toString(),
        cc: cc.toString(),
        vki: vki.toString(),
      })
    );
  });

  const otherZkps = await firstValueFrom(
    zip(
      ...allParties.map((party) =>
        party.type == "other"
          ? party.party.bufferedMessage$.pipe(
              map((e) => {
                const obj = JSON.parse(e);

                return {
                  partial_dec_res: BigInt(obj.partial_dec_res),
                  R1: BigInt(obj.R1),
                  R2: BigInt(obj.R2),
                  z: BigInt(obj.z),
                  cc: BigInt(obj.cc),
                  vki: BigInt(obj.vki),
                  partyNumber: partyNumbers.find(
                    ({ id }) => id === party.party.partyId
                  )!.number,
                };
              })
            )
          : of({
              partial_dec_res: partial_dec_res,
              R1: R1,
              R2: R2,
              z: z,
              cc: cc,
              vki: vki,
              partyNumber: partyNumbers.find(
                ({ id }) => id === party.party.partyId
              )!.number,
            })
      )
    )
  );

  const validParties = otherZkps
    .map(({ partial_dec_res, R1, R2, z, cc, vki, partyNumber }) => {
      console.log('proof decryption', {
        ciphertext,
        partial_dec_res,
        R1,
        R2,
        z,
        cc,
        vki,
        N,
        delta,
        vk
      });
      const valid = ZKP_check(
        ciphertext,
        partial_dec_res,
        R1,
        R2,
        z,
        cc,
        vki,
        N,
        delta,
        vk
      );

      return { valid, partyNumber, partial_dec_res };
    })
    .filter(({ valid }) => valid);

  if (validParties.length <= threshold) {
    throw new Error("Not enough parties available for decryption");
  }

  //combine partial decryptions
  const dec = combine_partial_decrypt(
    validParties.map(({ partial_dec_res, partyNumber }) => [
      partyNumber - 1,
      partial_dec_res,
    ]),
    N,
    delta,
    theta
  );

  console.log(dec);

  //get tallies
  let curr = dec;
  let tallies = [] as { candidate: bigint; votes: bigint }[];
  for (const cand of candidates.sort((b, a) => (a < b ? -1 : a > b ? 1 : 0))) {
    const votes = curr / cand;
    tallies.push({
      candidate: cand,
      votes,
    });
    curr = curr % cand;
  }

  return tallies;
}

function combine_partial_decrypt(
  partial_decrypt_results: [number, bigint][],
  N: bigint,
  delta: bigint,
  theta: bigint
) {
  const lambdas = [] as [bigint, bigint][];

  //Lagrange interpolation at x = 0
  const interpolation_x = 0n;
  for (const [idx1] of partial_decrypt_results) {
    let numerator = 1n;
    let denominator = 1n;
    for (const [idx2] of partial_decrypt_results) {
      if (idx2 != idx1) {
        numerator = numerator * (interpolation_x - (BigInt(idx2) + 1n));
        denominator = denominator * (BigInt(idx1) + 1n - (BigInt(idx2) + 1n));
      }
    }
    lambdas.push([numerator, denominator]);
  }

  // these u-values are present in the library, but are never used...
  // let u1 = this.delta * lambda1;
  // let u2 = this.delta * lambda2;
  // let u3 = this.delta * lambda3;

  let products = partial_decrypt_results.map(([, c], idx) =>
    PowerMod(c, (2n * delta * lambdas[idx][0]) / lambdas[idx][1], N * N)
  );

  let product = products.reduce((acc, p) => acc * p, 1n) % (N * N);
  let Inv_temp = InvMod((-4n * delta * delta * theta) % N, N);
  let M = MulMod(L_function(product, N), Inv_temp, N);

  return M;
}

function L_function(x: bigint, N: bigint) {
  return (x - 1n) / N;
}
