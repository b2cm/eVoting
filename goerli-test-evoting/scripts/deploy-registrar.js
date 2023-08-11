
async function main() {
  console.log('Deploying registrar contract on goerli script...');

  const linkAddr = '0x326C977E6efc84E512bB9C30f76E30c160eD06FB';
  const registrarAddr = '0x57A4a13b35d25EE78e084168aBaC5ad360252467';
  const registryAddr = '0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2';


  const Resgistar = await ethers.getContractFactory('RegisterUpkeeper');
  const registrar = await Resgistar.deploy(linkAddr, registrarAddr, registryAddr);
  await registrar.deployed();
  console.log('Registrar contract deployed at: ', registrar.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});