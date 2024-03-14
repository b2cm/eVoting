const { expect } = require('chai');
const fs = require('fs');

describe('Verify zksnarks proof of membership', () => {

    const tree  = [
        { depth: 2, min: 3, max: 4 },
        { depth: 3, min: 5, max: 8 },
        { depth: 4, min: 9, max: 16 },
        { depth: 5, min: 17, max: 32 },
        { depth: 6, min: 33, max: 64 },
        { depth: 7, min: 65, max: 128 },
        { depth: 8, min: 129, max: 256 },
        { depth: 9, min: 257, max: 512 },
        { depth: 10, min: 513, max: 1024 }
    ];

    const gasData = {
        description: 'This file contains the gas analysis for the verification of the membership zkp for different tree depth',
        data: []
    };

    for (let j = 0; j < tree.length; j++ ) {
        it(`should verify the zkproof for tree of depth ${tree[j].depth}`, async () => {
            const Verifier = await ethers.getContractFactory(`VerifierDepth${tree[j].depth}`);
            const verifier = await Verifier.deploy();
            const keypair = require(`../data/keypairs/keypairDepth${tree[j].depth}.json`);
            const zkproofs = require(`../data/proofs/zkproofsDepth${tree[j].depth}.json`);
            const gasUsed = [];
            for (let i = 0; i < zkproofs.length; i++) {
                // or verify off-chain
                const isVerified = await verifier.verifyTx(zkproofs[i].zkProof.proof, zkproofs[i].zkProof.inputs);
                //console.log('is verified', i , expect(isVerified).to.equal(true));
                expect(isVerified).to.equal(true);
                const gas = await verifier.estimateGas.verifyTx(zkproofs[i].zkProof.proof, zkproofs[i].zkProof.inputs);
                console.log('gas used', i , gas.toNumber());
                gasUsed.push(gas.toNumber());
           }
           const totalGasUsed = gasUsed.reduce((acc, current) => acc + current, 0);
           const minGasUsed = Math.min(...gasUsed);
           const maxGasUsed = Math.max(...gasUsed);
           const avgGasUsed = (totalGasUsed / tree[j].max);

           const data = {
            description: `Gas data for tree of depth ${tree[j].depth}`,
            totalGasUsed,
            avgGasUsed,
            maxGasUsed,
            minGasUsed
           }
           gasData.data.push(data);
           //console.log('avg gas used', minGasUsed,  maxGasUsed, avgGasUsed);
            
        }).timeout(60000 * 10000);
    }

    after(() => {
        console.log('gas data', gasData);

        fs.writeFileSync(`data/gasDataOptimizerEnabled.json`, JSON.stringify(gasData), 
                {
                    encoding: "utf8",
                    flag: "w",
                }
            );
    })

})
