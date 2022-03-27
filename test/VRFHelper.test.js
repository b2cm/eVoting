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
            it(`Should decode the VRF proof (${index+1}`, async () => {
                const decodedProof = await vrf_r1.decodeProof.call(test.pi_string )       
                assert(decodedProof[0].eq(web3.utils.toBN(test.gamma.x)))
                assert(decodedProof[1].eq(web3.utils.toBN(test.gamma.y)))
                assert(decodedProof[2].eq(web3.utils.toBN(test.c)))
                assert(decodedProof[3].eq(web3.utils.toBN(test.s))) 
            })
        }

        for (const [index, test] of DATA.secp256r1.entries()) {
            it(`Should compute hash to curve (${index+1})`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                const hX = test.H.x
                const hY = test.H.y
                const hash = await vrf_r1.hashToTryAndIncrement.call(pk, message)
                assert(hash[0].eq(web3.utils.toBN(hX)))
                assert(hash[1].eq(web3.utils.toBN(hY)))
            })
        }

        for (const [index, test] of DATA.secp256r1.entries()) {
            it(`Should compute fast verification parameters (${index+1})`, async () => {
                const uX = test.U.x
                const uY = test.U.y
                const sH_X = test.V.sH.x
                const sH_Y = test.V.sH.y
                const cGamma_X = test.V.cGamma.x
                const cGamma_Y = test.V.cGamma.y
                const pk = [test.pk.x, test.pk.y]
                const message = web3.utils.hexToBytes(test.alpha_string)
                const proof = await vrf_r1.decodeProof.call(test.pi_string)
                const parameters = await vrf_r1.computeFastVerifyParams.call(pk, proof, message)
                assert(parameters[0][0].eq(web3.utils.toBN(uX)))
                assert(parameters[0][1].eq(web3.utils.toBN(uY)))
                assert(parameters[1][0].eq(web3.utils.toBN(sH_X)))
                assert(parameters[1][1].eq(web3.utils.toBN(sH_Y)))
                assert(parameters[1][2].eq(web3.utils.toBN(cGamma_X)))
                assert(parameters[1][3].eq(web3.utils.toBN(cGamma_Y)))
                
            })
        }
    })

    describe("Auxiliary functions for secp256k1: ", () => {

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should decode the VRF proof (${index+1}`, async () => {
                const decodedProof = await vrf_k1.decodeProof.call(test.pi_string )        
                assert(decodedProof[0].eq(web3.utils.toBN(test.gamma.x)))
                assert(decodedProof[1].eq(web3.utils.toBN(test.gamma.y)))
                assert(decodedProof[2].eq(web3.utils.toBN(test.c)))
                assert(decodedProof[3].eq(web3.utils.toBN(test.s))) 
            })
        }

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should compute hash to curve (${index+1})`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                const hX = test.H.x
                const hY = test.H.y
                const hash = await vrf_k1.hashToTryAndIncrement.call(pk, message)
                assert(hash[0].eq(web3.utils.toBN(hX)))
                assert(hash[1].eq(web3.utils.toBN(hY)))
            })
        }

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should compute fast verification parameters (${index+1})`, async () => {
                const uX = test.U.x
                const uY = test.U.y
                const sH_X = test.V.sH.x
                const sH_Y = test.V.sH.y
                const cGamma_X = test.V.cGamma.x
                const cGamma_Y = test.V.cGamma.y
                const pk = [test.pk.x, test.pk.y]
                const message = web3.utils.hexToBytes(test.alpha_string)
                const proof = await vrf_k1.decodeProof.call(test.pi_string)
                const parameters = await vrf_k1.computeFastVerifyParams.call(pk, proof, message)
                assert(parameters[0][0].eq(web3.utils.toBN(uX)))
                assert(parameters[0][1].eq(web3.utils.toBN(uY)))
                assert(parameters[1][0].eq(web3.utils.toBN(sH_X)))
                assert(parameters[1][1].eq(web3.utils.toBN(sH_Y)))
                assert(parameters[1][2].eq(web3.utils.toBN(cGamma_X)))
                assert(parameters[1][3].eq(web3.utils.toBN(cGamma_Y)))
                 
            })
        }
    })

    describe('Proof verification functions for secp256r1: ', () => {

        for (const [index, test] of DATA.secp256r1.entries()) {
            it(`Should verify the beta string (${index+1})`, async () => {
                const beta_string = test.beta_string
                const proof = await vrf_r1.decodeProof.call(test.pi_string)
                const gammaX = proof[0]
                const gammaY = proof[1]
                const result = await vrf_r1.proofToHash.call(gammaX, gammaY)
                assert.equal(result, beta_string)
            })
        }

        for (const [index, test] of DATA.secp256r1.entries()) {
            it(`Should verify a VRF proof (${index+1})`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                const proof = await vrf_r1.decodeProof.call(test.pi_string)
                const result = await vrf_r1.verify.call(pk, proof, message)
                assert.equal(result, true)
            })
        }

        for (const [index, test] of DATA.secp256r1.entries()) {
            it(`Should verify a VRF proof using the fast verify function (${index+1})`, async () => {
                const uX = web3.utils.toBN(test.U.x)
                const uY = web3.utils.toBN(test.U.y)
                const sH_X = web3.utils.toBN(test.V.sH.x)
                const sH_Y = web3.utils.toBN(test.V.sH.y)
                const cGamma_X = web3.utils.toBN(test.V.cGamma.x)
                const cGamma_Y = web3.utils.toBN(test.V.cGamma.y)
                const uPoint = [uX, uY]
                const vComponents = [sH_X, sH_Y, cGamma_X, cGamma_Y]
                const pk = [web3.utils.hexToBytes(test.pk.x), web3.utils.hexToBytes(test.pk.y)]
                const message = web3.utils.hexToBytes(test.alpha_string)
                const proof = await vrf_r1.decodeProof.call(test.pi_string)
                const result = await vrf_r1.fastVerify.call(pk, proof, message, uPoint, vComponents)
                assert.equal(result, true)
                
            })
        }
    })

    describe('Proof verification functions for secp256k1: ', () => {

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should verify the beta string (${index+1})`, async () => {
                const beta_string = test.beta_string
                const proof = await vrf_k1.decodeProof.call(test.pi_string)
                const gammaX = proof[0]
                const gammaY = proof[1]
                const result = await vrf_k1.proofToHash.call(gammaX, gammaY)
                assert.equal(result, beta_string)
            })
        }

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should verify a VRF proof (${index+1})`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                const proof = await vrf_k1.decodeProof.call(test.pi_string)
                const result = await vrf_k1.verify.call(pk, proof, message)
                assert.equal(result, true)
            })
        }

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should verify a VRF proof using the fast verify function (${index+1})`, async () => {
                const uX = web3.utils.toBN(test.U.x)
                const uY = web3.utils.toBN(test.U.y)
                const sH_X = web3.utils.toBN(test.V.sH.x)
                const sH_Y = web3.utils.toBN(test.V.sH.y)
                const cGamma_X = web3.utils.toBN(test.V.cGamma.x)
                const cGamma_Y = web3.utils.toBN(test.V.cGamma.y)
                const uPoint = [uX, uY]
                const vComponents = [sH_X, sH_Y, cGamma_X, cGamma_Y]
                const pk = [web3.utils.hexToBytes(test.pk.x), web3.utils.hexToBytes(test.pk.y)]
                const message = web3.utils.hexToBytes(test.alpha_string)
                const proof = await vrf_k1.decodeProof.call(test.pi_string)
                const result = await vrf_k1.fastVerify.call(pk, proof, message, uPoint, vComponents)
                assert.equal(result, true)
                
            })
        }
    })
  
})