const ethers = require('ethers');

async function main () {
    const relayerHubAddr = '0x40bE32219F0F106067ba95145e8F2b3e7930b201';
    const forwarder = '0x7A95fA73250dc53556d264522150A940d4C50238';
    const irelayHub = require('../IRelayHub.json');
    const Paymaster = await hre.ethers.getContractFactory('Paymaster');
    const paymaster = await Paymaster.deploy();
    await paymaster.deployed();
    
    // Setup paymaster
    let txHandle;
    let receipt;
    const relayHub = await new hre.ethers.Contract(irelayHub, relayerHubAddr)
    txHandle = await paymaster.setRelayHub(relayHub);
    receipt = await txHandle.wait();
    console.log('set up relay hub tx receipt', receipt);
    txHandle = await paymaster.setTrustedForwarder(forwarder);
    receipt = await txHandle.wait();
    console.log('set up forwarder tx receipt ', receipt);
    txHandle =  await paymaster.deposit({ value: hre.ethers.parseUnits('0,1', 'ether')});
    receipt = await txHandle.wait();
    console.log('deposit ether tx receipt', receipt); 
    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });