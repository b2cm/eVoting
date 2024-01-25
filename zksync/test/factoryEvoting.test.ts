import { expect } from "chai";
import { Wallet, Provider, Contract } from "zksync-web3";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import rich_wallets from '../data/rich-wallets.json';
import voteData from '../data/voteData.json';

import dayjs from 'dayjs';
import { ethers } from "ethers";
dayjs().format();


const RICH_WALLET_PK  = rich_wallets[0].privateKey;

async function deployContract(deployer: Deployer, args: Array<any>): Promise<Contract> {
    const artifact = await deployer.loadArtifact("FactoryEvoting");
    return await deployer.deploy(artifact, args);
  }

describe('FactoryEvoting', function () {
    let provider: Provider;
    let deployer: Deployer;
    let factory: Contract;
    const addresses: any[] = [];
    let address, start, end, args;
    const data = voteData[0];

    before(async () => {
        provider = Provider.getDefaultProvider();
        const wallet = new Wallet(RICH_WALLET_PK, provider);
        deployer = new Deployer(hre, wallet);
        factory = await deployContract(deployer, []);
    }) 
    
/*
    it('should deploy 10 new Voting that start now and end in 10 days', async () => {
        for (let i = 0; i < 1; i++) {
            start = dayjs().unix();
            end = dayjs().add(10, 'day').unix();
            args = [data.id, data.name, data.description, start, end, data.ballots];
            const gasLimit = await factory.estimateGas.new_voting(...args);
            console.log('gas', gasLimit.toNumber());
            const txHandle = await factory.new_voting(...args);
            const receipt = await txHandle.wait();
            const events = receipt.events;
            address = events[3].args[0];
            addresses.push({
                address,
                start, 
                end
            });
            expect(events[3].event).to.equal('VotingCreated');
        }  
    }).timeout(60000 * 10);

    it('should deploy 10 new Voting that start in 10 day and end 2 days later', async () => {
        for (let i = 0; i < 10; i++) {
            start = dayjs().add(10, 'day').unix();
            end = dayjs().add(12, 'day').unix();
            const args = [data.id, data.name, data.description, start, end, data.ballots];
            const gasLimit = await factory.estimateGas.new_voting(...args);
            console.log('gas', gasLimit.toNumber());
            const txHandle = await factory.new_voting(...args);
            const receipt = await txHandle.wait();
            const events = receipt.events;
            const address = events[3].args[0];
            addresses.push({
                address,
                start, 
                end
            });
            expect(events[3].event).to.equal('VotingCreated');
        }  
    }).timeout(60000 * 10);
    
    it(`should'nt be possible to create 10 new voting that start in the past`, async () => {
        for (let i = 0; i < 1; i++) {
            const args = [data.id, data.name, data.description, dayjs().unix(), dayjs().subtract(1, 'day').unix(), data.ballots];
            await expect(
                factory.new_voting(...args)
            ).to.be.revertedWith('The end time must be greater than the start time.');
        }  
    });
*/
    it('should check the state of ech deployed voting',async () => {
        const VOTINGSTATE = ['IN_PREPARATION', 'LIVE', 'COMPLETED', 'CANCELLED'];
        const artifact = await deployer.loadArtifact('Evoting');
        const contractData = [];
        // Deploy 10 votings that satrt now and end in 10 days
        for (let i = 0; i < 10; i++) {
            const start = dayjs().unix();
            const end = dayjs().add(10, 'day').unix();
            const args = [data.id, data.name, data.description, start, end, data.ballots];
            const txHandle = await factory.new_voting(...args);
            const receipt = await txHandle.wait();
            const events = receipt.events;
            const address = events[3].args[0];
            contractData.push({
                address,
                start, 
                end
            });
        }
        // Deploy 10 votings that start in 10 days and end 2 days later
        for (let i = 0; i < 10; i++) {
            const start = dayjs().add(10, 'day').unix();
            const end = dayjs().add(12, 'day').unix();
            const args = [data.id, data.name, data.description, start, end, data.ballots];
            const txHandle = await factory.new_voting(...args);
            const receipt = await txHandle.wait();
            const events = receipt.events;
            const address = events[3].args[0];
            contractData.push({
                address,
                start, 
                end
            });
        }

        contractData.forEach(( element, index) => async () => {
            const contract = new ethers.Contract(element.address, artifact.abi, provider);
            const state = VOTINGSTATE[await contract.get_state()];
            if (index < 10) { // The 10 first votings start now
                expect(state).to.equal(VOTINGSTATE[1]); 
            } else {
                expect(state).to.equal(VOTINGSTATE[0]);
            }

        })

    }).timeout(60000 * 10);

    after(async () => {
        console.log('addresses out of test');
        it('should log the vote addresses', async () => {
            console.log('addresses', addresses);
        })
    })
});
