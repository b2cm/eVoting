import { expect } from "chai";
import { Wallet, Provider, Contract } from "zksync-web3";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import rich_wallets from '../data/rich-wallets.json';
import voteData from '../data/voteData.json';

import dayjs from 'dayjs';
import { ethers } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";


dayjs().format();


const RICH_WALLET_PK  = rich_wallets[0].privateKey;

async function deployContract(deployer: Deployer, args: Array<any>): Promise<Contract> {
    const artifact = await deployer.loadArtifact("Register");
    return await deployer.deploy(artifact, args);
}

const hashedIDs =  [
    "0x017120263838816985428880776989023823643384036278901155465784752207051032546510",
    "0x017220263838816985428880776989023823643384036278901155465784752207051032546510",
    "0x017320263838816985428880776989023823643384036278901155465784752207051032546510",
    "0x017420263838816985428880776989023823643384036278901155465784752207051032546510",
    "0x017520263838816985428880776989023823643384036278901155465784752207051032546510",
    "0x017620263838816985428880776989023823643384036278901155465784752207051032546510",
    "0x019747185792765960868827050530285165069897952924121500942538739311907092439245",
    "0x019647185792765960868827050530285165069897952924121500942538739311907092439245",
    "0x5780717240420866891098877738035521391484385517016472746280857894144307313984"
    ];

const pk = "0x88423a36c6caa7f7490cafb2835373ce0883a6149f1f57f61409b745aab4011c2d9cf73c038a647d4c004fca0777c09b592a721194c5ba35b4206fd470ceeb2ac0f5afa2940e2c7b72ab0a4aa4f19192071561366d2f472108c784f41ac27a54";

describe('Register contract', () => {
    let provider: Provider;
    let register: Contract;
    let receipt;
    let events;
    let tx;

    before(async () => {
        provider = Provider.getDefaultProvider();
        const wallet = new Wallet(RICH_WALLET_PK, provider);
        const deployer = new Deployer(hre, wallet);
        register = await deployContract(deployer, []);
    })

    it('should set the registration period',async () => {
        const start = dayjs().add(1, 'minute').unix();
        const end = dayjs().add(2, 'day').unix();
        //console.log('start', start);
        //console.log('end', end);
        tx = await register.setRegistrationPeriod(start, end);
        receipt = await tx.wait();
        events = receipt.events;
        expect(events[1].event).to.equal('RegistrationPeriodSet')
        //console.log('tx', receipt);
    });
/*
    it('should fails to set the registration period',async () => {
        const start = dayjs().unix();
        const end = dayjs().add(-1, 'day').unix();
        console.log('start', start);
        console.log('end', end);
        await expect(
            register.setRegistrationPeriod(start, end)
        ).to.be.revertedWith('The registration cannot end before it even starts') ;
        
    });

    it('should check if the registration is open',async () => {
        // advance time by one hour and mine a new block
        await time.increase(60);
        const open = await register.isRegistrationOpen();
        console.log('is open', open);
        
    })
*/
    it('should store voter data', async () => {
        await register.storeVoterData(hashedIDs[0], pk);
        await register.storeVoterData(hashedIDs[1], pk);
        const data = await register.getVoterData();
        console.log('data', data);
        const hashes = await register.getHashedIDs();
        console.log('hashes', hashes);
    })
})