const hre = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Runnun deployment script for verifierMembershipZKP contract");
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const VerifierMembershipZKP = await hre.ethers.getContractFactory("VerifierMembershipZKP");
    const verifierMembershipZKP = await VerifierMembershipZKP.deploy();

    await verifierMembershipZKP.deployed();
  
    console.log("VerifierMembershipZKP address:", verifierMembershipZKP.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });