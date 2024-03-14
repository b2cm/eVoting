import { Contract, Provider, Wallet, utils } from "zksync-web3";
import * as ethers from 'ethers';

// The address of the save smart contract
const EVOTING_ADDRESS = '0x8CA5cBAB6859D77514F4BA22d54201619757D7c8' ///'0x54C26460cfEf6ed20e5931Ffd19e6E0B889EDa99' 
const PAYMASTER_ADDRESS = '0x632291638f2604Df86166F2FCf103A1cC0c0dbBB';
const EMPTY_WALLET_PK = '0xae622a130ad11499d9928fd852811a3f0d0d2a61a0a8e519b06cdbc21238ec25';
// The ABI of the save smart contract
const EVOTING_ABI = (require("../artifacts-zk/contracts/Evoting.sol/Evoting.json")).abi;

async function main() {
  // Initializing the zkSync provider
  const l1Provider = ethers.providers.getDefaultProvider("goerli");
  const l2Provider = new Provider("https://zksync2-testnet.zksync.dev");
  const wallet = new ethers.Wallet(EMPTY_WALLET_PK, l1Provider);
  const evoting = new Contract(EVOTING_ADDRESS, EVOTING_ABI, wallet);
  const balance = (await l2Provider.getBalance(PAYMASTER_ADDRESS));
  console.log('paymaster balance:', ethers.utils.formatEther(balance));
  const ballot = {name: 'ballot2', information: 'info2', title: 'title2'};

  const zkSyncAddress = await l2Provider.getMainContractAddress();
  // Getting the `Contract` object of the zkSync bridge
  const zkSyncContract = new Contract(zkSyncAddress, utils.ZKSYNC_MAIN_ABI, wallet);

  const evotingInterface = new ethers.utils.Interface(EVOTING_ABI);
  const data = evotingInterface.encodeFunctionData('close_voting', []);
  console.log('data', data);
  const gasPrice = await l2Provider.getGasPrice();
  console.log('gas price:', ethers.utils.formatEther(gasPrice));
  const ergsLimit = ethers.BigNumber.from(100000);
  const baseCost = await zkSyncContract.l2TransactionBaseCost(gasPrice, ergsLimit, ethers.utils.hexlify(data).length);
  
  console.log('base cost:', baseCost);
  console.log(ethers.utils.formatEther(700000000000))
  

  // Estimate gas fee for mint transaction
  const gas = await evoting.estimateGas.add_ballots([ballot],
    {
      customData: {
          ergsPerPubData: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: {
              paymaster: PAYMASTER_ADDRESS,
              // empty input as our paymaster doesn't require additional data
              paymasterInput: "0x",
          },
      }
    },);
  console.log('gas:', ethers.utils.formatEther(gas));

   // Encoding the ApprovalBased paymaster flow's input
   const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
    type: 'General',
    innerInput: new Uint8Array(),
});

  const txHandle = await evoting.add_ballots([ballot],
    {
      // Provide gas params manually
      maxFeePerGas: gasPrice,
      maxPriorityFeePerGas: gasPrice,
      gasLimit: gas,

      // paymaster info
      customData: {
        paymasterParams,
        ergsPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
       },
    }
   );

  console.log('tx', txHandle);
  const receipt = await txHandle.wait();
  console.log('receipt', receipt.logs);
  console.log(`Votings ${(await evoting.ballot_papers(0))}`);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});