const DATA = require("./data_p256_solidity.json")
const VRF_P256_LIBRARY = artifacts.require('./VRF_P256')
const VRF_R1 = artifacts.require('./VRFTestHelper_SECP256R1')
const VRF_K1 = artifacts.require('./VRFTestHelper_SECP256K1')

contract("VRFTestHelper", () => {
    let vrf_r1
    let vrf_k1

    before( async () => {
        const vrf_library = await VRF_P256_LIBRARY.new()
        await VRF_R1.detectNetwork()
        await VRF_R1.link('VRF_P256', vrf_library.address)
        vrf_r1 = await VRF_R1.new()
        vrf_k1 = await VRF_K1.new()
    })

    describe("Auxiliary functions for secp256r1: ", () => {
        
        for (const [index, test] of DATA.secp256r1.entries()) {
            it('', async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string

                const decodedProof = await vrf_r1.decodeProof(test.pi_string )  
                console.log(`gas used to decode the ${index+1} proof:`, decodedProof.receipt.gasUsed)   
                
                const hash = await vrf_r1.hashToTryAndIncrement(pk, message)
                console.log(`gas used to compute the ${index+1} hash string:`, hash.receipt.gasUsed) 

                const proof = await vrf_r1.decodeProof.call(test.pi_string)
                const parameters = await vrf_r1.computeFastVerifyParams(pk, proof, message)
                console.log(`gas used to compute the parameter for ${index+1} test vector:`, parameters.receipt.gasUsed) 
             
            })
        }
    })

    describe("Auxiliary functions for secp256k1: ", () => {

        for (const [index, test] of DATA.secp256k1.entries()) {
            it('', async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string

                const decodedProof = await vrf_k1.decodeProof(test.pi_string )  
                console.log(`gas used to decode the ${index+1} proof:`, decodedProof.receipt.gasUsed)   
                
                const hash = await vrf_k1.hashToTryAndIncrement(pk, message)
                console.log(`gas used to compute the ${index+1} hash string:`, hash.receipt.gasUsed) 

                const proof = await vrf_k1.decodeProof.call(test.pi_string)
                const parameters = await vrf_k1.computeFastVerifyParams(pk, proof, message)
                console.log(`gas used to compute the parameter for ${index+1} test vector:`, parameters.receipt.gasUsed) 
            })
        }
    })

    describe('Proof verification functions for secp256r1: ', () => {

        for (const [index, test] of DATA.secp256r1.entries()) {
            it('', async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string

                const uX = web3.utils.toBN(test.U.x)
                const uY = web3.utils.toBN(test.U.y)
                const sH_X = web3.utils.toBN(test.V.sH.x)
                const sH_Y = web3.utils.toBN(test.V.sH.y)
                const cGamma_X = web3.utils.toBN(test.V.cGamma.x)
                const cGamma_Y = web3.utils.toBN(test.V.cGamma.y)
                const uPoint = [uX, uY]
                const vComponents = [sH_X, sH_Y, cGamma_X, cGamma_Y]
                const proof = await vrf_r1.decodeProof.call(test.pi_string)
                const gammaX = proof[0]
                const gammaY = proof[1]

                let result = await vrf_r1.proofToHash(gammaX, gammaY)
                console.log(`gas used to compute the hash string for ${index+1} test vector:`, result.receipt.gasUsed)

                result = await vrf_r1.verify(pk, proof, message)
                console.log(`gas used to verify the proof for ${index+1} test vector:`, result.receipt.gasUsed)

                result = await vrf_r1.fastVerify(pk, proof, message, uPoint, vComponents)
                console.log(`gas used to verify the proof for ${index+1} test vector using the fast verify method:`, result.receipt.gasUsed)
            })
        }

    })

    describe('Proof verification functions for secp256k1: ', () => {
        for (const [index, test] of DATA.secp256r1.entries()) {
            it('', async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string

                const uX = web3.utils.toBN(test.U.x)
                const uY = web3.utils.toBN(test.U.y)
                const sH_X = web3.utils.toBN(test.V.sH.x)
                const sH_Y = web3.utils.toBN(test.V.sH.y)
                const cGamma_X = web3.utils.toBN(test.V.cGamma.x)
                const cGamma_Y = web3.utils.toBN(test.V.cGamma.y)
                const uPoint = [uX, uY]
                const vComponents = [sH_X, sH_Y, cGamma_X, cGamma_Y]
                const proof = await vrf_k1.decodeProof.call(test.pi_string)
                const gammaX = proof[0]
                const gammaY = proof[1]

                let result = await vrf_k1.proofToHash(gammaX, gammaY)
                console.log(`gas used to compute the hash string for ${index+1} test vector:`, result.receipt.gasUsed)

                result = await vrf_k1.verify(pk, proof, message)
                console.log(`gas used to verify the proof for ${index+1} test vector:`, result.receipt.gasUsed)

                result = await vrf_k1.fastVerify(pk, proof, message, uPoint, vComponents)
                console.log(`gas used to verify the proof for ${index+1} test vector using the fast verify method:`, result.receipt.gasUsed)
            })
        }
    })
  
})