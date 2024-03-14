const { expect } = require('chai');
const data = require('../data/data-correct-dec.json');
const { ethers } = require('hardhat');

const func = (test) => {

}

describe('Verifier ZKP correct decryption', () => {
    let test;
    const runs = [10, 20, 30, 40, 50];
    beforeEach(async () => {
        const Test = await ethers.getContractFactory('VerifierZKPCorrectDecryption');
        test = await Test.deploy();
    })

    runs.map(run => {
        let dataSet = data.slice(0, run);
        it(`should verify zkp of correct decryption for ${run} data set`, async () => {
            console.log('run:', run);
            const gasUsed = [];
            for (let j = 0; j < dataSet.length; j++) {
                const elem = dataSet[j];
                const _c = ethers.BigNumber.from(BigInt(elem.c));
                const _ci = ethers.BigNumber.from(BigInt(elem.ci));
                const _R1 = ethers.BigNumber.from(BigInt(elem.R1));
                const _R2 = ethers.BigNumber.from(BigInt(elem.R2));
                const _z = ethers.BigNumber.from(BigInt(elem.z));
                const _cc = ethers.BigNumber.from(BigInt(elem.cc));
                const _vki = ethers.BigNumber.from(BigInt(elem.vki));
                const _N = ethers.BigNumber.from(BigInt(elem.N));
                const _delta = ethers.BigNumber.from(BigInt(elem.delta));
                const _vk = ethers.BigNumber.from(BigInt(elem.vk));
                
                const gas = await test.estimateGas.verifyTx(
                    _c,
                    _ci,
                    _R1,
                    _R2,
                    _z,
                    _cc,
                    _vki,
                    _N,
                    _delta,
                    _vk
                );
                //console.log('gas', gas);
                gasUsed.push(gas.toNumber());
                const result = await test.verifyTx(
                    _c,
                    _ci,
                    _R1,
                    _R2,
                    _z,
                    _cc,
                    _vki,
                    _N,
                    _delta,
                    _vk
                );
                expect(result).to.equal(true);
            }
            const totalGasUsed = gasUsed.reduce((acc, current) => acc + current, 0);
            const minGasUsed = Math.min(...gasUsed);
            const maxGasUsed = Math.max(...gasUsed);
            const avgGasUsed = (totalGasUsed / dataSet.length);

            console.log('total gas used:', totalGasUsed);
            console.log('max gas used:', maxGasUsed);
            console.log('min gas used:', minGasUsed);
            console.log('avg gas used:', avgGasUsed);
        });
    
    })
  /*
  after(() => {
    const totalGasUsed = gasUsed.reduce((acc, current) => acc + current, 0);
    const minGasUsed = Math.min(...gasUsed);
    const maxGasUsed = Math.max(...gasUsed);
    const avgGasUsed = (totalGasUsed / data.length);

    console.log('total gas used:', totalGasUsed);
    console.log('max gas used:', maxGasUsed);
    console.log('min gas used:', minGasUsed);
    console.log('avg gas used:', avgGasUsed);
  })
  */
  
})

 /*   
    it('should verify the zkp of correct decryption', async () => {
        for(let i = 0; i < runs.length; i++) {
            const run = runs[i];
            console.log(`run:`, run);

            if (run == 10) {
                data.slice(0,10).map(async ( elem, index) => {
                    const _c = ethers.BigNumber.from(BigInt(elem.c));
                        const _ci = ethers.BigNumber.from(BigInt(elem.ci));
                        const _R1 = ethers.BigNumber.from(BigInt(elem.R1));
                        const _R2 = ethers.BigNumber.from(BigInt(elem.R2));
                        const _z = ethers.BigNumber.from(BigInt(elem.z));
                        const _cc = ethers.BigNumber.from(BigInt(elem.cc));
                        const _vki = ethers.BigNumber.from(BigInt(elem.vki));
                        const _N = ethers.BigNumber.from(BigInt(elem.N));
                        const _delta = ethers.BigNumber.from(BigInt(elem.delta));
                        const _vk = ethers.BigNumber.from(BigInt(elem.vk));
                        
                        console.log('c = ', _c);
                        console.log('ci = ', _ci);
                        console.log('R1 = ', _R1);
                        console.log('R2 = ', _R2);
                        console.log('z = ', _z);
                        console.log('cc = ', _cc);
                        console.log('vki = ', _vki);
                        console.log('N = ', _N);
                        console.log('delta = ', _delta);
                        console.log('vk = ', _vk);
                        
                        const gas = await test.estimateGas.verifyTx(
                            _c,
                            _ci,
                            _R1,
                            _R2,
                            _z,
                            _cc,
                            _vki,
                            _N,
                            _delta,
                            _vk
                        );
                        console.log('gas', gas);
                        gasUsed.push(gas.toNumber());
                        const result = await test.verifyTx(
                            _c,
                            _ci,
                            _R1,
                            _R2,
                            _z,
                            _cc,
                            _vki,
                            _N,
                            _delta,
                            _vk
                        );
                        expect(result).to.equal(true);
              });  
            }
            if (run == 20) {
                
            }
            if (run == 30) {
                
            }
            if (run == 40) {
                
            }
            if (run == 50) {
                
            }
    
        }
    })
*/