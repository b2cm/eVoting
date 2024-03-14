const hre = require('hardhat');

async function main() {  
    console.log("Running deployment script for Verifier contract...");
    console.log(process.env.NODE_ENV);
    let forwarder;
    if (process.env.NODE_ENV === 'local_test') {
      forwarder = require('../build/gsn/Forwarder.json').address;
    } else {
      forwarder = '0xB2b5841DBeF766d4b521221732F9B618fCf34A87';
    }

    const Verifier = await hre.ethers.getContractFactory("VerifierZKPMembership");
    const verifier = await Verifier.deploy(forwarder);

    await verifier.deployed();
  
    console.log("VerifierZKPMembership deployed at address:", verifier.address);
    
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });