const ethers = require('ethers');
require('dotenv').config();

// The address of the save smart contract
const REGISTRAR_ADDRESS = '0xcF9352523905Ac7D0A810D9AE0a9BDbA2E4123CE' //'0x737d6aFFa007bD30eBA7557C1009666332fd3a3B' //'0xc146544959e126B19987033F8E12e08118C512AC'
const API_KEY = process.env.API_KEY;
const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;
const PK2 = 'fc70c0a02bb895ed11b855d62be1894db85eef244b1510996a65e3a86373e441'
const PK_RICH_WALLET = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
// The ABI of the save smart contract
const REGISTRAR_ABI = (require("../artifacts-zk/contracts/l1_contracts/RegisterUpkeeper.sol/RegisterUpkeeper.json")).abi;
const LINK_ABI = require('./LINK_ABI.json');
const KEEPER_REGISTRAR_ABI = require('./KeeperRegistrar.json');
const LINK_ADDRESS = '0x326c977e6efc84e512bb9c30f76e30c160ed06fb';

async function main() {
  console.log('Running registrar script...');
  const goerliProvider = ethers.getDefaultProvider('http://127.0.0.1:8545')//(`https://goerli.infura.io/v3/${API_KEY}`);
  // ! => A non null assertion => It removes 'undefined' and 'null' from a type without doing any explicit type checking.
  const adminWallet =  new ethers.Wallet(MNEMONIC_GOERLI, goerliProvider);
  const wallet2 =  new ethers.Wallet(PK2, goerliProvider);
  const registrar = new ethers.Contract(REGISTRAR_ADDRESS, REGISTRAR_ABI, adminWallet);
  const link = new ethers.Contract(LINK_ADDRESS, LINK_ABI, adminWallet);
  const upkeeperName = 'TestEv';
  const encryptedEmail = '0x';
  const upkeeperContract = '0x13c4E53c649F1aCB8498ae481bD7bF0Fb9f2f6FB';
  const gasLimit = 6500000;
  const adminAddr = adminWallet.address;
  const checkData = '0x';
  const amount = 5n * 10n ** 18n;
  const source = 0;

  const errorData = '0x649bf810';
  const error1 = 'InvalidAdminAddress()';
  const error2 = 'RequestNotFound()';
  const error3 = 'HashMismatch()';
  const error4 = 'OnlyAdminOrOwner()';
  const error5 = 'InsufficientPayment()';
  const error6 = 'RegistrationRequestFailed()';
  const error7 = 'OnlyLink()';
  const error8 = 'AmountMismatch()';
  const error9 = 'SenderMismatch()';
  const error10 = 'FunctionNotPermitted()';
  const error11 = 'LinkTransferFailed(address)';
  const error12 = 'InvalidDataLength()';
  
  const errors = [error1, error2, error3, error4, error5, error6, error7, error8, error9, error10, error11, error12];

  const evotingInterface = new ethers.utils.Interface(KEEPER_REGISTRAR_ABI);
  for (let i = 0; i < errors.length; i++) {
    let data;
    if (errors[i] === error11) {
        data = evotingInterface.encodeErrorResult(errors[i], [adminWallet.address]);
        
    }else {
        data = evotingInterface.encodeErrorResult(errors[i], []);
    }

    console.log(`error data ${i}`, data);
    if (data === errorData) {
        console.log('match:', errors[i]);
    }
  }
  const gasPrice = await goerliProvider.getGasPrice();
  console.log('gas price', ethers.utils.formatEther(gasPrice));

  let txHandle, receipt;
  const registrarAddr = '0x9806cf6fBc89aBF286e8140C42174B94836e36F2' //'0xE226D5aCae908252CcA3F6CEFa577527650a9e1e' //'0x29BA782aC65C22a43F6Fe358aF077aA906cD6c86' //'0x9806cf6fBc89aBF286e8140C42174B94836e36F2'; 
  const registryAddr = '0x02777053d6764996e594c3E88AF1D58D5363a2e6' //'0x42b0891D7D9fC32C2c8AbB533C079110324A8f7e' //'0x233a95ccEBF3c9f934482c637c08B4015cDd6ddD' //'0x02777053d6764996e594c3E88AF1D58D5363a2e6';

  const encoder = new ethers.utils.AbiCoder;
  const value = ''//encoder.decode(['bytes4'], '0x649bf810');
  //console.log('value', value);

  txHandle = await registrar.set_registrar(registrarAddr);
  txHandle = await registrar.set_registry(registryAddr);
  
  console.log(`registrar address: ${await registrar.registrar()}`);
  console.log(`registry address: ${await registrar.i_registry()}`);
  
  // Estimate gas fee for mint transaction
  txHandle = await registrar.registerAndPredictID(
    upkeeperName,
    encryptedEmail,
    upkeeperContract,
    gasLimit,
    adminAddr,
    checkData,
    amount,
    source,
    );
    
    
  // txHandle = await link.transferAndCall(wallet2.address, 5, '0x');
  console.log('tx:', txHandle);
  receipt = await txHandle.wait();
  console.log('receipt:', receipt);
  /*
  console.log('admin wallet balance link:', ethers.utils.formatUnits(await link.balanceOf(adminWallet.address), 18));
  console.log('wallet 2 balance link:', (await link.balanceOf(wallet2.address)).toString());
 */
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
