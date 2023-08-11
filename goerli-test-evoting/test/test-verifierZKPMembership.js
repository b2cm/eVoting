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

    let verifier;
    const forwarder = '0xB2b5841DBeF766d4b521221732F9B618fCf34A87';

    before(async () => {
        const Verifier = await ethers.getContractFactory(`Verifier`);
        verifier = await Verifier.deploy(forwarder);
    })

    for (let j = 0; j < 1; j++ ) {
        it(`should verify the zkproof for tree of depth ${tree[j].depth}`, async () => {
            const keypair = require(`../data/keypairs/keypairDepth${tree[j].depth}.json`);
            const zkproofs = require(`../data/proofs/zkproofsDepth${tree[j].depth}.json`);
            const gasUsed = [];
            //console.log('contract', verifier);
            //console.log('key pair', keypair);
            const vk = {
                beta: keypair.vk.beta,
                alpha: keypair.vk.alpha,
                gamma: keypair.vk.gamma,
                delta: keypair.vk.delta,
                gamma_abc: keypair.vk.gamma_abc
            }
            
            for (let i = 0; i < zkproofs.length; i++) {
                // or verify off-chain
                /*
                const isVerified = await verifier.callStatic.verifyTx(vk, zkproofs[i].zkProof.proof, zkproofs[i].zkProof.inputs);
                console.log('is verified', i , isVerified);
                expect(isVerified).to.equal(true);
                */
                const gas = await verifier.estimateGas.verifyTx(vk, zkproofs[i].zkProof.proof, zkproofs[i].zkProof.inputs);
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

})
