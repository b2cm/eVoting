// VRF implemation according to https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-vrf-06

const EdDSA = require('elliptic').eddsa
const Sha512 = require('js-sha512').sha512
const BigInteger = require('bn.js')


const ed25519 = new EdDSA('ed25519')
const BASE = ed25519.curve.g
const PRIME = 2n ** 255n - 19n
const ORDER = 2n ** 252n + 27742317777372353535851937790883648493n
const COFACTOR = 8n
const A = 486662n // Montgomery curve constant for curve25519
const SUITE_STRING = new Buffer.alloc(1, 4)



// Section 5.1. EC-VRF Priving
/**
 * Compute the VRF proof
 * @param sk private key, an number (32 bytes)
 * @param alpha_string VRF input, an octet string
 * @return pi - VRF proof octet string of length m+3n = ptLen+n+qLen = 80 bytes
 */
function ecvrf_prove(sk, alpha_string) {
    // 1. Use sk to derive the VRF secret scalar x and the public key
    const secrect_scalar_x = _get_secret_scalar(sk)
    const pk = BASE.mul(new BigInteger(secrect_scalar_x))
    
    // 2. H = ECVRF_hash_to_curve(pk, alpha_string)
    const h = _ecvrf_hash_to_curve_elligator2_25519(SUITE_STRING, pk, alpha_string)
    if (h == 'INVALID') {
        return 'INVALID'
    }
   
    // 3. h_string = point_to_string(H)
    const h_string = _point_to_string(h).toString('hex')
    if(h_string == 'INVALID') {
        return 'INVALID'
    }

    // 4. Gamma = x*H
    const gamma = h.mul(new BigInteger(secrect_scalar_x)) 

    // 5. Choose A random number nonce k from [0, q-1]
    const k = _ecvrf_nonce_generation_rfc8032(sk, h_string)
    
    // 6. c = ECVRF_hash_points(H, Gamma, g^k, h^k)
    const k_b = BASE.mul(new BigInteger(k))
    const k_h = h.mul(new BigInteger(k)) 
    const c = _ecvrf_hash_points(h, gamma, k_b, k_h)
    
    // 7. s = (k + c*x) mod q (where * denotes number multiplication)
    const s = (k + c * secrect_scalar_x) % ORDER
    
    // 8. pi_string = point_to_string(Gamma) || int_to_string(c, n) || int_to_string(s, qLen)
    const pi_string = Buffer.concat([_point_to_string(gamma), _int_to_string(new BigInteger(c), 16), _int_to_string(new BigInteger(s), 32)])

    // 9. Output pi_string
    return pi_string.toString('hex')
}


// Section 5.2. ECVRF Proof To Hash
/**
 * ECVRF_proof_to_hash(pi_string)
 * @param pi_string VRF proof, octet string of length m+3n (80) bytes
 * @return ("VALID", beta_string) where beta_string is the VRF hash output, octet string
        of length hLen (64) bytes, or ("INVALID", []) upon failure
 */
function ecvrf_proof_to_hash(pi_string) {
    // 1. D = ECVRF_decode_proof(pi_string)
    // 2. If D is 'INVALID', output 'INVALID' and stop
    const d = _ecvrf_decode_proof(pi_string)
    if (d == 'INVALID'){
        return 'INVALID'
    }

    // 3. (Gamma, c, s) = D
    const gamma = d[0]
    
    // 4. three_string = 0x03 = int_to_string(3, 1), A single octet with value 3
    const three_string = new Buffer.alloc(1, 3)

    // 5. beta_string = Hash(suite_string || three_string || point_to_string(cofactor * Gamma))
    const cofactor_gamma = gamma.mul(new BigInteger(COFACTOR))
    const beta_string = Sha512.create().update(Buffer.concat([SUITE_STRING, three_string, _point_to_string(cofactor_gamma)])).hex()

    // 6. Output beta_string
    return beta_string
}


// 5.3. ECVRF Verifying
/**
 * ECVRF_verify(Y, pi_string, alpha_string)
 * @param y public key, an EC point
 * @param pi_string  VRF proof, octet string of length ptLen+n+qLen
 * @param alpha_string VRF input, octet string
 * @return ("VALID", beta_string), where beta_string is the VRF hash output, octet string
        of length hLen (64) bytes; or ("INVALID", []) upon failure
 */
function ecvrf_verify(y, pi_string, alpha_string) {
    // 1. D = ECVRF_decode_proof(pi_string)
    // 2. If D is "INVALID", output "INVALID" and stop
    const d = _ecvrf_decode_proof(pi_string)
    if (d == 'INVALID') {
        return 'INVALID'
    }

    // 3. (Gamma, c, s) = D
    const gamma = d[0]
    const c = d[1]
    const s = d[2]

    // 4. H = ECVRF_hash_to_curve(suite_string, y, alpha_string)
    const h = _ecvrf_hash_to_curve_elligator2_25519(SUITE_STRING, y, alpha_string)
    if (h == 'INVALID') {
        return 'INVALID'
    }

    // 5. U = s*B - c*y
    const s_b = BASE.mul(new BigInteger(s))
    const c_y = y.mul(new BigInteger(c))
    const u = s_b.add(c_y.neg())

    // 6. V = s*H - c*Gamma
    const s_h = h.mul(new BigInteger(s))
    const c_g = gamma.mul(new BigInteger(c))
    const v = s_h.add(c_g.neg())

    // 7. c’ = ECVRF_hash_points(H, Gamma, U, V)
    const cp = _ecvrf_hash_points(h, gamma, u, v)

    // 8. If c and c’ are equal, output ("VALID", ECVRF_proof_to_hash(pi_string)); else output "INVALID"
    if (c == cp) {
        return {
            status: 'VALID',
            beta_string: ecvrf_proof_to_hash(pi_string)
        }
    }
    else{
        return {
            status: 'INVALID',
            beta_string: ""
        }
    }
}


// Section 5.4.1.2. ECVRF_hash_to_curve_elligator2_25519
/**
 * The ECVRF_hash_to_curve algorithm takes in the VRF input alpha and
 converts it to H, an EC point in G
 * @param suite_string A single octet specifying ECVRF ciphersuite
 * @param y public key, an EC point
 * @param alpha_string value to be hashed, an octet string
 * @return  H - hashed value, A finite EC point in G, or INVALID upon failure
 */
 function _ecvrf_hash_to_curve_elligator2_25519(suite_string, y, alpha_string) {
    // 1. PK_string = point_to_string(y)
    const pk_string = _point_to_string(y)

    // 2. one_string = 0x01 = int_to_string(1, 1) (A single octet with value 1)
    const one_string = Buffer.alloc(1, 1)

    // 3. hash_string = Hash(suite_string || one_string || PK_string || alpha_string )
    const hash_string = _hash(Buffer.concat([suite_string, one_string, pk_string, Buffer.from(_string_to_bytes(alpha_string))]))

    // 4. r_string = hash_string[0]...hash_string[31]
    const r_string = hash_string.slice(0, 32)

    // 5. oneTwentySeven_string = 0x7F = int_to_string(127, 1) (A single octet with value 127)
    const one_twenty_seven_string = 0x7f // Note: '&' wants an int, not A byte

    // 6.r_string[31] = r_string[31] & oneTwentySeven_string (this step clears the high-ORDER bit of octet 31)
    r_string[31] = r_string[31] & one_twenty_seven_string

    // 7. r = string_to_int(r_string)
    const r = _string_to_int(r_string)

    // 8. u = - A / (1 + 2*(r^2) ) mod p (note: the inverse of (1+2*(r^2)) modulo p is guaranteed to exist)
    const u = (PRIME - A) * _inverse(1n + 2n * (r ** 2n)) % PRIME

    // 9. w = u * (u^2 + A*u + 1) mod p (this step evaluates the Montgomery equation for Curve25519)
    const w = u * (u ** 2n + A * u + 1n) % PRIME

    // 10. Let e equal the Legendre symbol of w and p (see note after item 16)
    const e = _modExp(w, (PRIME - 1n) / 2n, PRIME)

    // 11. If e is equal to 1 then final_u = u; else final_u = (-A - u) mod p (see note after item 16)
    const TWO_INV = _inverse(2n)
    const final_u = (e * u + (e - 1n) * A * TWO_INV) % PRIME
    
    // 12. y_coordinate = (final_u - 1) / (final_u + 1) mod p
    const y_coordinate = (final_u - 1n) * _inverse(final_u + 1n) % PRIME

    // 13. y_string = int_to_string (y_coordinate, 32)
    const y_string = _int_to_string(new BigInteger(y_coordinate), 32)


    // 14. H_prelim = string_to_point(h_string)
    const h_prelim = _string_to_point(y_string.toString('hex'))
    if (h_prelim == 'INVALID') {
        return 'INVALID'
    }

    // 15. Set H = cofactor * H_prelim
    const h = h_prelim.mul(new BigInteger(COFACTOR)) 

    // 16. Output H
    return h
}


// Section 5.4.2.2. ECVRF Nonce Generation From RFC 8032
/**
 * Random nonce generation
 * @param sk an ECVRF secret key as bytes
 * @param h_string an octet string
 * @return k an number between 0 and q-1
 */
function _ecvrf_nonce_generation_rfc8032(sk, h_string) {
    // 1. hashed_sk_string = Hash (sk) 
    const hashed_sk_string = _hash(_string_to_bytes(sk))

    // 2.truncated_hashed_sk_string = hashed_sk_string[32]...hashed_sk_string[63]
    const truncated_hashed_sk_string = hashed_sk_string.slice(32)
   
    // 3. k_string = Hash(truncated_hashed_sk_string || h_string)
    const k_string = _hash(truncated_hashed_sk_string.concat(_string_to_bytes(h_string)))
    
    // 4. k = string_to_int(k_string) mod q
    const k = _string_to_int(k_string) % ORDER
    return k
}


// section 5.4.3. ECVRF Hash Points
/**
 * ECVRF_hash_points(P1, P2, ..., PM)
 * @param p1 an EC points in G
 * @param p2 an EC points in G
 * @param p3 an EC points in G
 * @param p4 an EC points in G
 * @retrun c hash value, number between 0 and 2^(8n)-1
 */
function _ecvrf_hash_points(p1, p2, p3, p4) {
    // 1. two_string = 0x02 = int_to_string(2, 1), A single octet with value 2
    const two_string = Buffer.alloc(1, 2)

    // 2. Initialize str = suite_string || two_string
    let string = Buffer.concat([SUITE_STRING, two_string])

    // 3.for PJ in [P1, P2, ... PM]: 
    // str = str || point_to_string(PJ)
    string = Buffer.concat([string, _point_to_string(p1), _point_to_string(p2), _point_to_string(p3), _point_to_string(p4)]).toString('hex')
 
    // 4. c_string = Hash(str)
    const c_string = _hash(_string_to_bytes
    (string))

    // 5. truncated_c_string = c_string[0]...c_string[n-1]
    const truncated_c_string = c_string.slice(0, 16)

    // 6. c = string_to_int(truncated_c_string)
   const c = _string_to_int(truncated_c_string)

    // 7. Output c
    return c
}


// Section 5.4.4. ECVRF Decode Proof
/**
 * ECVRF_decode_proof(pi_string)
 * @param pi_string VRF proof, octet string (ptLen+n+qLen octets)
 * @return "INVALID", or 
        Gamma - EC point,
        c - number between 0 and 2^(8n)-1,
        s - number between 0 and 2^(8qLen)-1
 */
function _ecvrf_decode_proof(pi_string) {
    // ptLen+n+qLen octets = 32+16+32 = 80
    pi_string = Buffer.from(_string_to_bytes(pi_string))
    if (pi_string.length != 80) {
        return 'INVALID'
    }

    // 1. let gamma_string = pi_string[0]...p_string[ptLen-1]
    const gamma_string = pi_string.slice(0, 32)

    // let c_string = pi_string[ptLen]...pi_string[ptLen+n-1]
    const c_string = _string_to_bytes
(pi_string.slice(32, 48).toString('hex'))

    // 3. let s_string =pi_string[ptLen+n]...pi_string[ptLen+n+qLen-1]
    const s_string = _string_to_bytes
(pi_string.slice(48).toString('hex'))

    // 4. Gamma = string_to_point(gamma_string)
    // 5. if Gamma = "INVALID" output "INVALID" and stop.
    const gamma = _string_to_point(gamma_string.toString('hex'))
    if (gamma == 'INVALID') {
        return 'INVALID'
    }
    
    // 6. c = string_to_int(c_string)
    const c =_string_to_int(c_string)
    
    // 7. s = string_to_int(s_string)
    const s = _string_to_int(s_string)

    // 8. Output Gamma, c, and s
    return [gamma, c, s]
}



// Helper functions

/**
 * Hash function
 * @param message - An array of number
 * @returns Hash value as an Array of number
 */
function _hash(message) {
    return Sha512.create().update(message).digest()
}

/**
 * Convert string to bytes
 * @param octet_string  A string
 * @returns An array of number
 */
function _string_to_bytes(octet_string) {
    const A = []
    while (octet_string.length >= 2) {
        A.push(parseInt(octet_string.substr(0, 2), 16))
        octet_string = octet_string.substr(2, octet_string.length)
    }
    return A
}


/**
 * int_to_string(A, len) - conversion of nonnegative number A to an octet string of length len as specified in Section 5.5.
 * @param number A BigInteger
 * @param len length of the string
 * @returns A octet string in little endian
 */
function _int_to_string(number, len){
   return number.toBuffer('le', len)
}

/**
 * string_to_int(a_string) - conversion of an octet string to A nonnegative number as specified in Section 5.5.
 * @param a_string An array of number representing the octect string
 * @returns A BigInt in little endian
 */
function _string_to_int(a_string) {
    return BigInt('0x' + a_string.map(byte => byte.toString(16).padStart(2, '0')).reverse().join(''))
    return new BigInteger(a_string, endian='le')
}

/**
 * conversion of EC point to an ptLen-octet string  as specified in Section 5.5.
 * @param point An EC point
 * @returns An octet string reprasenting the EC point 
 */
function _point_to_string(point) {
    return Buffer.from(ed25519.encodePoint(point))
}


/**
 * conversion of an ptLen-octet string to EC point
 as specified in Section 5.5. 
 * @param a_string an 32-bytes string
 * @returns An EC point
 */
function _string_to_point(a_string){
    try {
        const point =  ed25519.decodePoint(a_string)
        return point
    }catch(error){
        return 'INVALID'
    }
}

/**
 * Compute the secret scalar
 * @param sk A 32-bytes private key
 * @returns A BigInt in little endian
 */
function _get_secret_scalar(sk) {
    const hash = _hash(_string_to_bytes
    (sk)).slice(0, 32)
    hash[31] = (hash[31] & 0x7f) | 0x40
    hash[0] = hash[0] & 0xf8
    return _string_to_int(hash) 
    return new BigInteger(hash, endian='le')
}

function get_secret_scalar(sk) {
    const hash = _hash(_string_to_bytes
    (sk)).slice(0, 32)
    // Clear the lowest three bits of the first octet
    hash[0] = bit_clear(hash[0], 0)
    hash[0] = bit_clear(hash[0], 1)
    hash[0] = bit_clear(hash[0], 2)
    // Clear the highest bit of the last octet
    hash[31] = bit_clear(hash[31], 7)
    // Set the second highest bit of the last octet
    hash[31] = bit_set(hash[31], 6)
    return _string_to_int(hash)
}

function bit_set(num, bit){
    return num | 1<<bit;
}

function bit_clear(num, bit){
    return num & ~(1<<bit);
}

/**
 * Modular exponantial (base^exponent) % modulus
 * @param base A BigInt
 * @param exponent A BigInt
 * @param modulus A BigInt
 * @returns A BigInt
 */
function _modExp(base, exponent, modulus){
    base = base % modulus
    let result = 1n 
    let x = base
    while (exponent > 0n) {
        let leastSignificantBit = exponent % 2n
        exponent = exponent / 2n
        if (leastSignificantBit == 1n) {
            result = result * x
            result = result % modulus
        }
        x = x * x
        x = x % modulus
    }
    return result
}

/**
 * Calculate inverse via Fermat's little theorem
 * @param number A BigInt
 * @returns A BigInt
 */
function _inverse(number) {
    return _modExp(number, PRIME - 2n, PRIME)
}




          


let alpha_string = ''
let SK = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
let H = '5b2c80db3ce2d79cc85b1bfb269f02f915c5f0e222036dc82123f640205d0d24'
let scalar = _get_secret_scalar(SK)
//const pk = ed25519.keyFromSecret(SK).getPublic()
let pk = BASE.mul(new BigInteger(scalar))


let pi_string = (ecvrf_prove(SK, alpha_string))
console.log('proof:', pi_string)

let beta_string = ecvrf_proof_to_hash(pi_string)
console.log('beta:', beta_string)

console.log(ecvrf_verify(pk, pi_string, alpha_string))



module.exports = {
    ecvrf_prove,
    ecvrf_proof_to_hash, 
    ecvrf_verify, 
    _ecvrf_hash_to_curve_elligator2_25519,
    _ecvrf_decode_proof,
    _ecvrf_nonce_generation_rfc8032, 
    _point_to_string,
    _string_to_point,
    _get_secret_scalar,
    _string_to_bytes,
    _string_to_int,
    SUITE_STRING,
}