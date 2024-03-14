const ethers = require('ethers');
require('dotenv').config();

const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;

async function main () {
    console.log('Running deployement script for paymaster...');
    const relayerHubAddr = '0x7DDa9Bf2C0602a96c06FA5996F715C7Acfb8E7b0'; // '0x40bE32219F0F106067ba95145e8F2b3e7930b201';
    const forwarder = '0xB2b5841DBeF766d4b521221732F9B618fCf34A87'; // '0x7A95fA73250dc53556d264522150A940d4C50238';
    const PAYMASTER_ADDRESS = '0x03110D41fA39c96130c89a5Cbc62c9f8bf2ea811';
    const PAYMASTER_ABI = (await hre.ethers.getContractFactory('Paymaster')).interface;
    const provider = ethers.getDefaultProvider('goerli');
    const signer = new ethers.Wallet(MNEMONIC_GOERLI, provider);
    const paymaster = new ethers.Contract(PAYMASTER_ADDRESS, PAYMASTER_ABI, provider);
    //console.log('paymaster contract deployed at address:', await paymaster.owner());
    
    // Setup paymaster
    let txHandle;
    let receipt;
    /*
    txHandle = await paymaster.connect(signer).setRelayHub(relayerHubAddr);
    receipt = await txHandle.wait();
    console.log('set up relay hub tx receipt', receipt);
    txHandle = await paymaster.connect(signer).setTrustedForwarder(forwarder);
    receipt = await txHandle.wait();
    console.log('set up forwarder tx receipt ', receipt);
    */
    txHandle =  await paymaster.connect(signer).withdrawRelayHubDepositTo(ethers.utils.parseUnits('0.1', 'ether'), signer.address);
    receipt = await txHandle.wait();
    console.log('deposit ether tx receipt', receipt); 
    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});