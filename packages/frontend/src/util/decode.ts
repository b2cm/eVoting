// type Answer = 'yes' | 'no' | 'unknown';

// pad zeros to left of string with upper bound of 12 bits
/**
 *
 * @date 9/2/2023 - 12:47:32 PM
 *
 * @param {string} str
 * @returns {*}
 */
const padZeros = (str: string) => {
  return str.padStart(12, "0");
};

/**
 *
 * @date 9/2/2023 - 12:47:32 PM
 *
 * @export
 * @param {string[]} encodings
 * @returns {*}
 */
export function decodeVotes(encodings: string[]) {
  const results = Array(4)
    .fill(null)
    .map(() => ({ yes: 0, no: 0, unknown: 0 }));

  for (let encoding of encodings) {
    encoding = padZeros(encoding);
    for (let i = 0; i < 4; i++) {
      const chunk = encoding.slice(i * 3, (i + 1) * 3);

      switch (chunk) {
        case "100":
          results[i].yes += 1;
          break;
        case "010":
          results[i].no += 1;
          break;
        case "001":
          results[i].unknown += 1;
          break;
        default:
          throw new Error(`Invalid encoding: ${chunk}`);
      }
    }
  }

  return results;
}

/**
 *
 * @date 9/2/2023 - 12:47:32 PM
 *
 * @type {{}}
 */
const encodings = ["100001100100", "010001100100", "001001100100"];
console.log(decodeVotes(encodings));
