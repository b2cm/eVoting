const { expect } = require('chai');
const voterData = require('../data/voterData.json');

const runs = [10, 50, 100, 200, 300, 400, 500 ];

describe('Verifier ZKP correct encryption', () => {
    let test;
    let result;
    const gasUsed = [];
    beforeEach(async () => {
        const Test = await ethers.getContractFactory('VerifierZKPCorrectEncryption');
        test = await Test.deploy();
    })
   

  voterData.slice(0, 10).map(( data, index) => {
    it(`should verify zkp of correct encryption for ${index + 1}iem voter data`, async () => {
        const value = data.inputsProofCorrectEncr.inputs
        //console.log(value.isProofONegativ);
        const cipher = data.inputsProofCorrectEncr.cipher;
        const pk = data.lrs.pk;
        //console.log('e', await test.BN([value.e]));

        //const bn = await test.BN(value.ias);
        //console.log('bn', bn);
        //console.log('cipher', value.isProofONegativ);
        //console.log('invariant', value.ias);
        //console.log('response', data1.inputsProofCorrectEncr.plain);

        const gas = await test.estimateGas.verifyTx(
            cipher,
            value.proof, 
            value.isProofONegativ,
            value.as,
            value.ias, 
            value.gmk,
            value.e,
            pk 
        );
        //console.log('gas', ethers.utils.formatEther(gas));
        //gasUsed.push(gas.toNumber());

        const res = await test.verifyTx(
            cipher,
            value.proof, 
            value.isProofONegativ,
            value.as,
            value.ias, 
            value.gmk,
            value.e,
            pk 
        );
    
        //console.log('res', res);
        expect(res).to.equal(true);

    });
  });
  /*
  after(() => {
    const totalGasUsed = gasUsed.reduce((acc, current) => acc + current, 0);
    const minGasUsed = Math.min(...gasUsed);
    const maxGasUsed = Math.max(...gasUsed);
    const avgGasUsed = (totalGasUsed / voterData.slice(0, 100).length);

    console.log('total gas used:', totalGasUsed);
    console.log('max gas used:', maxGasUsed);
    console.log('min gas used:', minGasUsed);
    console.log('avg gas used:', avgGasUsed);
  })
  */
})