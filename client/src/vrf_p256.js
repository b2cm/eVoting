const EC = require('elliptic').ec
const SHA256 = require('js-sha256').sha256
const BigInteger = require('bn.js')
const Hmac = require('js-sha256').sha256.hmac


class VRF {
 
    constructor(curve) {
        this.COFACTOR = 1
        if (curve === 'secp256k1') {
            this.ec = new EC(curve)
            this.BASE = this.ec.curve.g
            this.PRIME = this.ec.curve.p
            this.ORDER = this.ec.curve.n
            this.SUITE_STRING = [0xFE]
        }

        if (curve === 'p256') {
            this.ec = new EC(curve)
            this.BASE = this.ec.curve.g
            this.PRIME = this.ec.curve.p
            this.ORDER = this.ec.curve.n
            this.SUITE_STRING = [0x01]
        }
    }

    // Section 5.1. EC-VRF Priving
    /**
     * Compute the VRF proof
     * @param sk private key, an number (32 bytes)
     * @param alpha_string VRF input, an octet string
     * @return pi - VRF proof octet string of length m+3n = ptLen+n+qLen = 81 bytes
     */
    prove(sk, alpha_string) {
        // 1. Use sk to derive the VRF secret scalar x and the public key
        const secret_scalar_x = new BigInteger(sk, 'hex')
        const pk = this.BASE.mul(secret_scalar_x)

        // 2. H = ECVRF_hash_to_curve(pk, alpha_string)
        const h = this.hash_to_curve_try_and_increment(this.SUITE_STRING, pk, alpha_string)
        if (h == 'INVALID') {
            return 'INVALID'
        }

        // 3. h_string = point_to_string(H)
        const h_string = this.point_to_string(h)
        if (h_string == 'INVALID') {
            return 'INVALID'
        }
       
        // 4. Gamma = x*H
        const gamma = h.mul(secret_scalar_x)

        // 5. Choose A random number nonce k from [0, q-1]
        const k = this.nonce_generation_rfc6979(sk, h_string)

        // 6. c = ECVRF_hash_points(H, Gamma, g^k, h^k)
        const k_b = this.BASE.mul(new BigInteger(k))
        const k_h = h.mul(new BigInteger(k))
        const c = this.#hash_points(h, gamma, k_b, k_h)

        // 7. s = (k + c*x) mod q (where * denotes number multiplication)
        const s = (k + (c * BigInt(secret_scalar_x))) % BigInt(this.ORDER)

        // 8. pi_string = point_to_string(Gamma) || int_to_string(c, n) || int_to_string(s, qLen)
        const pi_string = this.point_to_string(gamma) + this.#int_to_string(c, 16) + this.#int_to_string(s, 32)

        // 9. Output pi_string
        return pi_string
    }

    // Section 5.2. ECVRF Proof To Hash
    /**
     * ECVRF_proof_to_hash(pi_string)
     * @param pi_string VRF proof, octet string of length m+3n (80) bytes
     * @return ("VALID", beta_string) where beta_string is the VRF hash output, octet string
            of length hLen (64) bytes, or ("INVALID", []) upon failure
     */
    proof_to_hash(pi_string) {
        // 1. D = ECVRF_decode_proof(pi_string)
        // 2. If D is 'INVALID', output 'INVALID' and stop
        const d = this.decode_proof(pi_string)
        if (d == 'INVALID') {
            return 'INVALID'
        }

        // 3. (Gamma, c, s) = D
        let gamma = d[0]
        gamma = this.#string_to_bytes(this.point_to_string(gamma))

        // 4. three_string = 0x03 = int_to_string(3, 1), A single octet with value 3
        const three_string = [0x03]

        // 5. beta_string = Hash(suite_string || three_string || point_to_string(cofactor * Gamma))
        const beta_string = SHA256.create().update(this.SUITE_STRING.concat(three_string, gamma)).hex()

        // 6. Output beta_string
        return beta_string
    }

    // 5.3. ECVRF Verifying
    /**
     * ECVRF_verify(Y, pi_string, alpha_string)
     * @param pk public key, an EC point
     * @param pi_string  VRF proof, octet string of length ptLen+n+qLen
     * @param alpha_string VRF input, octet string
     * @return ("VALID", beta_string), where beta_string is the VRF hash output, octet string
            of length hLen (64) bytes; or ("INVALID", []) upon failure
     */
    verify(pk, pi_string, alpha_string) {
        // 1. D = ECVRF_decode_proof(pi_string)
        // 2. If D is "INVALID", output "INVALID" and stop
        pk = this.string_to_point(pk)
        const d = this.decode_proof(pi_string)
        if (d == 'INVALID') {
            return 'INVALID'
        }

        // 3. (Gamma, c, s) = D
        const gamma = d[0]
        const c = d[1]
        const s = d[2]

        // 4. H = ECVRF_hash_to_curve(suite_string, pk, alpha_string)
        const h = this.hash_to_curve_try_and_increment(this.SUITE_STRING, pk, alpha_string)
        if (h == 'INVALID') {
            return 'INVALID'
        }

        // 5. U = s*B - c*pk
        const s_b = this.BASE.mul(new BigInteger(s))
        const c_y = pk.mul(new BigInteger(c))
        const u = s_b.add(c_y.neg())

        // 6. V = s*H - c*Gamma
        const s_h = h.mul(new BigInteger(s))
        const c_g = gamma.mul(new BigInteger(c))
        const v = s_h.add(c_g.neg())

        // 7. c’ = ECVRF_hash_points(H, Gamma, U, V)
        const cp = this.#hash_points(h, gamma, u, v)

        // 8. If c and c’ are equal, output ("VALID", ECVRF_proof_to_hash(pi_string)); else output "INVALID"
        if (c == cp) {
            return {
                status: 'VALID',
                beta_string: this.proof_to_hash(pi_string)
            }
        } else {
            return {
                status: 'INVALID',
                beta_string: ""
            }
        }
    }

    ///// ECVRF Auxiliary functions

    // Section 5.4.1.1.
    /**
     * The ECVRF_hash_to_curve algorithm takes in the VRF input alpha and
     converts it to H, an EC point in G
     * @param {*} suite_string A single octet specifying ECVRF ciphersuite
     * @param {*} pk public key, an EC point
     * @param {*} alpha_string value to be hashed, an octet string
     * @return  H - hashed value, A finite EC point in G, or INVALID upon failure
     */
    hash_to_curve_try_and_increment(suite_string, pk, alpha_string) {
        // 1. ctr = 0
        let ctr = 0x00

        // 2. PK_string = point_to_string(Y)
        const pk_string = this.#string_to_bytes(pk.encodeCompressed('hex'))
        alpha_string = this.#string_to_bytes(alpha_string)

        // 3. one_string = 0x01 = int_to_string(1, 1), A single octet with value 1
        const one_string = 0x01

        // 4. H = 'INVALID'
        let H = 'INVALID'
    
        // 5. While H is "INVALID" or H is EC point at infinity
        while (H == 'INVALID' || H.isInfinity()) {
            // A. ctr_string = int_to_string(ctr, 1)
            // B. hash_string = Hash(suite_string || one_string || PK_string ||alpha_string || ctr_string)
            const hash_string = SHA256.create().update([suite_string, one_string, ...pk_string, ...alpha_string, ctr]).digest()

            // C. H = arbitrary_string_to_point(hash_string) 
            H = this.string_to_point([0x02, ...hash_string])
    
            // D.  If H is not "INVALID" and cofactor > 1, set H = cofactor * H
            // We can omit these step because cofactor = 1

            // E. ctr = ctr + 1
            ctr = ctr + 0x01
        }

        // 6. Output H
        return H
    }

    // Section 5.4.2.1. ECVRF Nonce Generation From RFC 6979
    /**
     * Random nonce generation
     * @param sk an ECVRF secret key as bytes
     * @param h_string an octet string
     * @return k an number between 0 and q-1
     */
    nonce_generation_rfc6979(sk, h_string) {
        // a. Process m through the hash function H, yielding:
        h_string = this.#string_to_bytes(h_string)
        let h1 = SHA256.create().update(h_string).digest()
        h1 = this.#bits2octets(h1, this.ORDER)
        sk = this.#int2octets(BigInt('0x' + sk), this.ORDER.bitLength())

        // b. set V = 0x01 0x01 0x01 ... 0x01 such that the length of V, in bits, is equal to 8*ceil(hlen/8).
        let v = Array(32).fill(0x01)

        // c. Set: K = 0x00 0x00 0x00 ... 0x00 such that the length of K, in bits, is equal to 8*ceil(hlen/8).
        let k = Array(32).fill(0x00)

        // d.  Set: K = HMAC_K(V || 0x00 || int2octets(x) || bits2octets(h1)) where '||' denotes concatenation.
        //k = Hmac.create(k).update(v.concat(0x00, sk, h1)).digest()
        k = Hmac.create(k)
            .update(v)
            .update([0x00])
            .update(sk)
            .update(h1)
            .digest();

        // e. Set: V = HMAC_K(V)
        v = Hmac.create(k).update(v).digest()

        // f. Set:  K = HMAC_K(V || 0x01 || int2octets(x) || bits2octets(h1))
        //k = Hmac.create(k).update(v.concat(0x01, sk, h1)).digest()
        k = Hmac.create(k)
            .update(v)
            .update([0x01])
            .update(sk)
            .update(h1)
            .digest();

        // g. Set: V = HMAC_K(V)
        v = Hmac.create(k).update(v).digest()

        // h. Apply the following algorithm until a proper value is found for k:
        // 1. Set T to the empty sequence.  The length of T (in bits) is denoted tlen; thus, at that point, tlen = 0.

        // 2.
        while (true) {
            v = Hmac.create(k).update(v).digest()
            const k_int = this.#bits2int(v, this.ORDER.bitLength())
            if (k_int < BigInt(this.ORDER) - 1n) {
                return k_int
            }
            k = SHA256.hmac.create(k)
                .update(v)
                .update([0x00])
                .digest()

            v = SHA256.hmac.create(k).update(v).digest()

        }

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
    #hash_points(p1, p2, p3, p4) {
        // 1. two_string = 0x02 = int_to_string(2, 1), A single octet with value 2
        const two_string = [0x02]

        // 2. Initialize str = suite_string || two_string
        let string = this.SUITE_STRING.concat(two_string)

        // 3.for PJ in [P1, P2, ... PM]: 
        // str = str || point_to_string(PJ)
        p1 = this.#string_to_bytes(this.point_to_string(p1))
        p2 = this.#string_to_bytes(this.point_to_string(p2))
        p3 = this.#string_to_bytes(this.point_to_string(p3))
        p4 = this.#string_to_bytes(this.point_to_string(p4))
        string = string.concat(p1, p2, p3, p4)

        // 4. c_string = Hash(str)
        const c_string = this.#hash(string)

        // 5. truncated_c_string = c_string[0]...c_string[n-1]
        const truncated_c_string = c_string.slice(0, 16)

        // 6. c = string_to_int(truncated_c_string)
        const c = this.#string_to_int(truncated_c_string)

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
    decode_proof(pi_string) {
        // ptLen+n+qLen octets = 33+16+32 = 81
        pi_string = this.#string_to_bytes(pi_string)
        if (pi_string.length != 81) {
            return 'INVALID'
        }

        // 1. let gamma_string = pi_string[0]...p_string[ptLen-1]
        const gamma_string = pi_string.slice(0, 33)

        // let c_string = pi_string[ptLen]...pi_string[ptLen+n-1]
        const c_string = pi_string.slice(33, 49)

        // 3. let s_string =pi_string[ptLen+n]...pi_string[ptLen+n+qLen-1]
        const s_string = pi_string.slice(49)

        // 4. Gamma = string_to_point(gamma_string)
        // 5. if Gamma = "INVALID" output "INVALID" and stop.
        const gamma = this.string_to_point(gamma_string)
        if (gamma == 'INVALID') {
            return 'INVALID'
        }

        // 6. c = string_to_int(c_string)
        const c = this.#string_to_int(c_string)

        // 7. s = string_to_int(s_string)
        const s = this.#string_to_int(s_string)

        // 8. Output Gamma, c, and s
        return [gamma, c, s]
    }

    /**
     * Hash function
     * @param message - An array of number
     * @returns Hash value as an Array of number
     */
    #hash(message) {
        return SHA256.create().update(message).digest()
    }


    /**
     * conversion of EC point to an ptLen-octet string  as specified in Section 5.5.
     * @param point An EC point
     * @returns An octet string reprasenting the EC point 
     */
    point_to_string(point) {
        return point.encodeCompressed('hex')
    }


    /**
    * conversion of an ptLen-octet string to EC point
    as specified in Section 5.5. 
    * @param a_string an 32-bytes string
    * @returns An EC point
    */
    string_to_point(a_string) {
        try {
            return this.ec.curve.decodePoint(a_string, 'hex')
        } catch (error) {
            return 'INVALID'
        }
    }

    /**
     * string_to_int(a_string) - conversion of an octet string to A nonnegative number as specified in Section 5.5.
     * @param a_string An array of number representing the octect string
     * @returns A BigInt in big endian
     */
    #string_to_int(a_string) {
        if (!(a_string instanceof Array)) a_string = this.#string_to_bytes(a_string)
        return BigInt('0x' + a_string.map(byte => byte.toString(16).padStart(2, '0')).join(''))
    }

    /**
     * int_to_string(A, len) - conversion of nonnegative number A to an octet string of length len as specified in Section 5.5.
     * @param number A BigInteger
     * @param len length of the string
     * @returns A octet string in big endian
     */
    #int_to_string(number, len) {
        number = number.toString(16)
        const numLen = number.length
        if (numLen % 2 != 0) number = '0' + number
        const bytes = this.#string_to_bytes(number)
        return bytes.slice(0, len).map(byte => byte.toString(16).padStart(2, '0')).join('')
    }

    /**
     * Convert string to bytes
     * @param octet_string  A string
     * @returns An array of number
     */
    #string_to_bytes(octet_string) {
        if (!(octet_string instanceof String)) octet_string = octet_string.toString(16)
        const A = []
        for (let i = 0; i < octet_string.length; i = i + 2) {
            A.push(parseInt(octet_string.substr(i, 2), 16))
        }
        return A;
    }

    #bits2octets(bits, q) {
        const z1 = this.#bits2int(bits, q.bitLength())
        const z2 = z1 % BigInt(q)
        return this.#int2octets(z2, q.bitLength())
    }

    #string_to_octets(a_string) {
        a_string = a_string.toString(16)
        let octect = []
        for (let i = 0; i < a_string.length; i = i + 2) {
            octect.push(a_string.substr(i, 2))
        }
        return octect
    }

    #bits2int(bits, qLen) {
        const bLen = bits.length * 8
        let integer = BigInt('0x' + bits.map(byte => byte.toString(16).padStart(2, '0')).join(''))
        if (qLen < bLen) {
            integer = integer >> BigInt(bLen - qLen)
        }
        return integer
    }

    #int2octets(int, qLen) {
        int = int.toString(16)
        if (int.length % 2 != 0) int = '0' + int
        let octets = this.#string_to_bytes(int)
        const rLen = 8 * (qLen / 8)
        const bLen = octets.length * 8

        if (bLen < rLen) {
            // left pad with rlen - blen bits
            const padNum = Math.ceil((rLen - bLen) / 8)
            //console.log('padnum', padNum)
            const leftPaddedBits = Array(padNum).fill(0x00, 0, padNum)
            octets = leftPaddedBits.concat(octets)
        }
        if (bLen > rLen) {
            // truncate to rlen bits
            octets = octets.slice(0, Math.ceil(qLen / 8))
        }
        return octets
    }

  
}







module.exports = VRF




