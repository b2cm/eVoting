import { Contract, Provider, Wallet } from "zksync-web3";
import * as ethers from 'ethers';
import dotenv from "dotenv";
dotenv.config();

const MNEMONIC = process.env.MNEMONIC_GOERLI;

// The address of the save smart contract
const VOTING_ADDRESS = '0xa6493eE2B71AD5D64A88Ce5f92836ca7f0b72b3a' //'0x0413CC2C04d539b54Bd3B34a7ca18f70De5296E1'//'0xB74A64147cE92F125b91E02700Ba34EbC2399996' //'0xB2Ba9a4e1C302b5B1ef591b749cF2EB5C6c45A7e';
const VOTING_ADDRESS2 = '0x8deaB1c409803D8cdE223a905DfBa249E1F09ABB';
const VOTING_ADDRESS3 = '0x6BdD4d2B806c05Ee323E730deAb4cf1eEd7c504d';
const VOTING_ADDRESS4 = '0x595e13F5826a724a075fa80a57Bcb25786260E30';
// The ABI of the save smart contract
const VOTING_ABI = (require("../artifacts-zk/contracts/Evoting.sol/Evoting.json")).abi;

async function main() {
  let txHandle, receipt;
  // Initializing the zkSync provider
  const VOTING_STATES = ['IN_PREPARATION', 'LIVE', 'COMPLETED']
  const l2Provider = new Provider("https://zksync2-testnet.zksync.dev");
  const wallet = new Wallet(MNEMONIC!, l2Provider);
  const voting = new Contract(VOTING_ADDRESS, VOTING_ABI, l2Provider);
 // console.log(`name: ${(await voting.name())}`);
  //console.log(`ballots: ${(await voting.ballot_papers(1))}`);
  console.log(`votes: ${(await voting.get_votes())}`);
  console.log(`vote start: ${(await voting.start_time())}`);
  console.log(`vote end: ${(await voting.end_time())}`);
  //await voting.open_voting();
  //console.log(`vote status: ${VOTING_STATES[(await voting.votingState())]}`);
  //console.log(`main address: ${(await voting.mainAddr())}`);
  console.log(`main address: ${(await voting.get_voters())}`);
  console.log(`createAt: ${(await voting.createAt())}`);

  //txHandle = await voting.setMainContractAddress('0x0D3b69fbBE6e004F6b08Edd500D442D974B4f83e');
  //receipt = await txHandle.wait();
  //console.log('receipt:', receipt);
  //console.log(`main address: ${(await voting.mainAddr())}`)

  //txHandle = await voting.close_voting2();
  //receipt = await txHandle.wait();
  //console.log('receipt:', receipt);
  //console.log(`vote status: ${VOTING_STATES[(await voting.votingState())]}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});