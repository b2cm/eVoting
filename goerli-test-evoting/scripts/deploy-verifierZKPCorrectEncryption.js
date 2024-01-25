const hre = require('hardhat');

async function main() { 
    console.log("Running deployment script for verifier contract");

    const Verifier = await hre.ethers.getContractFactory("VerifierZKPCorrectEncryption");
    const verifier = await Verifier.deploy();

    await verifier.deployed();
  
    console.log("VerifierZKPCorrectEncrytion deployed at:", verifier.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });