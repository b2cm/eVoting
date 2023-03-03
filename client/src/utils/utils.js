import { VOTING_STATES } from "./constantes";
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

    }
    // Check if MetaMask is installed
   // MetaMask injects the global API into window.ethereum
   if (window.ethereum) {
       try {
       // check if the chain to connect to is installed
       await window.ethereum.request({
           method: 'wallet_switchEthereumChain',
           params: [{ chainId: chainId }], // chainId must be in hexadecimal numbers
       });
       } catch (error) {
       // This error code indicates that the chain has not been added to MetaMask
       // if it is not, then install it into the user MetaMask
       if (error.code === 4902) {
           try {
           await window.ethereum.request({
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
           console.error(addError);
           }
       }
       console.error(error);
       }
   } else {
       // if no window.ethereum then MetaMask is not installed
       alert('MetaMask is not installed. Please consider installing it: https://metamask.io/download.html');
   } 
}