const ethers = require('ethers');
require('dotenv').config();
const { data } = require('../data/data');

// The address of the save smart contract
const VERIFIER_MEMBERSHIPZKP_ADDRESS = '0xBb00F6fB79D4922D95b4ad53a6358f297CC0435E';
const API_KEY = process.env.API_KEY;
const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;
const VERIFIER_MEMBERSHIPZKP_ABI = (require("../../client/src/contracts/goerli/artifacts/contracts/VerifierMembershipZKP.sol/VerifierMembershipZKP.json")).abi;


async function main() {
  console.log('Running verifier membershipZKP script...');
  const goerliProvider = ethers.getDefaultProvider(`https://goerli.infura.io/v3/${API_KEY}`);
  // ! => A non null assertion => It removes 'undefined' and 'null' from a type without doing any explicit type checking.
  const adminWallet =  new ethers.Wallet(MNEMONIC_GOERLI, goerliProvider);
  const verifier = new ethers.Contract(VERIFIER_MEMBERSHIPZKP_ADDRESS, VERIFIER_MEMBERSHIPZKP_ABI, adminWallet);

  for ( const [key, value] of Object.entries(data.values)) {
    const result = await verifier.callStatic.verifyMembershipZKP(
        value.cipher,
        value.proof,
        value.isProof0Negativ,
        value.as,
        value.ias,
        value.gmk,
        value.e,
        data.pub
    );
    console.log(`result for data ${key}: ${result}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});