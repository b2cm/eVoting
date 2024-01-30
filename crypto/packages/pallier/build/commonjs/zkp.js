"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZKP_check = exports.ZKP_comput_z = exports.ZKP_gen_cc = exports.ZKP_gen_R = exports.verifyMembershipZkp = exports.computeZKPInputs = exports.createMemberShipZKP = void 0;
const _1 = require(".");
const util_1 = require("./util");
const generator_1 = require("./generator");
const hash_1 = require("./hash");
const t_1 = require("./t");
const K_1 = require("./K");
const ethers_1 = require("ethers");
function createMemberShipZKP(message, validMessages, N, bits = 256n) {
    const r = (0, util_1.Gen_Coprime)(N);
    const cipher = (0, _1.encrypt)(message, N, r);
    const epsilon = (0, util_1.Gen_Coprime)(N);
    const ui = (0, util_1.PowerMod)(epsilon, N, N * N);
    let i;
    const us = [], es = [], vs = [];
    for (const [idx, validMessage] of validMessages.entries()) {
        //Working variables
        const gmk = (0, util_1.PowerMod)((0, generator_1.generator)(N), validMessage, N * N);
        const uk = (cipher * (0, util_1.InvMod)(gmk, N * N)) % (N * N);
        if (message != validMessage) {
            //confirm these two
            //zk
            const vj = (0, util_1.Gen_Coprime)(N);
            //ek
            const ej = (0, util_1.Gen_Coprime)(N);
            const vn = (0, util_1.PowerMod)(vj, N, N * N);
            const ue = (0, util_1.PowerMod)(uk, ej, N * N);
            const uj = (vn * (0, util_1.InvMod)(ue, N * N)) % (N * N);
            us.push(uj);
            vs.push(vj);
            es.push(ej);
        }
        else {
            us.push(ui);
            vs.push(0n);
            es.push(0n);
            i = idx;
        }
    }
    const uHash = BigInt("0x" + (0, hash_1.hash)(BigInt(us.join("")).toString(16), "hex")) % N;
    const eSum = es.filter((e) => e != 0n).reduce((acc, e) => (acc + e) % N, 0n);
    const ei = (uHash - eSum) % N;
    //Also confirm this
    const rep = (0, util_1.PowerMod)(r, ei, N);
    const vi = (epsilon * rep * (0, util_1.PowerMod)((0, generator_1.generator)(N), ei, N)) % N;
    es[i] = ei;
    vs[i] = vi;
    return [cipher, [es, us, vs]];
}
exports.createMemberShipZKP = createMemberShipZKP;
function computeZKPInputs(ciphertext, 
//[es, us, vs]: [bigint[], bigint[], bigint[]],
proof, validMessages, N) {
    const e = BigInt("0x" + (0, hash_1.hash)(BigInt(proof[1].join("")).toString(16), "hex")) % N;
    let ukInv = []; // Array containing the modular inverse of uk for each message.
    let gmk = [];
    const as = validMessages.map((m) => {
        const _gmk = (0, util_1.PowerMod)((0, generator_1.generator)(N), m, N * N);
        gmk.push(ethers_1.ethers.utils.hexlify(_gmk));
        const uk = ((0, util_1.InvMod)(_gmk, N * N));
        const _uk = (ciphertext * (0, util_1.InvMod)(_gmk, N * N)) % (N * N);
        const uki = (0, util_1.InvMod)(_uk, N * N); // Modular inverse of _uk
        ukInv.push(ethers_1.ethers.utils.hexlify(uki));
        return ethers_1.ethers.utils.hexlify(uk);
    });
    const isProofONegativ = proof[0].map((e) => {
        if (e < 0n) {
            return true;
        }
        return false;
    });
    const p = proof.map((elem, i) => elem.map((value, j) => {
        if (value < 0n) {
            //console.log(`value at index ${i}:${j}`, value);
            return ethers_1.ethers.utils.hexlify(value * -1n);
        }
        return ethers_1.ethers.utils.hexlify(value);
    }));
    return {
        proof: p,
        isProofONegativ,
        as,
        ias: ukInv,
        gmk,
        e: ethers_1.ethers.utils.hexlify(e),
    };
}
exports.computeZKPInputs = computeZKPInputs;
function verifyMembershipZkp(ciphertext, [es, us, vs], validMessages, N) {
    const e = BigInt("0x" + (0, hash_1.hash)(BigInt(us.join("")).toString(16), "hex")) % N;
    const as = validMessages.map((m) => {
        const gmk = (0, util_1.PowerMod)((0, generator_1.generator)(N), m, N * N);
        const uk = (ciphertext * (0, util_1.InvMod)(gmk, N * N)) % (N * N);
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
        const vin = (0, util_1.PowerMod)(v, N, N * N);
        const aie = (0, util_1.PowerMod)(ai, ei, N * N);
        const uiae = (ui * aie) % (N * N);
        return vin == uiae;
    });
}
exports.verifyMembershipZkp = verifyMembershipZkp;
function ZKP_gen_R(c, N, vk, delta, keyLength) {
    //step 1,2 chaintegrity
    let power1 = 2n ** ((0, t_1.get_t)() + (0, t_1.get_l)());
    let power2 = 2n ** (2n * keyLength);
    let Bound = power1 * (0, K_1.getK)() * (0, K_1.getK)() * (0, K_1.getK)() * power2;
    let r = (0, util_1.RandomBnd)(Bound);
    let R1 = (0, util_1.PowerMod)(vk, delta * r, N * N);
    let R2 = (0, util_1.PowerMod)(c, 4n * delta * r, N * N);
    return [r, R1, R2];
}
exports.ZKP_gen_R = ZKP_gen_R;
function ZKP_gen_cc(c, ci, vki, R1, R2, vk, N) {
    // step 4 challange
    let Bound = 2n ** (0, t_1.get_t)();
    //converting the numbers to strings to concatenate them
    const concatenated = BigInt(c.toString() +
        ci.toString() +
        vk.toString() +
        vki.toString() +
        R1.toString() +
        R2.toString());
    // console.log({ concatenated });
    //convert the concatenated numbers into hex
    //The hash function calculates and returns sha256 hash as a string, which we parse
    // as a BigInt
    const hashOfConcat = "0x" + (0, hash_1.hash)(concatenated.toString(16), "hex");
    console.log({ hashOfConcat });
    let cc = BigInt(hashOfConcat) % N;
    console.log({ cc });
    return cc;
}
exports.ZKP_gen_cc = ZKP_gen_cc;
function ZKP_comput_z(r, cc, fi) {
    // step 5 response
    let z = r + cc * fi;
    return z;
}
exports.ZKP_comput_z = ZKP_comput_z;
function ZKP_check(c, ci, R1, R2, z, cc, vki, N, delta, vk) {
    let equality_1_left = (0, util_1.PowerMod)(vk, delta * z, N * N);
    let equality_1_right = (0, util_1.MulMod)(R1, (0, util_1.PowerMod)(vki, cc, N * N), N * N);
    let equality_2_left = (0, util_1.PowerMod)(c, 4n * delta * z, N * N);
    let equality_2_right = (0, util_1.MulMod)(R2, (0, util_1.PowerMod)(ci, 2n * cc, N * N), N * N);
    let partial_ZKP_check = equality_1_left == equality_1_right && equality_2_left == equality_2_right;
    return partial_ZKP_check;
}
exports.ZKP_check = ZKP_check;
//# sourceMappingURL=zkp.js.map