

describe('Evoting', accounts => {
    let evoting;
    let owner;
    before(async () => {
        [owner] = await ethers.getSigners();
        const l1Verifier = owner.address;
        const voteID = ethers.utils.hexZeroPad(l1Verifier, 32);
        const name = 'test1';
        const desc = 'desc1';
        const admin = '';
        const voters = 100;
        const startTime = 1000;
        const endTime = 1100;
        
        const Evoting = await ethers.getContractFactory('Evoting');
        evoting = await Evoting.deploy(l1Verifier, voteID, name, desc, admin, startTime, endTime); 
        console.log('owner', voteID);
    }) 

    it('should add 10 new voters', async () => {
        const votes = await evoting.connect(owner).add_voter(owner.address);
        const receipt = await votes.wait()
        console.log('votes', receipt)

        const voters = await evoting.connect(owner).l1Verifier();
        console.log('voters', voters);
    })
})