/**
 *
 *
 * @returns {{bigint}} all the possibilites
 */
const messagePossibilities = () => {
  // generate all possibble 12 bit combinations of binary fpr eg 000000000001
  const possibilities: bigint[] = [];
  for (let i = 0; i < 4096; i++) {
    const binary = i.toString(2);
    const binaryString = binary.padStart(12, "0");
    possibilities.push(BigInt("0b" + binaryString));
  }
  return possibilities;
};

export default messagePossibilities;
