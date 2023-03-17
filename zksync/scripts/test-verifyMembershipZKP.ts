import { Contract, Provider, Wallet, utils } from "zksync-web3";
import * as ethers from 'ethers';
import * as data from './data.json';
import dotenv from 'dotenv';
dotenv.config();

//const data  = require('./data');
// The address of the save smart contract
const WALLET = process.env.MNEMONIC_GOERLI;
// The ABI of the save smart contract
const VERIFY_ABI = (require("../artifacts-zk/contracts/Evoting.sol/Evoting.json")).abi;
const VERIFY_ADDRESS = '';

async function main() {
  // Initializing the zkSync provider
  const l1Provider = ethers.providers.getDefaultProvider("goerli");
  const l2Provider = new Provider("https://zksync2-testnet.zksync.dev");
  const wallet = new ethers.Wallet(WALLET!, l1Provider);
  const verifier = new Contract(VERIFY_ADDRESS, VERIFY_ABI, wallet);

  const zkSyncAddress = await l2Provider.getMainContractAddress();
  // Getting the `Contract` object of the zkSync bridge
  const zkSyncContract = new Contract(zkSyncAddress, utils.ZKSYNC_MAIN_ABI, wallet);

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
 
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});