const { expect } = require('chai');
const { data } = require('../data/data');

describe('Verifier Membership ZKP', () => {
    let test;
    let result;
    beforeEach(async () => {
        const Test = await ethers.getContractFactory('VerifierMembershipZKP');
        test = await Test.deploy();
    })
    /*
    it('should verify every proof', async() => {
        for ( const [key, value] of Object.entries(data.values)) {
            const _as = await test.BigNumber(value.as);
            console.log('__as', _as);
            const _pub = await test.BigNumber([data.pub]);
            console.log('pub', _pub);
            const check = await test.checkEvery(value.proof, value.isProof0Negativ, _as, value.ias, _pub);
            expect(check).to.equal(true);
        }
    });
    */
   
    it('should verify the inverse modulo', async () => {
        for( const [key, value] of Object.entries(data.values)) {
            for (let i = 0; i < value.gmk.length; i++) {
                result = await test.verifyInvMod(
                    value.gmk[i],
                    data.pub,
                    value.as[i]
                );
                expect(result).to.equal(true);
            }
        }
    });

    it('should verify zkp', async () => {
        for ( const [key, value] of Object.entries(data.values)) {
            const gas = await test.estimateGas.verifyMembershipZKP(
                value.cipher,
                value.proof,
                value.isProof0Negativ,
                value.as,
                value.ias,
                value.gmk,
                value.e,
                data.pub
            );
            console.log('gas', ethers.utils.formatEther(gas));
            result = await test.verifyMembershipZKP(
                value.cipher,
                value.proof,
                value.isProof0Negativ,
                value.as,
                value.ias,
                value.gmk,
                value.e,
                data.pub
            );
            expect(result).to.equal(true);
        }
    });
})