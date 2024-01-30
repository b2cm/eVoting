import { firstValueFrom, map, of, zip } from "rxjs";
import { coefficient_generation, compute_tuple, Gen_Coprime, InvMod, Jacobi, pick_pq, PowerMod, prime, } from "./util";
export async function RSA_ModulusGeneration(allParties, otherParties, thisPartyNumber, keyLength, firstParty) {
    //generate or get PP
    let PP;
    if (!firstParty) {
        PP = 0n;
        const key_len_pow = 2n ** (keyLength - 1n);
        let PP_ceiling = (3n * 3n * key_len_pow) ** 2n;
        while (PP <= PP_ceiling) {
            PP = await prime(5 + 2 * +keyLength.toString());
        }
        otherParties.forEach((p) => p.send(JSON.stringify({ PP: PP.toString() })));
    }
    else {
        const { PP: data } = JSON.parse(await firstValueFrom(firstParty.bufferedMessage$));
        PP = BigInt(data);
    }
    console.log("PP=", PP);
    //generate N;
    let generation_done = false;
    let N;
    let p;
    let q;
    while (!generation_done) {
        p = pick_pq(thisPartyNumber, keyLength);
        q = pick_pq(thisPartyNumber, keyLength);
        console.log({ p, q });
        const coeffs = coefficient_generation(PP, allParties.length);
        let selfTuple;
        //distribute shares to the other parties
        for (const party of allParties) {
            const t = compute_tuple(BigInt(party.partyNumber), PP, p, q, coeffs);
            if (party.type == "other") {
                party.party.send(JSON.stringify({ tuple: t.map((el) => el.toString()) }));
            }
            else {
                selfTuple = t;
            }
        }
        //get the shared tuples from other parties
        const tuples = await firstValueFrom(zip(...otherParties.map((p) => p.bufferedMessage$.pipe(map((message) => JSON.parse(message).tuple.map((s) => BigInt(s))))), of(selfTuple)));
        let pSum = 0n;
        let qSum = 0n;
        let hSum = 0n;
        for (const [p, q, h] of tuples) {
            pSum += p;
            qSum += q;
            hSum += h;
        }
        //@ts-ignore
        const Ni = (pSum * qSum + hSum) % PP;
        //Lagrange interpolation at x = 0
        const interpolation_x = 0n;
        let numerator = 1n;
        let denominator = 1n;
        for (const idx2 of tuples.keys()) {
            if (idx2 !== thisPartyNumber - 1) {
                numerator = numerator * (interpolation_x - (BigInt(idx2) + 1n));
                denominator =
                    denominator *
                        (BigInt(thisPartyNumber - 1) + 1n - (BigInt(idx2) + 1n));
            }
        }
        const Li = numerator / denominator;
        console.log("Li=", Li);
        const partyN = Ni * Li;
        console.log("Ni=", partyN);
        //broadcast our N to all parties
        for (const party of otherParties) {
            party.send(JSON.stringify({ Ni: partyN.toString() }));
        }
        //wait for other parties to send their N
        const NVals = await firstValueFrom(zip(...otherParties.map((p) => p.bufferedMessage$.pipe(map((e) => JSON.parse(e)), map((e) => BigInt(e.Ni))))));
        //generate N from all Nis
        //@ts-ignore
        N = [...NVals, partyN].reduce((acc, curr) => acc + curr) % PP;
        console.log("N = " + N);
        // for some reason, N can negative, in that case the biprimality check does not work
        if (N < 0) {
            continue;
        }
        //Biprimality check
        let Qi_inv;
        if (firstParty) {
            const gg = await firstValueFrom(firstParty.bufferedMessage$.pipe(map((e) => BigInt(JSON.parse(e).gg))));
            const Qi = PowerMod(gg, (p + q) / 4n, N);
            Qi_inv = InvMod(Qi, N);
        }
        else {
            let gg = Gen_Coprime(N);
            while (Jacobi(gg, N) !== 1) {
                gg = Gen_Coprime(N);
            }
            otherParties.forEach((party) => party.send(JSON.stringify({ gg: gg.toString() })));
            Qi_inv = PowerMod(gg, 
            //@ts-ignore
            (N + 1n - p - q) / 4n, N);
            console.log("Q1=", Qi_inv);
        }
        //send our Qi to other parties
        otherParties.forEach((party) => party.send(JSON.stringify({ Qi: Qi_inv.toString() })));
        //get otherQis
        const otherQs = await firstValueFrom(zip(...otherParties.map((party) => party.bufferedMessage$.pipe(map((e) => BigInt(JSON.parse(e).Qi))))));
        const m = otherQs.reduce((acc, q_inv) => acc * q_inv, Qi_inv);
        let check = m % N === 1n % N || m % N === -1n % N; // biprimality check
        generation_done = check;
        console.log({ generation_done });
    }
    return [N, p, q];
}
//# sourceMappingURL=RSA_modulus.js.map