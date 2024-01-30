"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGeneration = exports.combineCiphertext = exports.encrypt = void 0;
const tslib_1 = require("tslib");
const rxjs_1 = require("rxjs");
const generator_1 = require("./generator");
const K_1 = require("./K");
const RSA_modulus_1 = require("./RSA_modulus");
const util_1 = require("./util");
(0, tslib_1.__exportStar)(require("./zkp"), exports);
(0, tslib_1.__exportStar)(require("./decrypt"), exports);
function encrypt(message, N, r) {
    let random = r || (0, util_1.Gen_Coprime)(N);
    let ciphertext = ((0, util_1.PowerMod)((0, generator_1.generator)(N), message, N * N) *
        (0, util_1.PowerMod)(random, N, N * N));
    return ciphertext % (N * N);
}
exports.encrypt = encrypt;
function combineCiphertext(existing, c) {
    return existing * c;
}
exports.combineCiphertext = combineCiphertext;
async function startGeneration(userId, parties, keyLength = 16n, threshold = 2) {
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
    const [N, p, q] = await (0, RSA_modulus_1.RSA_ModulusGeneration)(allParties, otherParties, thisPartyNumber, keyLength, firstParty);
    const delta = (0, util_1.factorial)(allParties.length);
    const K = (0, K_1.getK)();
    let modulus_KN = K * N;
    let modulus_KKN = K * K * N;
    //broadcase sum of p and q to all parties
    otherParties.forEach((party) => party.send(JSON.stringify({ pqSum: (p + q).toString() })));
    //get pqSums of other parties
    const pqSums = await (0, rxjs_1.firstValueFrom)((0, rxjs_1.zip)(...otherParties.map((party) => party.bufferedMessage$.pipe((0, rxjs_1.map)((e) => BigInt(JSON.parse(e).pqSum))))));
    const phi = N + 1n - pqSums.reduce((acc, sum) => acc + sum, p + q);
    console.log("phi=", phi);
    const beta = (0, util_1.RandomBnd)(modulus_KN);
    const r = (0, util_1.RandomBnd)(modulus_KKN);
    const r_delta = delta * r;
    const myTheta = delta * phi * beta + N * delta * r;
    //broadcast theta to all parties
    otherParties.forEach((party) => party.send(JSON.stringify({ theta: myTheta.toString() })));
    //get thetas of other parties
    const otherThetas = await (0, rxjs_1.firstValueFrom)((0, rxjs_1.zip)(...otherParties.map((party) => party.bufferedMessage$.pipe((0, rxjs_1.map)((e) => BigInt(JSON.parse(e).theta))))));
    const theta = otherThetas.reduce((sum, t) => sum + t, myTheta);
    console.log("theta=", theta);
    //Ri sharing
    const coeff = (0, util_1.generate_polynomial)(threshold, modulus_KKN);
    //distribute shares of our r_delta to all parties
    const ourShare = r_delta + (0, util_1.evaluate_polynomial)(coeff, BigInt(thisPartyNumber));
    for (const party of allParties) {
        const val = r_delta + (0, util_1.evaluate_polynomial)(coeff, BigInt(party.partyNumber));
        if (party.type == "other") {
            party.party.send(JSON.stringify({ r_delta: val.toString() }));
        }
    }
    //get shares of other parties r_deltas
    const other_r_deltas = await (0, rxjs_1.lastValueFrom)((0, rxjs_1.zip)(...otherParties.map((party) => party.bufferedMessage$.pipe((0, rxjs_1.map)((e) => BigInt(JSON.parse(e).r_delta))))));
    const R = other_r_deltas.reduce((sum, share) => sum + share, ourShare);
    const f = N * R - theta;
    console.log({ f });
    let vk;
    if (!firstParty) {
        vk = (0, util_1.PowerMod)((0, util_1.Gen_Coprime)(N * N), 2n, N * N);
        otherParties.forEach((party) => party.send(JSON.stringify({ vk: vk.toString() })));
    }
    else {
        vk = await (0, rxjs_1.firstValueFrom)(firstParty.bufferedMessage$.pipe((0, rxjs_1.map)((e) => BigInt(JSON.parse(e).vk))));
    }
    console.log({ vk });
    const vki = (0, util_1.PowerMod)(vk, delta * f, N * N);
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
exports.startGeneration = startGeneration;
//# sourceMappingURL=index.js.map