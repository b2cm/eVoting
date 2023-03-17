import { utils, Wallet } from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import * as dotenv from 'dotenv';
dotenv.config()
const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;

export default async (hre: HardhatRuntimeEnvironment) => {
    console.log(`Running deploy script for the verifyMembershipZkp contract`);
    const wallet = new Wallet(MNEMONIC_GOERLI!);
    const deployer = new Deployer(hre, wallet);
    const artifact = await deployer.loadArtifact('VerifyMembersipZKP');

    const verifyMembershipZkp = await deployer.deploy(artifact, []);

    const contractAddr = verifyMembershipZkp.address;
    console.log(`${artifact.contractName} was deployed to ${contractAddr}`);

}