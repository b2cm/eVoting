const { expect } = require('chai');
//const { data } = require('../data/data');
const data = require('../data/voterData.json');
const runs = [10, 20, 30, 40, 50];
//console.log(data[0]);

describe('Verifier ZKP correct encryption', () => {
    let test;
    let result;
    beforeEach(async () => {
        const Test = await ethers.getContractFactory('VerifierZKPCorrectEncryption');
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
        for (let j = 0; j < runs.length; j++) {
            console.log(`runs:`, runs[j]);
            const gasUsed = [];
            for (let i = 0; i < runs[j]; i++) {
                const random = Math.floor(Math.random() * data.length);
                //console.log(random);
                const value = data[random].inputsProofCorrectEncr;
                const inputs = value.inputs;
                const pub = data[random].lrs.pk;
                //console.log(inputs);
                
                const gas = await test.estimateGas.verifyTx(
                    value.cipher,
                    inputs.proof,
                    inputs.isProofONegativ,
                    inputs.as,
                    inputs.ias,
                    inputs.gmk,
                    inputs.e,
                    pub
                );
                
                //console.log('gas', ethers.utils.formatEther(gas));
                gasUsed.push(gas.toNumber());
                result = await test.verifyTx(
                    value.cipher,
                    inputs.proof,
                    inputs.isProofONegativ,
                    inputs.as,
                    inputs.ias,
                    inputs.gmk,
                    inputs.e,
                    pub
                );
                expect(result).to.equal(true);
            }
            const sum = gasUsed.reduce((acc, current) => acc + current, 0);
            const min = Math.min(...gasUsed);
            const max = Math.max(...gasUsed);
            const avg = sum / runs[j];
            console.log('sum', sum);
            console.log('min', min);
            console.log('max', max);
            console.log('avg', avg);
        }
       
    }).timeout(60000 * 10000);
})