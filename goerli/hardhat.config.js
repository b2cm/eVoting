//require("@matterlabs/hardhat-zksync-deploy");
//require("@matterlabs/hardhat-zksync-solc");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;
const ALCHEMY_URL = process.env.ALCHEMY_URL;

module.exports = {
  zksolc: {
    version: "1.2.2",
    compilerSource: "binary",
    settings: {},
  },
  defaultNetwork: "zkSyncTestnet",
  
  networks: {
    zkSyncTestnet: {
      url: "https://zksync2-testnet.zksync.dev",
      ethNetwork: "goerli", // Can also be the RPC URL of the network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
      zksync: true,
    },
    goerli: {
      url: ALCHEMY_URL, //`https://goerli.infura.io/v3/${API_KEY}`,
      accounts: [MNEMONIC_GOERLI]
    },
  },
  
  paths: {
    cache: '../client/src/contracts/goerli/cache',
    artifacts: '../client/src/contracts/goerli/artifacts'
  },
  
  solidity: {
    version: "0.8.16",
  },
};