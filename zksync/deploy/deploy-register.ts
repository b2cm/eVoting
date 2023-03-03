import { utils, Wallet } from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import * as dotenv from 'dotenv';
dotenv.config();

const MNEMONIC_DEPLOYER = process.env.MNEMONIC_DEPLOYER;

export default async (hre: HardhatRuntimeEnvironment) => {
    console.log(`Running deploy script for the register contract`);
    const wallet = new Wallet(MNEMONIC_DEPLOYER!);
    const deployer = new Deployer(hre, wallet);
    const artifact = await deployer.loadArtifact('Register');
    const register = await deployer.deploy(artifact, []);
    const contractAddr = register.address;
    console.log(`${artifact.contractName} was deployed to ${contractAddr}`);
    
}