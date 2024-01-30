import { lib, enc, SHA512, algo } from "crypto-js";
export function sha512(bits) {
    let arr;
    if (typeof bits == "string") {
        arr = enc.Hex.parse(bits);
    }
    else {
        arr = lib.WordArray.create(bits);
    }
    return SHA512(arr).toString();
}
export function hmacSha512(key) {
    return function (bits) {
        return algo.HMAC.create(algo.SHA512, key)
            .update(bits)
            .finalize()
            .toString();
    };
}
