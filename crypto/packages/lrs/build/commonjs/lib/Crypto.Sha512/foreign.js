"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmacSha512 = exports.sha512 = void 0;
const crypto_js_1 = require("crypto-js");
function sha512(bits) {
    let arr;
    if (typeof bits == "string") {
        arr = crypto_js_1.enc.Hex.parse(bits);
    }
    else {
        arr = crypto_js_1.lib.WordArray.create(bits);
    }
    return (0, crypto_js_1.SHA512)(arr).toString();
}
exports.sha512 = sha512;
function hmacSha512(key) {
    return function (bits) {
        return crypto_js_1.algo.HMAC.create(crypto_js_1.algo.SHA512, key)
            .update(bits)
            .finalize()
            .toString();
    };
}
exports.hmacSha512 = hmacSha512;
