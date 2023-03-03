import { utils, Wallet } from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import * as dotenv from 'dotenv';
dotenv.config();

const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;

export default async (hre: HardhatRuntimeEnvironment) => {
    console.log(`Running deploy script for the paymaster contract`);
    const wallet = new Wallet(MNEMONIC_GOERLI!);
    
    const deployer = new Deployer(hre, wallet);
    const artifact = await deployer.loadArtifact('ZkSyncPaymaster');

    // Deposit some funds to L2 to be able to perform deposits.
    
    const deploymentFee = await deployer.estimateDeployFee(artifact, []);
    console.log('deployment fee', ethers.utils.formatEther(deploymentFee));
  
    const paymaster = await deployer.deploy(artifact, []);
    const contractAddr = paymaster.address;
    console.log(`${artifact.contractName} was deployed to ${contractAddr}`);
}