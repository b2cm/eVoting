const { expect } = require("chai");
const voteData = require('../data/voteData.json');
const dayjs = require('dayjs');
const { ethers } = require("hardhat");
dayjs().format();


describe('Evoting', function () {
    let evoting;
    let start, end;
    const data = voteData[0];

    before(async () => {
        start = dayjs().unix();
        end = dayjs().add(10, 'day').unix();
        const [owner] = await ethers.getSigners();
        //console.log('admin', owner);
        const admin = owner.address;//'0x0De02Aa844f82EB3fB83A4CF4aB15bE6eD6884A7';
        //console.log('admin', admin);
        const args = [data.id, data.name, data.description, admin, start, end, data.ballots];
        evoting = await ethers.deployContract('Evoting', args);
        //const Evoting = await ethers.getContractFactory('Evoting');
        //evoting = await Evoting.deploy(...args);
       
        
    }) 

    it('should send vote type 2', async () => {
   
        const index = 1;
        const sessionId = '123';
        const cipherText = 'abcd';
        const p1 = ['1', '2', '3'];
        const p2 = ['4', '5', '6'];
        const p3 = ['7', '8', '9'];
        const proof = { p1, p2, p3 };
        const y0 = '0';
        const s = 's';
        const c = ['1', '2', '3'];
        const signature = { y0, s, c };
        const groupId = '1';
        const token = '000';
        const b = {
            sessionId,
            cipherText,
            proof,
            signature,
            groupId,
            token
        };
        const ballot = [ b, b, b, b];
     const votes = [
        ballot,
        [b]
     ];
     //const gas = await evoting.estimateGas.vote(votes);
     //console.log('gas', gas);
     const txHandle = await evoting.cast_vote(votes);
     const receipt = await txHandle.wait();
     console.log('receipt', receipt);

     const v = await evoting.get_votes();
     console.log('votes', v);
    
    })
    

});