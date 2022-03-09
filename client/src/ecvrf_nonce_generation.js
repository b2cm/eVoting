const EC = require('elliptic').ec
const SHA256 = require('js-sha256').sha256
const BigInteger = require('bn.js') 
const Hmac = require('js-sha256').sha256.hmac


const ec = new EC('p256')
const PRIME = ec.curve.p


function _ecvrf_nonce_generation_rfc6979_2 (sk, h_string) {
    // a. Process m through the hash function H, yielding:
    const h1 = SHA256.create().update(h_string).digest()
    
    sk = _string_to_bytes(sk)
    // b. set V = 0x01 0x01 0x01 ... 0x01 such that the length of V, in bits, is equal to 8*ceil(hlen/8).
    let v = Array(32).fill(0x01, 0, 32)
 
    // c. Set: K = 0x00 0x00 0x00 ... 0x00 such that the length of K, in bits, is equal to 8*ceil(hlen/8).
    let k = Array(32).fill(0x00, 0, 32)
 
    // d.  Set: K = HMAC_K(V || 0x00 || int2octets(x) || bits2octets(h1)) where '||' denotes concatenation.
    k = Hmac.create(k).update(v.concat([0x00], sk, h1)).digest()
 
    // e. Set: V = HMAC_K(V)
    v = Hmac.create(k).update(v).digest()
 
    // f. Set:  K = HMAC_K(V || 0x01 || int2octets(x) || bits2octets(h1))
    k = Hmac.create(k).update(v.concat([0x01], sk, h1)).digest()
 
    // g. Set: V = HMAC_K(V)
    v = Hmac.create(k).update(v).digest()
 
    // h. Apply the following algorithm until a proper value is found for k:
    // 1. Set T to the empty sequence.  The length of T (in bits) is denoted tlen; thus, at that point, tlen = 0.
    let t = []
    // 2.
    while (t.length < PRIME.bitLength()) {
        v = Hmac.create(k).update(v).digest()
        t = t.concat(v) 
        k_int = BigInt(new BigInteger(v))
        if (k_int < BigInt(PRIME) - 1n) {
            return k_int
        }
        k = SHA256.hmac.create(k).update(v.concat([0x00])).digest()
        v = SHA256.hmac.create(k).update(v).digest()
       
    }
    
 }



 /**
 * Convert string to bytes
 * @param octet_string  A string
 * @returns An array of number
 */
  function _string_to_bytes(octet_string) {
    const A = []
    for (i = 0; i < octet_string.length; i=i+2) {
       A.push(parseInt(octet_string.substr(i, 2), 16))
    }
    return A
 }


const k = 'b7de5757b28c349da738409dfba70763ace31a6b15be8216991715fbc833e5fa'
const SK = 'c9afa9d845ba75166b5c215767b1d6934e50c3db36e89b127b8a622b120f6721'
const PK = '0360fed4ba255a9d31c961eb74c6356d68c049b8923b61fa6ce669622e60f29fb6'
const alpha = '73616d706c65'
const nonce = BigInt(new BigInteger(k, 'hex'))

console.log(_ecvrf_nonce_generation_rfc6979_2(SK, alpha) == nonce)

