import { _0n, _1n, _2n } from "./constant";
export const hexToNumber = (hex) => BigInt(`0x${hex}`);
export const intToBinary = (num) => {
    let n = num;
    if (n < _0n)
        throw new Error("expected greater than 0");
    if (n < _2n)
        return [n === _1n];
    let binary = [];
    binary.push(n % _2n === _1n);
    while (n > 0) {
        n = n / _2n;
        const bool = n % _2n === _1n;
        binary = [bool].concat(binary);
    }
    return binary.slice(1, binary.length);
};
//# sourceMappingURL=utils.js.map