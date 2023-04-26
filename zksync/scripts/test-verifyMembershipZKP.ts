import { Contract, Provider, Wallet, utils } from "zksync-web3";
import * as ethers from 'ethers';
import * as data from './data.json';
import 'dotenv/config';

//const data  = require('./data');
// The address of the save smart contract
const WALLET = process.env.MNEMONIC_GOERLI;
// The ABI of the save smart contract
const VERIFY_ABI = (require("../../client/src/contracts/zksync/artifacts-zk/contracts/VerifierMembershipZKP.sol/VerifierMembershipZKP.json")).abi;
const VERIFY_ADDRESS = '0xe9Bf660Ac84cE567c2b2c252AB60467469Ea1c1e' //'0x9841A1904A8Fd56Dd9124eF46aEA731fa82c4711';

async function main() {
  // Initializing the zkSync provider
  const l2Provider = new Provider("https://zksync2-testnet.zksync.dev");
  const wallet = new ethers.Wallet(WALLET!, l2Provider);
  const verifier = new Contract(VERIFY_ADDRESS, VERIFY_ABI, wallet);

 /*
  for ( const [key, value] of Object.entries(data.values)) {
   
    const result = await verifier.verifyMembershipZKP(
        value.cipher,
        value.proof,
        value.isProof0Negativ,
        value.as,
        value.ias,
        value.gmk,
        value.e,
        data.pub
    );
    console.log('result', result);
}
*/
const num = await verifier.add1(1, 2);
console.log('num', num);
const num2 = await verifier.add2('0x0001', '0x0002');
console.log('num 2', num2);
 
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});