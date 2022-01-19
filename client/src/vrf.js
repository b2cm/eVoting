// VRF implemation according to https://tools.ietf.org/pdf/draft-irtf-cfrg-vrf-06.pdf

const EdDSA = require('elliptic').eddsa
const Sha512 = require('js-sha512').sha512
const BigInteger = require('bn.js')


const ed25519 = new EdDSA('ed25519')
const BASE = ed25519.curve.g
const PRIME = ed25519.curve.p
const ORDER = ed25519.curve.n
const COFACTOR = 8
const A = 486662 // Montgomery curve constant for curve25519
const SUITE_STRING = new Buffer.alloc(1, 3)


// Section 5.1. EC-VRF Priving
/**
 * Compute the VRF proof
 * @param {*} pk public key, an EC point
 * @param {*} sk private key, an integer (32 bytes)
 * @param {*} alpha_string VRF input, an octet string
 * @return pi - VRF proofm octet string of length m+3n = ptLen+n+qLen = 80 bytes
 */
function ecvrf_prove(sk, alpha_string) {
    // 1. Use sk to derive the VRF secret scalar x and the public key
    const secrect_scalar_x = _get_secret_scalar(sk)
    const pk = BASE.mul(secrect_scalar_x)

    // 2. H = ECVRF_hash_to_curve(pk, alpha_string)
    const h = _ecvrf_hash_to_try_and_increment(SUITE_STRING, pk, alpha_string)
   
    if (h == 'INVALID') {
        return 'INVALID'
    }

    // 3. h_string = point_to_string(H)
    const h_string = _point_to_string(h)
    if(h_string == 'INVALID') {
        return 'INVALID'
    }

    // 4. Gamma = x*H
    const gamma = h.mul(secrect_scalar_x) //_scalar_multiply(h, secrect_scalar_x)

    // 5. Choose a random integer nonce k from [0, q-1]
    const k = _ecvrf_nonce_generation_rfc8032(sk, h_string)
    
    // 6. c = ECVRF_hash_points(H, Gamma, g^k, h^k)
    const k_b = BASE.mul(k) // _scalar_multiply(BASE, k)
    const k_h = h.mul(k) // _scalar_multiply(h, k)
    const c = _ecvrf_hash_points(h, gamma, k_b, k_h)

    // 7. s = (k + c*x) mod q (where * denotes integer multiplication)
    const s = (k.add(c).mul(secrect_scalar_x)).mod(ORDER) //(k + c * secrect_scalar_x) % ORDER

    // 8. pi_string = point_to_string(Gamma) || int_to_string(c, n) || int_to_string(s, qLen)
    const pi_string = Buffer.concat([_point_to_string(gamma), _int_to_string(c, 16), _int_to_string(s, 32)])

    // 9. Output pi_string
    return pi_string
}


// Section 5.2. ECVRF Proof To Hash
/**
 * ECVRF_proof_to_hash(pi_string)
 * @param {*} pi_string VRF proof, octet string of length m+3n (80) bytes
 * @return ("VALID", beta_string) where beta_string is the VRF hash output, octet string
        of length hLen (64) bytes, or ("INVALID", []) upon failure
 */
function ecvrf_proof_to_hash(pi_string) {
    // 1. D = ECVRF_decode_proof(pi_string)
    const d = _ecvrf_decode_proof(pi_string)

    // 2. If D is 'INVALID', output 'INVALID' and stop
    if (d == 'INVALID'){
        return 'INVALID'
    }

    // 3. (Gamma, c, s) = D
    const gamma = d[0]
    
    // 4. three_string = 0x03 = int_to_string(3, 1), a single octet with value 3
    const three_string = new Buffer.alloc(1, 3)

    // 5. beta_string = Hash(suite_string || three_string || point_to_string(cofactor * Gamma))
    const cofactor_gamma = gamma.mul(new BigInteger(COFACTOR)) //_scalar_multiply(p=gamma, e=COFACTOR)  // Curve cofactor
    const beta_string = Sha512.create().update(Buffer.concat([SUITE_STRING, three_string, _point_to_string(cofactor_gamma)])).hex()

    // 6. Output beta_string
    return beta_string
}


// 5.3. ECVRF Verifying
/**
 * ECVRF_verify(Y, pi_string, alpha_string)
 * @param {*} y public key, an EC point
 * @param {*} pi_string  VRF proof, octet string of length ptLen+n+qLen
 * @param {*} alpha_string VRF input, octet string
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
    //const y_point = _string_to_point(y)
    //if (y_point == 'INVALID') {
    //    return 'INVALID'
    //}

    const h = _ecvrf_hash_to_try_and_increment(SUITE_STRING, y, alpha_string)
    if (h == 'INVALID') {
        return 'INVALID'
    }

    // 5. U = s*B - c*y
    const s_b = BASE.mul(s)
    let c_y = y.mul(c)
    // Negate c_y
    //c_y = c_y.neg()
    const u = s_b.add(c_y)

    // 6. V = s*H - c*Gamma
    const s_h = h.mul(s)
    let c_g = gamma.mul(s)
    // Negate c_g
    //c_g = c_g.neg()
    const v = s_h.add(c_g)

    // 7. c’ = ECVRF_hash_points(H, Gamma, U, V)
    const cp = _ecvrf_hash_points(h, gamma, u, v)
    console.log('c:', c)
    console.log('cp:', cp)
    // 8. If c and c’ are equal, output ("VALID", ECVRF_proof_to_hash(pi_string)); else output "INVALID"
    if (c.eq(cp)) {
        return {
            status: 'VALID',
            pi_string: ecvrf_proof_to_hash(pi_string)
        }
    }
    else{
        return 'INVALID'
    }
}

// Section 5.4.1.2. ECVRF_hash_to_curve_elligator2_25519
/**
 * The ECVRF_hash_to_curve algorithm takes in the VRF input alpha and
 converts it to H, an EC point in G
 * @param {*} suite_string a single octet specifying ECVRF ciphersuite
 * @param {*} y public key, an EC point
 * @param {*} alpha_string value to be hashed, an octet string
 * @return  H - hashed value, a finite EC point in G, or INVALID upon failure
 */
function _ecvrf_hash_to_try_and_increment(suite_string, y, alpha_string) {
    // 1. ctr = 0
    let ctr = 0
    
    // 2. PK_string = point_to_string(Y)
    const pk_string = _point_to_string(y)

    // 3. one_string = 0x01 = int_to_string(1, 1), a single octet with value 1
    const one_string = Buffer.alloc(1, 1)

    // 4. H = 'INVALID'
    let H = 'INVALID'

    // 5. While H is "INVALID" or H is EC point at infinity
    while(H == 'INVALID' || H.isInfinity())
    {
        // A. ctr_string = int_to_string(ctr, 1)
        const ctr_string = _int_to_string(new BigInteger(ctr), 1)

        // B. hash_string = Hash(suite_string || one_string || PK_string ||alpha_string || ctr_string)
        const hash_string = _hash(Buffer.concat([suite_string, one_string, pk_string, Buffer.alloc(alpha_string.length, alpha_string), ctr_string]))

        // C. H = arbitrary_string_to_point(hash_string) 
        // For suite_string 0x04 use string_to_point function
        H = _string_to_point(hash_string.slice(0, 32))

        // D.  If H is not "INVALID" and cofactor > 1, set H = cofactor * H
        if (H != 'INVALID' && COFACTOR > 1){
            H = H.mul(new BigInteger(COFACTOR))
        }

        // E. ctr = ctr + 1
        ctr = ctr + 1
    }

    // 6. Output H
    return H
}


// Section 5.4.2.2. ECVRF Nonce Generation From RFC 8032
/**
 * Random integer generation
 * @param {*} sk an ECVRF secret key as bytes
 * @param {*} h_string an octet string
 * @return k an integer between 0 and q-1
 */
function _ecvrf_nonce_generation_rfc8032(sk, h_string) {
    // 1. hashed_sk_string = Hash (sk)
    const hashed_sk_string = _hash(sk)

    // 2.truncated_hashed_sk_string = hashed_sk_string[32]...hashed_sk_string[63]
    const truncated_hashed_sk_string = hashed_sk_string.slice(32)

    // 3. k_string = Hash(truncated_hashed_sk_string || h_string)
    const k_string = _hash(truncated_hashed_sk_string.concat(h_string))
    
    // 4. k = string_to_int(k_string) mod q
    const k = _string_to_int(k_string).mod(ORDER) 
    return k
}


// section 5.4.3. ECVRF Hash Points
/**
 * ECVRF_hash_points(P1, P2, ..., PM)
 * @param {*} p1 an EC points in G
 * @param {*} p2 an EC points in G
 * @param {*} p3 an EC points in G
 * @param {*} p4 an EC points in G
 * @retrun c hash value, integer between 0 and 2^(8n)-1
 */
function _ecvrf_hash_points(p1, p2, p3, p4) {
    // 1. two_string = 0x02 = int_to_string(2, 1), a single octet with value 2
    const two_string = Buffer.alloc(1, 2)

    // 2. Initialize str = suite_string || two_string
    let string = Buffer.concat([SUITE_STRING, two_string])

    // 3.for PJ in [P1, P2, ... PM]:
    //       str = str || point_to_string(PJ)
    string = Buffer.concat([string, _point_to_string(p1), _point_to_string(p2), _point_to_string(p3), _point_to_string(p4)])

    // 4. c_string = Hash(str)
    const c_string = _hash(string)

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
 * @param {*} pi_string VRF proof, octet string (ptLen+n+qLen octets)
 * @return "INVALID", or Gamma - EC point
        c - integer between 0 and 2^(8n)-1
        s - integer between 0 and 2^(8qLen)-1
 */
function _ecvrf_decode_proof(pi_string) {
    // ptLen+n+qLen octets = 32+16+32 = 80
    if (pi_string.length != 80) {
        return 'INVALID'
    }

    // 1. let gamma_string = pi_string[0]...p_string[ptLen-1]
    const gamma_string = pi_string.slice(0, 32)

    // let c_string = pi_string[ptLen]...pi_string[ptLen+n-1]
    const c_string = pi_string.slice(32, 48)

    // 3. let s_string =pi_string[ptLen+n]...pi_string[ptLen+n+qLen-1]
    const s_string = pi_string.slice(48)

    // 4. Gamma = string_to_point(gamma_string)
    const gamma = _string_to_point(gamma_string.toString('hex'))

    // 5. if Gamma = "INVALID" output "INVALID" and stop.
    if (gamma == 'INVALID') {
        return 'INVALID'
    }

    // 6. c = string_to_int(c_string)
    const c = _string_to_int(c_string)

    // 7. s = string_to_int(s_string)
    const s = _string_to_int(s_string)

    // 8. Output Gamma, c, and s
    return [gamma, c, s]
}



// Helper functions

function _hash(message) {
    return Sha512.create().update(message).digest()
}


function _string2bytes(octet_string) {
    const a = []
    while (octet_string.length >= 2) {
        a.push(parseInt(octet_string.substr(0, 2), 16))
        octet_string = octet_string.substr(2, octet_string.length)
    }
    return a
}

/**
 * This function can also convert a little endian string to a big endian string
 * @param {*} string the string to convert little endian
 * @returns the little endian representation of the string
 */
function little_endian(value){
    string = value//.toString()
    const endian = []
    let len = string.length -1
    while (len >= 0) {
        endian.push(string.substr(len, 1))
        len -= 1
    }
    return endian.join('')
}

/**
 * int_to_string(a, len) - conversion of nonnegative integer a to an octet string of length len as specified in Section 5.5.
 * @param {*} number a BigInteger
 * @param {*} len length of the string
 * @returns A octet string in little endian
 */
function _int_to_string(number, len){
    // le for little endian
   return number.toBuffer('le', len)
}

/**
 * string_to_int(a_string) - conversion of an octet string to a nonnegative integer as specified in Section 5.5.
 * @param {*} a_string an octect string
 * @returns An integer in little endian
 */
function _string_to_int(a_string) {
    return new BigInteger(a_string, endian='le')
}

/**
 * conversion of EC point to an ptLen-octet string  as specified in Section 5.5.
 * @param {*} point an EC point
 * @returns An octet string reprasenting the EC point 
 */
function _point_to_string(point) {
    return Buffer.from(ed25519.encodePoint(point))
}


/**
 * conversion of an ptLen-octet string to EC point
 as specified in Section 5.5. 
 * @param {*} a_string an 32-octet string
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
 * arbitrary_string_to_point(s) = string_to_point(0x02 || s) (where
 0x02 is a single octet with value 2, 0x02=int_to_string(2, 1))
 * @param {*} a_string an 32-octet string
 * @returns An EC point or 'INVALID'
 */
function _arbitrary_string_to_point(a_string){
    try {
        const two_bytes = Buffer.alloc(1, 2)
        const point = _string_to_point(Buffer.concat([two_bytes, Buffer.alloc(a_string.length, a_string)]))
        return point
    }catch {
        return 'INVALID'
    }
}


function _get_secret_scalar(sk) {
    const hash = _hash(sk).slice(0, 32)
    const buf = Buffer.from(hash) 
    buf[31] = (buf[31] & 0x7f) | 0x40
    buf[0] = buf[0] & 0xf8
    return new BigInteger(buf, 'le')
}

function get_secret_scalar(sk) {
    const hash = _hash(sk).slice(0, 32)
    const buf = Buffer.from(hash)
    // Clear the lowest three bits of the first octet
    buf[0] = bit_clear(buf[0], 0)
    buf[0] = bit_clear(buf[0], 1)
    buf[0] = bit_clear(buf[0], 2)
    // Clear the highest bit of the last octet
    buf[31] = bit_clear(buf[31], 7)
    // Set the second highest bit of the last octet
    buf[31] = bit_set(buf[31], 6)
    return new BigInteger(buf, 'hex', 'le')
}

function bit_set(num, bit){
    return num | 1<<bit;
}

function bit_clear(num, bit){
    return num & ~(1<<bit);
}

function modExp(a, b, n){
    a = a % n
    let result = 1n
    let x = a
    while (b > 0n) {
        let leastSignificantBit = b % 2n
        b = b / 2n
        if (leastSignificantBit == 1n) {
            result = result * x
            result = result % n
        }
        x = x * x
        x = x % n
    }
    return result
}


const alpha_string = "6d657373616765"
const sk = "885f642c8390293eb74d08cf38d3333771e9e319cfd12a21429eeff2eddeebd2"
const SK = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
const secret_scalar = new BigInteger('307c83864f2833cb427a2ef1c00a013cfdff2768d980c0a3a520f006904de94f', 'hex')
const scalar = _get_secret_scalar(SK)
//const pk = ed25519.keyFromSecret(sk).getPublic()
const pk = BASE.mul(get_secret_scalar(SK))

const pi_string = (ecvrf_prove(SK, ''))
console.log('proof:', pi_string.toString('hex'))

const beta_string = ecvrf_proof_to_hash(pi_string)
console.log('beta:', beta_string)

console.log(ecvrf_verify(pk, pi_string, alpha_string))