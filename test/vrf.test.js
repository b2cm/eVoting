//import {_get_secret_scalar} from "./vrf"
const ECDSA = require('../client/node_modules/elliptic').eddsa
const BigInteger = require('bn.js')
const assert = require('assert')
const VRF = require('../client/src/vrf')
const DATA = require('./data.json')



const ed25519 = new ECDSA('ed25519')
const BASE = ed25519.curve.g
describe('Auxiliary funtions:', () => {
    for (const [index, test] of DATA.valid.entries()) {
        const SK = test.sk
        const PK = ed25519.decodePoint(test.pk)
        let secret_scalar_x = VRF._string_to_bytes(test.secret_scalar_x)
        secret_scalar_x = VRF._string_to_int(secret_scalar_x)
        const H = test.H
        const alpha_string = test.alpha_string

        it(`should compute the secret scalar from the secret key (${index + 1})`, async () => {
            const secret_scalar = VRF._get_secret_scalar(SK)
            assert(secret_scalar === secret_scalar_x)
        })

        it(`should compute the public key from the secret key and the scalar (${index + 1})`, async () => {
            secret_scalar_x = new BigInteger(test.secret_scalar_x, 'hex', 'le')
            const base_pub_k = BASE.mul(secret_scalar_x)
            assert(base_pub_k.eq(PK))
        })

        it(`should compute the hash to curve using the alligator algorithm (${index + 1})`, async () => {            
            const hash_to_curve = VRF._ecvrf_hash_to_curve_elligator2_25519(VRF.SUITE_STRING, PK, alpha_string)
            const hash = VRF._point_to_string(hash_to_curve).toString('hex')
            assert(H === hash)
        })
    }

})

describe('Proof computation and verification', () => {
    for (const [index, test] of DATA.valid.entries()) {
        const SK = test.sk
        const PK = VRF._string_to_point(test.pk)
        const alpha_string = test.alpha_string
        const pi_string = test.pi_string
        const beta_string = test.beta_string
        it(`should compute the vrf proof (${index + 1})`, async () => {
            const pi = VRF.ecvrf_prove(SK, alpha_string)
            console.log(`pi(${index + 1}):`, pi)
            assert(pi_string === pi)
        })

        it(`should compute beta string (${index + 1})`, () => {
            const beta = VRF.ecvrf_proof_to_hash(pi_string)
            console.log(`beta (${index + 1}):`, beta)
            assert(beta_string === beta)
        })

        it(`verify the vrf proof (${index + 1})`, () => {
            const verify = VRF.ecvrf_verify(PK, pi_string, alpha_string)
            assert(verify.status === 'VALID' && verify.beta_string === beta_string)
        })
    }
})
