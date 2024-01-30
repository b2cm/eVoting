import { firstValueFrom, lastValueFrom, map, zip } from "rxjs";
import { generator } from "./generator";
import { getK } from "./K";
import { RSA_ModulusGeneration } from "./RSA_modulus";
import { evaluate_polynomial, factorial, generate_polynomial, Gen_Coprime, PowerMod, RandomBnd, } from "./util";
export * from "./zkp";
export * from "./decrypt";
export function encrypt(message, N, r) {
    let random = r || Gen_Coprime(N);
    let ciphertext = (PowerMod(generator(N), message, N * N) *
        PowerMod(random, N, N * N));
    return ciphertext % (N * N);
}
export function combineCiphertext(existing, c) {
    return existing * c;
}
export async function startGeneration(userId, parties, keyLength = 16n, threshold = 2) {
    const allParties = [
        ...parties.map((p) => ({ type: "other", party: p })),
        { party: { partyId: userId }, type: "this" },
    ]
        .sort(({ party: a }, { party: b }) => a.partyId.localeCompare(b.partyId))
        .map((partyType, idx) => ({ partyNumber: idx + 1, ...partyType }));
    const otherParties = allParties
        .filter((party) => party.party.partyId !== userId)
        .map((party) => party.party);
    const firstParty = allParties[0].type == "other" ? allParties[0].party : null;
    const thisPartyNumber = allParties.find((p) => p.party.partyId === userId).partyNumber;
    console.log({ thisPartyNumber });
    const [N, p, q] = await RSA_ModulusGeneration(allParties, otherParties, thisPartyNumber, keyLength, firstParty);
    const delta = factorial(allParties.length);
    const K = getK();
    let modulus_KN = K * N;
    let modulus_KKN = K * K * N;
    //broadcase sum of p and q to all parties
    otherParties.forEach((party) => party.send(JSON.stringify({ pqSum: (p + q).toString() })));
    //get pqSums of other parties
    const pqSums = await firstValueFrom(zip(...otherParties.map((party) => party.bufferedMessage$.pipe(map((e) => BigInt(JSON.parse(e).pqSum))))));
    const phi = N + 1n - pqSums.reduce((acc, sum) => acc + sum, p + q);
    console.log("phi=", phi);
    const beta = RandomBnd(modulus_KN);
    const r = RandomBnd(modulus_KKN);
    const r_delta = delta * r;
    const myTheta = delta * phi * beta + N * delta * r;
    //broadcast theta to all parties
    otherParties.forEach((party) => party.send(JSON.stringify({ theta: myTheta.toString() })));
    //get thetas of other parties
    const otherThetas = await firstValueFrom(zip(...otherParties.map((party) => party.bufferedMessage$.pipe(map((e) => BigInt(JSON.parse(e).theta))))));
    const theta = otherThetas.reduce((sum, t) => sum + t, myTheta);
    console.log("theta=", theta);
    //Ri sharing
    const coeff = generate_polynomial(threshold, modulus_KKN);
    //distribute shares of our r_delta to all parties
    const ourShare = r_delta + evaluate_polynomial(coeff, BigInt(thisPartyNumber));
    for (const party of allParties) {
        const val = r_delta + evaluate_polynomial(coeff, BigInt(party.partyNumber));
        if (party.type == "other") {
            party.party.send(JSON.stringify({ r_delta: val.toString() }));
        }
    }
    //get shares of other parties r_deltas
    const other_r_deltas = await lastValueFrom(zip(...otherParties.map((party) => party.bufferedMessage$.pipe(map((e) => BigInt(JSON.parse(e).r_delta))))));
    const R = other_r_deltas.reduce((sum, share) => sum + share, ourShare);
    const f = N * R - theta;
    console.log({ f });
    let vk;
    if (!firstParty) {
        vk = PowerMod(Gen_Coprime(N * N), 2n, N * N);
        otherParties.forEach((party) => party.send(JSON.stringify({ vk: vk.toString() })));
    }
    else {
        vk = await firstValueFrom(firstParty.bufferedMessage$.pipe(map((e) => BigInt(JSON.parse(e).vk))));
    }
    console.log({ vk });
    const vki = PowerMod(vk, delta * f, N * N);
    console.log({ vki });
    return {
        public: {
            N,
            theta,
            delta,
            vk,
        },
        private: {
            f,
            vki,
        },
        isFirstParty: !firstParty,
        allParties: allParties.map((p) => ({
            id: p.party.partyId,
            number: p.partyNumber,
        })),
    };
}
//# sourceMappingURL=index.js.map