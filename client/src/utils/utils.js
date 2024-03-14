import { Contract } from 'zksync-web3';
import dayjs from 'dayjs';
import { 
    VOTING_STATES, 
    ZERO_ADDRESS,
 } from "./constantes";
import detectEthereumProvider from '@metamask/detect-provider';

import { ELECTION_CANCELED_COLOR,
    ELECTION_IN_PREPARATION_COLOR,
    ELECTION_IN_PROGRESS_COLOR,
    ELECTION_TERMINATED_COLOR,
 } from "./colors";

export const getElectionStateColor = (state) => {

    if (state === VOTING_STATES[0]) {
        return ELECTION_IN_PREPARATION_COLOR;
    } else if (state === VOTING_STATES[1]) {
        return ELECTION_IN_PROGRESS_COLOR;
    } else if (state === VOTING_STATES[2]) {
        return ELECTION_TERMINATED_COLOR;
    } else if (state === VOTING_STATES[3]) {
        return ELECTION_CANCELED_COLOR;
    }
}

export const setSource = (depth) => {
    const source = `
import "hashes/poseidon/poseidon" as hash;
import "hashes/utils/256bitsDirectionHelper" as multiplex;

const u32 DEPTH = ${depth}; // defins the depth of the merkle tree, here it is 2**4

// Merke-Tree inclusion proof for tree depth 4 using SNARK-efficient poseidon hashes
// directionSelector => true if current digest is on the rhs of the hash otherwise false
// public parameter: root
// private parameter: direction selector, path, leaf

def select(bool condition, field left, field right) -> (field, field) {
    return (condition ? right : left, condition ? left : right);
}

def main(field root, private field leaf, private bool[DEPTH] directionSelector, private field[DEPTH] path) -> bool {
    // Start from the leaf
    field mut digest = leaf;

    // Loop up the tree
    for u32 i in 0..DEPTH {
        (field, field) s = select(directionSelector[i], digest, path[i]);
        digest = hash([s.0, s.1]);
    }

    return digest == root;
}`
    return source;
}

export const switchNetwork = async (chain) => {
    let chainId;
    let chainName;
    let rpcUrl;
    let blockExplorer;
    const goerliChainId = '0x5';
    const zksyncChainID = '0x118';
    const hardhatId = '0x7a69';

    if (chain === 'goerli') {
        chainId = goerliChainId;
        chainName = 'Goerli Testnetzwerk';
        rpcUrl = 'https://goerli.infura.io/v3/';
        blockExplorer = 'https://goerli.etherscan.io';
    }
    else if (chain === 'zksync') {
        chainId = zksyncChainID;
        chainName = 'ZKSync Era Testnetzwerk';
        rpcUrl = 'https://zksync2-testnet.zksync.dev';
        blockExplorer = 'https://zksync2-testnet.zkscan.io/';

    } else if (chain === 'hardhat') {
        chainId = hardhatId;
        chainName = 'Hardhat';
        rpcUrl = 'http://127.0.0.1:8545/';
        blockExplorer = '';
    }
    // Check if MetaMask is installed
   // MetaMask injects the global API into window.ethereum
   const provider = await detectEthereumProvider();
   if (provider) {
       try {
        //alert(`eth:${chainId}`);
       // check if the chain to connect to is installed
       await provider.request({
           method: 'wallet_switchEthereumChain',
           params: [{ chainId: chainId }], // chainId must be in hexadecimal numbers
       });
       } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902 || error.code === -32603) { // error code = -32603 => error code on metamask mobile browser
            try {
            await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                {
                    chainId: chainId,
                    chainName: chainName,
                    nativeCurrency: {
                        name: 'Ether',
                        symbol: 'ETH',
                        decimals: 18
                    },
                    rpcUrls: [rpcUrl],
                    blockExplorerUrls: [blockExplorer]
                },
                ],
            });
            } catch (addError) {
                //alert(addError);
                console.error(addError);
            }
        } else {
            //alert('something going wrong here.');
            console.error(error);
        }
       }
   } else {
       // if no window.ethereum then MetaMask is not installed
       //alert('MetaMask is not installed. Please consider installing it: https://metamask.io/download.html');
   } 
}


export  const getVoteDetails = async (voteContractAddr, voteID, evotingABI, l2Provider) => {
    try {
        const contract = new Contract(voteContractAddr, evotingABI, l2Provider);
        const voteName = await contract.name();
        const voteDescription = await contract.description();
        const voteState = VOTING_STATES[(await contract.get_state())];
        const voteStartTime = (await contract.start_time()).toNumber();
        const voteEndTime = (await contract.end_time()).toNumber();
        const admin = await contract.admin();
        const _ballots = [];
        const ballots = await contract.get_ballot_papers();
        
        for (let i = 0; i < ballots.length; i++) {
            const ballot = {
                ballotType: ballots[i].ballotType,
                name: ballots[i].name,
                information: ballots[i].information,
                title: ballots[i].title,
                candidates: ballots[i].candidates
            }
            _ballots.push(ballot);
        }
        const data = {
            voteName: voteName,
            voteDescription: voteDescription,
            voteStart: dayjs(voteStartTime * 1000),
            voteEnd: dayjs(voteEndTime * 1000),
            voteID: voteID,
            voteState: voteState,
            admin: admin,
            ballots: _ballots,
        }

        return data; 
    } catch (error) {
        console.error(error);
    }
} 

export const getEvoting = async(l2Contracts, l2Provider, artifacts, voteID) => {
    const factory = l2Contracts.FactoryEvoting;
    const EVOTING_ABI = artifacts[2].abi;
    const voteContractAddr = await factory.get_voting('0x' + voteID);
    const evoting = new Contract(voteContractAddr, EVOTING_ABI, l2Provider);
    return evoting;
}

export const getBallots = async (evoting) => {
    try {    
        const _ballots = [];
        const ballots = await evoting.get_ballot_papers();

        for (let i = 0; i < ballots.length; i++) {
            const ballot = {
                ballotType: ballots[i].ballotType,
                name: ballots[i].name,
                information: ballots[i].information,
                title: ballots[i].title,
                candidates: ballots[i].candidates
            }
            _ballots.push(ballot);
        }
        
        return _ballots;
    } catch (error) {
        console.error(error);
    }
}