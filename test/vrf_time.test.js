const BN = require('bn.js')
const DATA = require("./data_p256_solidity.json")
const VRF_P256_LIBRARY = artifacts.require('./VRF_P256')
const VRF_R1 = artifacts.require('./VRFTestHelper_SECP256R1')
const VRF_K1 = artifacts.require('./VRFTestHelper_SECP256K1')
const VRF_P256 = require('../client/src/vrf_p256')

contract("VRFTestHelper", () => {
    let vrf_secp256k1
    let vrf_secp256r1
    let vrf_r1
    let vrf_k1

    before(async () => {
        const vrf_library = await VRF_P256_LIBRARY.new()
        await VRF_R1.detectNetwork()
        await VRF_R1.link('VRF_P256', vrf_library.address)
        vrf_r1 = await VRF_R1.new()
        vrf_k1 = await VRF_K1.new()
        vrf_secp256k1 = new VRF_P256('secp256k1')
        vrf_secp256r1 = new VRF_P256('p256')
    })

    describe("Auxiliary functions for secp256r1: ", () => {

        for (const [index, test] of DATA.secp256r1.entries()) {
            it(`Should decode the ${index+1} proof`, async () => {
                const pi_string = test.pi_string
                await vrf_r1.decodeProof(pi_string)
            })
        }

        for (const [index, test] of DATA.secp256r1.entries()) {
            it(`Should compute the ${index+1} hash string`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                await vrf_r1.hashToTryAndIncrement(pk, message)
            })
        }

        for (const [index, test] of DATA.secp256r1.entries()) {
            it(`Should compute the ${index+1} params for fastVerify`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                const pi_string = test.pi_string
                const decoded_proof = vrf_secp256r1.decode_proof(pi_string.slice(2))
                const gamma = decoded_proof[0]
                const gammaX = gamma.getX()
                const gammaY = gamma.getY()
                const c = decoded_proof[1]
                const s = decoded_proof[2]
                const proof = [gammaX, gammaY, c, s]
                await vrf_r1.computeFastVerifyParams(pk, proof, message)
            })
        }
    })

    describe('Proof verification functions for secp256r1: ', () => {

        for (const [index, test] of DATA.secp256r1.entries()) {
            it(`Should compute the ${index+1} hash string`, async () => {
                const pi_string = test.pi_string
                const decoded_proof = vrf_secp256r1.decode_proof(pi_string.slice(2))
                const gamma = decoded_proof[0]
                const gammaX = gamma.getX()
                const gammaY = gamma.getY()
                await vrf_r1.proofToHash(gammaX, gammaY)


            })
        }

        for (const [index, test] of DATA.secp256r1.entries()) {
            it(`Should verify the ${index+1} proof`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                const pi_string = test.pi_string
                const decoded_proof = vrf_secp256r1.decode_proof(pi_string.slice(2))
                const gamma = decoded_proof[0]
                const gammaX = gamma.getX()
                const gammaY = gamma.getY()
                const c = decoded_proof[1]
                const s = decoded_proof[2]
                const proof = [gammaX, gammaY, c, s]
                await vrf_r1.verify(pk, proof, message)
            })
        }

        for (const [index, test] of DATA.secp256r1.entries()) {
            it(`Should fast verfify the ${index+1} proof`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                const pi_string = test.pi_string
                const uX = web3.utils.toBN(test.U.x)
                const uY = web3.utils.toBN(test.U.y)
                const sH_X = web3.utils.toBN(test.V.sH.x)
                const sH_Y = web3.utils.toBN(test.V.sH.y)
                const cGamma_X = web3.utils.toBN(test.V.cGamma.x)
                const cGamma_Y = web3.utils.toBN(test.V.cGamma.y)
                const uPoint = [uX, uY]
                const vComponents = [sH_X, sH_Y, cGamma_X, cGamma_Y]
                const decoded_proof = vrf_secp256r1.decode_proof(pi_string.slice(2))
                const gamma = decoded_proof[0]
                const gammaX = gamma.getX()
                const gammaY = gamma.getY()
                const c = decoded_proof[1]
                const s = decoded_proof[2]
                const proof = [gammaX, gammaY, c, s]

                await vrf_r1.fastVerify(pk, proof, message, uPoint, vComponents)
            })
        }

    })
    ////////////////////////////////////////
    // Test for secp256k1 curve
/*
    describe("Auxiliary functions for secp256k1: ", () => {

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should decode the ${index+1} proof`, async () => {
                const pi_string = test.pi_string
                await vrf_k1.decodeProof(pi_string)
            })
        }

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should compute the ${index+1} hash string`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                await vrf_k1.hashToTryAndIncrement(pk, message)
            })
        }

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should compute the ${index+1} params for fastVerify`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                const pi_string = test.pi_string
                const decoded_proof = vrf_secp256k1.decode_proof(pi_string.slice(2))
                const gamma = decoded_proof[0]
                const gammaX = gamma.getX()
                const gammaY = gamma.getY()
                const c = decoded_proof[1]
                const s = decoded_proof[2]
                const proof = [gammaX, gammaY, c, s]
                await vrf_k1.computeFastVerifyParams(pk, proof, message)
            })
        }
    })

    describe('Proof verification functions for secp256r1: ', () => {

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should compute the ${index+1} hash string`, async () => {
                const pi_string = test.pi_string
                const decoded_proof = vrf_secp256k1.decode_proof(pi_string.slice(2))
                const gamma = decoded_proof[0]
                const gammaX = gamma.getX()
                const gammaY = gamma.getY()
                await vrf_k1.proofToHash(gammaX, gammaY)


            })
        }

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should verify the ${index+1} proof`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                const pi_string = test.pi_string
                const decoded_proof = vrf_secp256k1.decode_proof(pi_string.slice(2))
                const gamma = decoded_proof[0]
                const gammaX = gamma.getX()
                const gammaY = gamma.getY()
                const c = decoded_proof[1]
                const s = decoded_proof[2]
                const proof = [gammaX, gammaY, c, s]
                await vrf_k1.verify(pk, proof, message)
            })
        }

        for (const [index, test] of DATA.secp256k1.entries()) {
            it(`Should fast verfify the ${index+1} proof`, async () => {
                const pk = [test.pk.x, test.pk.y]
                const message = test.alpha_string
                const pi_string = test.pi_string
                const uX = web3.utils.toBN(test.U.x)
                const uY = web3.utils.toBN(test.U.y)
                const sH_X = web3.utils.toBN(test.V.sH.x)
                const sH_Y = web3.utils.toBN(test.V.sH.y)
                const cGamma_X = web3.utils.toBN(test.V.cGamma.x)
                const cGamma_Y = web3.utils.toBN(test.V.cGamma.y)
                const uPoint = [uX, uY]
                const vComponents = [sH_X, sH_Y, cGamma_X, cGamma_Y]
                const decoded_proof = vrf_secp256k1.decode_proof(pi_string.slice(2))
                const gamma = decoded_proof[0]
                const gammaX = gamma.getX()
                const gammaY = gamma.getY()
                const c = decoded_proof[1]
                const s = decoded_proof[2]
                const proof = [gammaX, gammaY, c, s]

                await vrf_k1.fastVerify(pk, proof, message, uPoint, vComponents)
            })
        }

    })
    */
})