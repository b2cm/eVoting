import { Contract, Provider, Wallet } from "zksync-web3";
import * as ethers from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config()

const PAYMASTER_ADDR = '0xEB7B801A52e9110329229d9785523c3Af7C0e896';
const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;

async function main() {
  const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');
  const wallet = new Wallet(MNEMONIC_GOERLI!, l2Provider);
  const amount = ethers.utils.parseEther('0.2');

  const txHandle = await wallet.transfer({
    to: PAYMASTER_ADDR,
    amount
  });
  console.log('txHanle', txHandle);
  
  const receipt = await txHandle.wait();
  console.log('receipt', receipt);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});