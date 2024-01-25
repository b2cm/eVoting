import { ethers } from 'ethers';
import { Contract , Provider, Wallet, utils } from "zksync-web3";
import  { abi as REGISTER_ABI }  from '../artifacts-zk/contracts/Register.sol/Register.json';
import { abi as FACTORY_ABI } from '../artifacts-zk/contracts/FactoryEvoting.sol/FactoryEvoting.json';
import { abi as EVOTING_ABI } from '../artifacts-zk/contracts/Evoting.sol/Evoting.json';

const REGISTER_ADDR = '0x6fE6a63e47a7E40989beB80d00Cb57C60046ED3e'  //'0x3041abcb251FF01A41a9FA7D533186D9C92FbDb4';
const FACTORY_ADDR = '0x3516FdFB9997A225901212cF090d339f0804739D';
const l2Provider = new Provider("https://zksync2-testnet.zksync.dev");
const register = new Contract(REGISTER_ADDR, REGISTER_ABI, l2Provider);
const factory = new Contract(FACTORY_ADDR, FACTORY_ABI, l2Provider);

export async function getHashedIDs(){
  try {
    const voters = await register.getVoterIDs();
    return voters;
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function getLRSGroup(){
  try {
    const voters = await register.getLRSGroup();
    return voters;
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function getVotes(voteID: string) {
    try {
        const voteAddr = await factory.get_voting(voteID);
        console.log('address', voteAddr);
        const STATE = ['IN_PREPARATION', 'LIVE', 'COMPLETED', 'CANCELLED'];
        const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
        if (voteAddr != ZERO_ADDRESS) {
            const voting = new Contract(voteAddr, EVOTING_ABI, l2Provider);
            const state = STATE[await voting.get_state()];
            if (state === STATE[2]) { // The voting phase is completed
                const votes = await voting.get_votes()
                return votes;
            } else {
                return;
            }
        }
        else {
            return;
        }
    } catch (error) {
        console.log('Error:', error);
    }
}

async function setRegistrationPeriod() {
  const txHandle = await register.setRegistrationPeriod(1696506365, 1697370365);
  await txHandle.wait();
}

(async () =>  {
    //console.log('voters', await getHashedIDs());
    //console.log('groups', await getLRSGroup());
    //getVotes('0x2998466520658708884397b435ff540590f1b01a81c436940ce6efdb75514577')
    setRegistrationPeriod();
})();
