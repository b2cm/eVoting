require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;
const ALCHEMY_URL = process.env.ALCHEMY_URL;
const GOERLI_URL = `https://goerli.infura.io/v3/${API_KEY}`;

module.exports = {
  networks: {
    hardhat: {
      //chainId: 1337, // We set 1337 to make interacting with MetaMask simpler
      /*
      forking: {
        url: GOERLI_URL
      }
      */
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
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};