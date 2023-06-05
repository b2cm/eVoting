//import { BehaviorSubject } from 'rxjs';
console.log('hier;')
import { ethers } from 'ethers';
import { Contract, Provider, Wallet, utils } from "zksync-web3";
import { abi } from '../src/contracts/zksync/artifacts-zk/contracts/Register.sol';

const REGISTER_ADDR = '';
const REGISTER_ABI = abi; //(require('../contracts/zksync/artifacts-zk/contracts/Register.sol'))
const RPC_API_KEY = '';
const provider = new ethers.providers.JsonRpcProvider(RPC_API_KEY);
//const register = new ethers.Contract(REGISTER_ADDR, REGISTER_ABI, provider);
const l2Provider = new Provider("https://zksync2-testnet.zksync.dev");
const register = new Contract(REGISTER_ADDR, REGISTER_ABI, l2Provider);
console.log(REGISTER_ABI);

/*
export function updateBehaviorSubject<T>(
  subj: BehaviorSubject<T>,
  cb: (old: T) => T,
) {
  subj.next(cb(subj.getValue()));
}
*/

export async function getVoter(): Promise<void> {
  try {
    const voters = await register.getVoterIDs();
    console.log('voters', voters);
    return voters;
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function getLRSGroup(): Promise<void> {
  try {
    const voters = await register.getLRSGroup();
    console.log('group', voters);
    return voters;
  } catch (error) {
    console.error('Error:', error);
  }
}
