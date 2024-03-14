import { utils, Wallet } from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import * as dotenv from 'dotenv';
dotenv.config();

const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;

export default async (hre: HardhatRuntimeEnvironment) => {
    console.log(`Running deploy script for the register contract`);
    const wallet = new Wallet(MNEMONIC_GOERLI!);
    const deployer = new Deployer(hre, wallet);
    const artifact = await deployer.loadArtifact('Register');
    const register = await deployer.deploy(artifact, []);
    const contractAddr = register.address;
    console.log(`${artifact.contractName} was deployed to ${contractAddr}`);
    
}

const address = '0x6e1941645A1EbE44363307F3890f8F34Da5b6F21';