import { extendEnvironment, task, subtask } from "hardhat/internal/core/config/config-env";

require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
//require("@nomicfoundation/hardhat-toolbox");

const API_KEY = process.env.API_KEY;
const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;
const MNEMONIC_DEPLOYER = process.env.MNEMONIC_DEPLOYER;
const GOERLI_URL = `https://goerli.infura.io/v3/${API_KEY}`;

extendEnvironment((hre) => {
  hre.hi = 'hello hardhat';
});

task('envtest', 'Just testing things', async (args, hre) => {
  console.log(hre);
});

task('balance', "Prints an account's balance")
  .addParam('account', "The account's address")
  .setAction(async (taskArgs) => {
    const balance = await ethers.provider.getBalance(taskArgs.account);
    console.log('provider:', ethers);
    console.log(ethers.utils.formatEther(balance), "ETH");
  });
  task("BAD", "This task is broken", async () => {
    setTimeout(() => {
      throw new Error(
        "This task's action returned a promise that resolved before I was thrown"
      );
    }, 1000);
  });
  task("delayed-hello", "Prints 'Hello, World!' after a second", async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("Hello, World!");
        resolve(void 0);
      }, 1000);
    });
  });
  task("hello-world", "Prints a hello world message").setAction(
    async (taskArgs, hre) => {
      await hre.run("print", { message: "Hello, World!" });
    }
  );
  
  subtask("print", "Prints a message")
    .addParam("message", "The message to print")
    .setAction(async (taskArgs) => {
      console.log(taskArgs.message);
    });
  

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
    zkSyncTestnet: {
      url: "https://zksync2-testnet.zksync.dev", // URL of the zkSync network RPC
      ethNetwork: GOERLI_URL,//"goerli", // Can also be the RPC URL of the Ethereum network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
      zksync: true,
    },
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