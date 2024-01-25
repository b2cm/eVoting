const MerkleTree = require('../cryptography/merkletree');
const voterData = require('../data/voter-data.json');
const fs = require('fs');


const setSource = (depth) => {
    const source = 
    `
        import "hashes/poseidon/poseidon" as hash;
        import "hashes/utils/256bitsDirectionHelper" as multiplex;

        const u32 DEPTH = ${depth}; // defins the depth of the merkle tree, here it is 2**4

        // Merke-Tree inclusion proof for tree depth 4 using SNARK-efficient poseidon hashes
        // directionSelector => true if current digest is on the rhs of the hash otherwise false
        // public parameter: root
        // private parameter: direction selector, path, leaf

        def select(bool condition, field left, field right) -> (field, field) {
            return (condition ? right : left, condition ? left : right);
        }

        def main(field root, private field leaf, private bool[DEPTH] directionSelector, private field[DEPTH] path) -> bool {
            // Start from the leaf
            field mut digest = leaf;

            // Loop up the tree
            for u32 i in 0..DEPTH {
                (field, field) s = select(directionSelector[i], digest, path[i]);
                digest = hash([s.0, s.1]);
            }

            return digest == root;
        }
    `
    return source;
}

    // number of voters = 1 => tree depth = 0
    // number of voters = 2 => depth tree = 1
    // number of voters = 3 - 4 => depth tree = 2
    // number of voters = 5 - 8 => depth tree = 3
    // number of voters = 9 - 16 => depth tree = 4
    // number of voters = 17 - 32 => depth tree = 5
    // number of voters = 33 - 64 => depth tree = 6
    // number of voters = 65 - 128 => depth tree = 7
    // number of voters = 129 - 256 => depth tree = 8
    // number of voters = 257 - 512 => depth tree = 9
    // number of voters = 513 - 1024 => depth tree = 10
       
  

(async () => {
    let { initialize } = await import("zokrates-js");
    const hashedIDs = voterData.map(data => BigInt(data.hashedID));
    //console.log('data', hashedIDs);
    const voterIDs = voterData.map(data => data.voterID);
    const treeDepths  = [
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
   
    treeDepths.forEach(tree => {
        const newHashedIDs = hashedIDs.slice(0, tree.max);
        const merkleTree = new MerkleTree(newHashedIDs, { isHashed: true});
        const depth = merkleTree.getDepth();
        const root = merkleTree.getRoot().toString();
    
        initialize().then( async zokratesProvider => {
    
            // compilation
            const artifacts = zokratesProvider.compile(setSource(depth));
    
            // run setup
            const keypair = zokratesProvider.setup(artifacts.program);
            const pkArray = Array.from(keypair.pk);
            const newKeypair = {
                vk: keypair.vk,
                pk: pkArray
            }
            
            fs.writeFileSync(`data/keypairs/keypairDepth${tree.depth}.json`, JSON.stringify(newKeypair), 
                {
                    encoding: "utf8",
                    flag: "w",
                }
            );
            
           const zkproofs = [];
            for (let i = 0; i < newHashedIDs.length; i++) {
                const proof = merkleTree.getProof(newHashedIDs[i]);
                const args = [root, proof.hashedID, proof.directionSelector, proof.siblingValues];
                // computation
                const { witness, output } = zokratesProvider.computeWitness(artifacts, args);
                // generate proof
                const zkProof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);
       
                zkproofs.push({
                    hashedID: newHashedIDs[i].toString(),
                    zkProof
                });
                // or verify off-chain
                //const isVerified = zokratesProvider.verify(keypair.vk, zkProof);
                //console.log('is verified', isVerified);
            }

            fs.writeFileSync(`data/proofs/zkproofsDepth${tree.depth}.json`, JSON.stringify(zkproofs), 
                {
                    encoding: "utf8",
                    flag: "w",
                }
            );
    
            // export solidity verifier
            const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk); 
            fs.writeFileSync(`contracts/VerifierDepth${tree.depth}.sol`, verifier, 
                {
                    encoding: "utf8",
                    flag: "w",
                }
            );
            
        })
    })

})();