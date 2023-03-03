import { Contract, Provider, Wallet, utils } from "zksync-web3";
import * as ethers from 'ethers';

const FACTORY_ADDRESS = '0xBbc715Dd320175d509b004891c33807d710285c4' //'0xD567799364D81B487A9626B2864feC02971Df6e2';
const PAYMASTER_ADDRESS = '0x632291638f2604Df86166F2FCf103A1cC0c0dbBB';
const VERIFIER_ADDRESS = '0x1Aa873d9921bc70306Ae9Ee419298750c9f6212f';
const EMPTY_WALLET_PK = '0xae622a130ad11499d9928fd852811a3f0d0d2a61a0a8e519b06cdbc21238ec25';
const MAIN_ADDRESS = '0x0D3b69fbBE6e004F6b08Edd500D442D974B4f83e';
const FACTORY_ABI = (require("../../client/src/contracts/ZK/artifacts-zk/contracts/FactoryEvoting2.sol/FactoryEvoting2.json")).abi;

async function main() {
  // Initializing the zkSync provider
  const l2Provider = new Provider("https://zksync2-testnet.zksync.dev");
  const wallet = new Wallet(EMPTY_WALLET_PK, l2Provider)
  const factory = new Contract(FACTORY_ADDRESS, FACTORY_ABI, wallet);
  const balance = (await l2Provider.getBalance(PAYMASTER_ADDRESS));
  console.log('paymaster balance:', ethers.utils.formatEther(balance));

  //console.log('add admin:', await factory.add_admin(wallet.address));
  //console.log('admins:', await factory.get_admins());
  //console.log('is admin:', await factory.is_admin(wallet.address));
  const name = 'test1';
  const desc = 'desc1';
  const admin = 'admin1';
  const start = 1671786900;
  const end = 1671787800;
  const start2 = 1671787800;
  const end2 = 1671788400
  const ballot = {ballotType: 1, name: 'ballot1', information: 'info1', title: 'title1', candidates: ['candidate1', 'candidate2']};

  const gasPrice = await l2Provider.getGasPrice();
  //const test = await factory.estimateGas.add_admin(wallet.address);
  //console.log('gas limit add new admin', test);
  console.log('gas price:', ethers.utils.formatEther(gasPrice));

   // Encoding the ApprovalBased paymaster flow's input
   const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
    type: 'General',
    innerInput: new Uint8Array(),
});

const voteID = '0x435d4789b97bfe801deea5e1b476a2ce1a3fd64baac9aba809fbb31aead10e01';

  // Estimate gas fee for mint transaction
  const gasLimit = await factory.estimateGas.new_voting(
    voteID,
    name,
    desc,
    start2,
    end2,
    [ballot],
     {
      customData: {
          ergsPerPubData: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: {
              paymaster: PAYMASTER_ADDRESS,
              // empty input as our paymaster doesn't require additional data
              paymasterInput: "0x",
          },
      },
  });

  const fee = gasPrice.mul(gasLimit);
  console.log('fee', ethers.utils.formatEther(fee));

  const txHandle = await factory.new_voting(
    voteID,
    name,
    desc,
    start2,
    end2,
    [ballot],
    {
      // Provide gas params manually
      maxFeePerGas: gasPrice,
      maxPriorityFeePerGas: gasPrice,
      gasLimit,

      // paymaster info
      customData: {
        paymasterParams,
        ergsPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
       },
    }
   );

  console.log('tx', txHandle);
  const receipt = await txHandle.wait();
  console.log('receipt', receipt.events);
  console.log(`Votings ${(await factory.get_votings())}`);

  

/*

  // function new_voting(bytes32 _voteID, string memory _name, string memory _description, string memory _admin, uint256 _voters, uint256 _start_time, uint256 _end_time, Utils.BallotPaper[] memory _ballot_papers)
 
  const txHandle = await factory.new_voting(
    VERIFIER_ADDRESS,
    name,
    desc,
    admin,
    start,
    end,
    [ballot],
    {
      // Provide gas params manually
      maxFeePerGas: gasPrice,
      maxPriorityFeePerGas: gasPrice,
      gasLimit,

      // paymaster info
      customData: {
        paymasterParams,
        ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
       },
    });
  console.log('tx', txHandle);
  const receipt = await txHandle.wait();
  console.log('receipt', receipt);
  console.log(`Votings ${(await factory.get_votings())}`);
*/
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});