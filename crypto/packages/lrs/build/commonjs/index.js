"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyKeyPair = exports.verifySignature = exports.signData = exports.Signature = exports.generatePair = exports.KeyPair = void 0;
const tslib_1 = require("tslib");
const Crypto_LRS_SimpleAPI_1 = require("./lib/Crypto.LRS.SimpleAPI");
const big_integer_1 = tslib_1.__importDefault(require("big-integer"));
class KeyPair {
    constructor(party) {
        this._party = party ? party : (0, Crypto_LRS_SimpleAPI_1.gen)();
    }
    get publicKey() {
        return this._party.value0;
    }
    get privateKey() {
        return this._party.value1;
    }
    get party() {
        return this._party;
    }
}
exports.KeyPair = KeyPair;
function generatePair() {
    return new KeyPair();
}
exports.generatePair = generatePair;
class Signature {
    constructor(signature) {
        this.signature = signature;
    }
    get inner() {
        return this.signature;
    }
    get y0() {
        return this.signature.value0;
    }
    get s() {
        return this.signature.value1;
    }
    get c() {
        return this.signature.value2;
    }
    toJSON(_k) {
        const y0 = this.y0.toString(16);
        const s = this.s.toString(16);
        const c = this.c.map((x) => x.toString(16));
        return {
            y0,
            s,
            c,
        };
    }
}
exports.Signature = Signature;
function signData(ring, pair, data) {
    const s = (0, Crypto_LRS_SimpleAPI_1.sign)(ring)(pair.party)(data)();
    return new Signature(s);
}
exports.signData = signData;
function verifySignature(data, signature, ring) {
    return (0, Crypto_LRS_SimpleAPI_1.verify)(ring)(signature.inner)(data);
}
exports.verifySignature = verifySignature;
function verifyKeyPair(privateKey, publicKey) {
    const correctPubKey = (0, Crypto_LRS_SimpleAPI_1.genPublicKey)((0, big_integer_1.default)(privateKey));
    return correctPubKey.eq((0, big_integer_1.default)(publicKey));
}
exports.verifyKeyPair = verifyKeyPair;
