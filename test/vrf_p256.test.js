const assert = require('assert')
const DATA = require('./data_p256_javascript.json')
const VRF = require('../client/src/vrf_p256')

const vrf = new VRF('p256')

describe('Auxiliary funtions:', () => {
    for (const [index, test] of DATA.valid.entries()) {
        const SK = test.sk
        const PK = vrf.string_to_point(test.pk)
        const H = test.H
        const alpha_string = test.alpha_string
        const nonce = BigInt('0x' + test.k)
        
        it(`Should compute the hash to curve point using the hash_and_try_increment function (${index+1})`, () => {
            const hash_to_curve = vrf.hash_to_curve_try_and_increment(vrf.SUITE_STRING, PK, alpha_string)
            assert.strictEqual(vrf.point_to_string(hash_to_curve), H)
        })
        it(`Should generate the nonce using the nonce_generation_rfc6979 function (${index+1})`, () => {
            const k = vrf.nonce_generation_rfc6979(SK, H)
            assert.strictEqual(k, nonce)
        })
    }
})

describe('Proof computation and verification:', () => {
    for (const [index, test] of DATA.valid.entries()) {
        const SK = test.sk
        const PK = test.pk
        const proof = test.pi_string
        const beta = test.beta_string
        const message = test.alpha_string

        it( `Should compute the proof using the secret key and the message (${index+1})`, () => {
            const pi = vrf.prove(SK, message)
            assert.strictEqual(pi, proof)
        })
        
        it(`Should compute beta using the proof (${index+1})`, () => {
            const beta_string = vrf.proof_to_hash(proof)
            assert.strictEqual(beta_string, beta)
        })

        it(`Should verify the proof using the public key and the message (${index+1})`, () => {
            const verify = vrf.verify(PK, proof, message)
            assert.strictEqual(verify.status, 'VALID')
        })
    }
})

