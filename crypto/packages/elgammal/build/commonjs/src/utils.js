"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intToBinary = exports.hexToNumber = void 0;
const constant_1 = require("./constant");
const hexToNumber = (hex) => BigInt(`0x${hex}`);
exports.hexToNumber = hexToNumber;
const intToBinary = (num) => {
    let n = num;
    if (n < constant_1._0n)
        throw new Error("expected greater than 0");
    if (n < constant_1._2n)
        return [n === constant_1._1n];
    let binary = [];
    binary.push(n % constant_1._2n === constant_1._1n);
    while (n > 0) {
        n = n / constant_1._2n;
        const bool = n % constant_1._2n === constant_1._1n;
        binary = [bool].concat(binary);
    }
    return binary.slice(1, binary.length);
};
exports.intToBinary = intToBinary;
//# sourceMappingURL=utils.js.map