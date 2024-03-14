import { utils, Wallet } from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import * as dotenv from 'dotenv';
dotenv.config()
const MNEMONIC_GOERLI = process.env.MNEMONIC_GOERLI;

export default async (hre: HardhatRuntimeEnvironment) => {
    
    console.log(`Running deploy script for the evoting contract`);
   const wallet = new Wallet(MNEMONIC_GOERLI!);

    const voteID = '0x7ec23844027f44c1568a15b07355af944eedbe1c7770042025af1e7c94b47fd4'
    const name = 'vote 1';
    const desc = 'description';
    const start = 100;
    const end = 120;
    const ballot = {ballotType: 1, name: 'ballot1', information: 'info1', title: 'title1', candidates: []};
    
    const deployer = new Deployer(hre, wallet);
    const artifact = await deployer.loadArtifact('Evoting2');

    // Deposit some funds to L2 to be able to perform deposits.
    
    //const deploymentFee = await deployer.estimateDeployFee(artifact, []);
    //const deposit = ethers.utils.parseEther('0.2');
    //console.log('deposit', deposit);
    
    const evoting = await deployer.deploy(artifact, [
        voteID,
        name, 
        desc,
        wallet.address,
        start,
        end,
        [ballot]
    ]);

    const contractAddr = evoting.address;
    console.log(`${artifact.contractName} was deployed to ${contractAddr}`);

}