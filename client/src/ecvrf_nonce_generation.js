const EC = require("elliptic").ec;
const SHA256 = require("js-sha256").sha256;
const Hmac = require("js-sha256").sha256.hmac;
const ec = new EC("p256");
const PRIME = ec.curve.p;

var q = BigInt("0x" + "4000000000000000000020108A2E0CC0D99F8A5EF");  
var qlen = 163;
var rolen = (qlen + 7) >> 3;
var rlen = rolen * 8;       
 
/**
 *
 * @param {BigInt} n
 * @returns {Uint8Array}
 */
function bigIntToByteArray(n) {   
	let s = n.toString(16);
	let l = s.length;

	if (l % 2 != 0) {
		s = "0" + s;
		l++;
	}

	let arrLength = l / 2;
	let arr = new Uint8Array(arrLength);

	for (let i = 0; i < arrLength; i++) {
		let byte = Number.parseInt(s.substring(i * 2, i * 2 + 2), 16);
		// if (byte > 127) {
		//   byte = -(~byte & 0xFF) - 1;
		// }
		arr[i] = byte;
	}

	return arr;
}

/**
 *
 * @param {BigInt} n
 * @returns {Uint8Array}
 */
function int2octets(n) {        
	let o = bigIntToByteArray(n);
	if (o.length > rolen) {
		return o.slice(o.length - rolen);
	} else if (o.length < rolen) {
		return new Uint8Array([...Array(rolen - o.length).fill(0), ...o]);
	} else {
		return o;
	}
}

/**
 *
 * @param {Uint8Array} n
 * @returns {Uint8Array}
 */
function bits2octets(n) {     
	let z1 = bits2int(n);
	let z2 = z1 - q;

	return int2octets(z2 < 0 ? z1 : z2);
}

/**
 *
 * @param {Uint8Array} bits
 * @returns {BigInt}
 */
function bits2int(bits) {      
	let n = BigInt(
		"0x" +
			Array.from(bits)
				.map((n) => n.toString(16).padStart(2, "0"))
				.join("")
	);
	let vlen = bits.length * 8;
	if (vlen > qlen) {
		n = n >> BigInt(vlen - qlen);
	}
	return n;
}

function _ecvrf_nonce_generation_rfc6979_2(sk, h_string) {
	const h1 = new Uint8Array(
		SHA256.create().update(bigIntToByteArray(h_string)).arrayBuffer()
	);

	sk = int2octets(sk);
	console.log('sk',sk)

	let v = new Uint8Array(Array(32).fill(0x01, 0, 32));
	console.log('v',v)

	let k = new Uint8Array(Array(32).fill(0x00, 0, 32));
    console.log('k',k)

	let h1_oct = bits2octets(h1).buffer;

	let zero = new Uint8Array([0]);
	let one = new Uint8Array([1]);

	k = Hmac.create(k)
		.update(v)
		.update(zero)
		.update(sk)
		.update(h1_oct)
		.arrayBuffer();
		console.log('k',Array.from(new Uint8Array(k)).map(s => s.toString(16)))
	
	v = Hmac.create(k).update(v).arrayBuffer();
	console.log('v',Array.from(new Uint8Array(v)).map(s => s.toString(16)))

	k = Hmac.create(k)
		.update(v)
		.update(one)
		.update(sk)
		.update(h1_oct)
		.arrayBuffer();

	v = Hmac.create(k).update(v).arrayBuffer();

	let t = new Uint8Array(Array(rolen).fill(0));
	while (true) {
		let toff = 0;
		while (toff < rolen) {
			v = new Uint8Array(Hmac.create(k).update(v).arrayBuffer());
			let cc = Math.min(v.length, t.length - toff);
			for (let i = 0, j = toff; i < cc; i++, j++) {
				t[j] = v[i];
			}
			toff += cc;          ////??
		}

		k_int = bits2int(t);
		if (k_int > 0 && k_int < q) {
			return k_int;
		}
		k = SHA256.hmac.create(k).update(v).update(zero).arrayBuffer();
		console.log('k',Array.from(new Uint8Array(k)).map(s => s.toString(16)))
		v = SHA256.hmac.create(k).update(v).arrayBuffer();
	}
}

const k = "23AF4074C90A02B3FE61D286D5C87F425E6BDD81B";
const SK = "09A4D6792295A7F730FC3F2B49CBC0F62E862272F";
const alpha = "73616d706c65";    //????
// const alpha = "656c706d6173";
const nonce = BigInt("0x" + k);

console.log(
	_ecvrf_nonce_generation_rfc6979_2(BigInt("0x" + SK), BigInt("0x" + alpha)) ==
		nonce
);
