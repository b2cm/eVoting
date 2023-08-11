import { extendEnvironment, task, subtask } from "hardhat/internal/core/config/config-env";

require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");
//require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

const API_KEY = process.env.API_KEY;
const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;
const MNEMONIC_DEPLOYER = process.env.MNEMONIC_DEPLOYER;
const GOERLI_URL = `https://goerli.infura.io/v3/${API_KEY}`;


// dynamically changes endpoints for local tests
const zkSyncTestnet =
  process.env.NODE_ENV == "test"
    ? {
        url: "http://localhost:3050",
        ethNetwork: "http://localhost:8545",
        zksync: true,
      }
    : {
        url: "https://testnet.era.zksync.dev",
        ethNetwork: "goerli",
        zksync: true,
      };

module.exports = {
  zksolc: {
    version: '1.3.8',
    compilerSource: 'binary',
    settings: {
      optimizer: {
        enabled: false,
        mode: 'z'
      },
   
    },
  },
  defaultNetwork: "zkSyncTestnet",
  
  networks: {
    zkSyncTestnet,
    /*
    zkSyncTestnet: {
      url: "https://zksync2-testnet.zksync.dev", // URL of the zkSync network RPC
      ethNetwork: GOERLI_URL,//"goerli", // Can also be the RPC URL of the Ethereum network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
      zksync: true,
    },
    */
    goerli: {
      url: GOERLI_URL,
      accounts: [MNEMONIC_GOERLI]
    },
    hardhat: {
      zksync: true,
      forking: {
        url: GOERLI_URL
      }
    }
  },
  
  paths: {
    cache: '../client/src/contracts/zksync/cache',
    artifacts: '../client/src/contracts/zksync/artifacts'
  },
  
  solidity: {
    version: "0.8.17",
  },
};