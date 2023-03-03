const hre = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const forwarder = '0x7A95fA73250dc53556d264522150A940d4C50238'
  
    const Verifier = await hre.ethers.getContractFactory("Verifier");
    const verifier = await Verifier.deploy(forwarder);

    await verifier.deployed();
  
    console.log("Verifier address:", verifier.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });