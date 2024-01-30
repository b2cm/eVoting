"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = exports.FromhexToString = void 0;
function FromhexToString(hexStr) {
    const str = hexStr.replace(" ", "");
    return str == ""
        ? ""
        : str
            .match(/.{2}/g)
            .map((byte) => String.fromCharCode(parseInt(byte, 16)))
            .join("");
}
exports.FromhexToString = FromhexToString;
// This function Rotates right (circular right shift) value x by n positions
function ROTR(n, x) {
    return (x >>> n) | (x << (32 - n));
}
function Σ0(x) {
    return ROTR(2, x) ^ ROTR(13, x) ^ ROTR(22, x);
}
function Σ1(x) {
    return ROTR(6, x) ^ ROTR(11, x) ^ ROTR(25, x);
}
function σ0(x) {
    return ROTR(7, x) ^ ROTR(18, x) ^ (x >>> 3);
}
function σ1(x) {
    return ROTR(17, x) ^ ROTR(19, x) ^ (x >>> 10);
}
function Ch(x, y, z) {
    return (x & y) ^ (~x & z);
} // 'choice'
function Maj(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
} // 'majority'
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
function hash(msg, option) {
    // >>> this oprator is for right shifting (zero-fill right shift)
    //  a = 5;       binary   =>  00000000000000000000000000000101
    //  b = 2;       binary   =>  00000000000000000000000000000010
    //  a >>> b      binary   =>  00000000000000000000000000000001 => in decimal answer is 1
    // 00000000000000000000000000000001
    // 01000000000000000000000000000000
    // 01000000000000000000000000000001
    // console.log((msg.charCodeAt(2)).toString(2))
    if (option.toLowerCase() == "hex") {
        msg = FromhexToString(msg);
    }
    // constants
    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
        0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
        0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
        0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
        0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
        0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    // initial hash values
    const H = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
        0x1f83d9ab, 0x5be0cd19,
    ];
    // PREPROCESSING
    msg += String.fromCharCode(0x80); // add trailing '1' bit (+ 0's padding) to string
    // convert string msg into 512-bit (array of 16 32-bit integers)
    const l = msg.length / 4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
    const N = Math.ceil(l / 16); // number of 16-integer (512-bit) required to hold 'l' ints
    const M = new Array(N); // message M is N×16 array of 32-bit integers
    let fullStr = "";
    let binaryStr;
    for (let i = 0; i < N; i++) {
        M[i] = new Array(16);
        for (let j = 0; j < 16; j++) {
            // encode 4 chars per integer (64 per chunk), big-endian encoding
            M[i][j] =
                (msg.charCodeAt(i * 64 + j * 4 + 0) << 24) |
                    (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) |
                    (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) |
                    (msg.charCodeAt(i * 64 + j * 4 + 3) << 0);
        } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // 00100000 a
    // 10000011 b
    // 00111100 c
    // 00100000 d
    // << LEFT SHIFT
    // 0010000 00000000 00000000 00000000
    // 0000000 10000011 00000000 00000000
    // 0000000 00000000 00111100 00000000
    // 0000000 00000000 00000000 00100000
    // OR
    // 0010000 10000011 00111100 00100000
    // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
    // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
    // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
    const lenHi = ((msg.length - 1) * 8) / Math.pow(2, 32);
    // console.log(Math.floor(lenHi));
    const lenLo = ((msg.length - 1) * 8) >>> 0;
    // console.log(lenLo);
    M[N - 1][14] = Math.floor(lenHi);
    M[N - 1][15] = lenLo;
    // console.log("Number of chunks required to hold the message bits: ", N);
    // console.log(
    // 	"\nMessage after converting in binary + padded bits + message length info in the last 64-bits:"
    // );
    // console.log(
    // 	"_______________________________________________________________"
    // );
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < 16; j++) {
            // encode 4 chars per integer (64 per chunks), big-endian encoding
            if (M[i][j] < 0)
                binaryStr = (M[i][j] * -1).toString(2);
            else
                binaryStr = M[i][j].toString(2);
            while (binaryStr.length < 32) {
                binaryStr = "0" + binaryStr;
            }
            fullStr += binaryStr;
            // process.stdout.write(binaryStr);
        } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // console.log("\n\nMessage Divided in Chunks: ");
    // console.log(
    // 	"_______________________________________________________________"
    // );
    for (let i = 0; i < N; i++) {
        // console.log("\nChunks:", i);
        for (let j = 0; j < 16; j++) {
            // encode 4 chars per integer (64 per chunk), big-endian encoding
            if (M[i][j] < 0)
                binaryStr = (M[i][j] * -1).toString(2);
            else
                binaryStr = M[i][j].toString(2);
            while (binaryStr.length < 32) {
                binaryStr = "0" + binaryStr;
            }
            fullStr += binaryStr;
            // process.stdout.write(binaryStr);
        } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // console.log(
    // 	"\n\n__________________CONSTANTS & Initial HASHES_______________________"
    // );
    // console.log("\n\nConstants :", K);
    // console.log("\n\nInitial HASH Values :", H);
    // console.log(
    // 	"_______________________________________________________________"
    // );
    // HASH COMPUTATION
    for (let i = 0; i < N; i++) {
        // console.log("\n\nProcesssing Chunks:", i);
        // console.log(
        // 	"_______________________________________________________________"
        // );
        const W = new Array(64);
        // console.log("1 - Prepare message schedule: ");
        for (let t = 0; t < 16; t++) {
            W[t] = M[i][t];
            if (W[t] < 0)
                binaryStr = (W[t] * -1).toString(2);
            else
                binaryStr = W[t].toString(2);
            while (binaryStr.length < 32) {
                binaryStr = "0" + binaryStr;
            }
            // console.log(t, binaryStr);
        }
        // console.log("Use message schedule formula for rest of 48 rounds: ");
        for (let t = 16; t < 64; t++) {
            W[t] = (σ1(W[t - 2]) + W[t - 7] + σ0(W[t - 15]) + W[t - 16]) >>> 0;
            if (W[t] < 0)
                binaryStr = (W[t] * -1).toString(2);
            else
                binaryStr = W[t].toString(2);
            while (binaryStr.length < 32) {
                binaryStr = "0" + binaryStr;
            }
            // console.log(t, binaryStr);
        }
        // console.log(
        // 	"\n2 - InitialiZe working variables a, b, c, d, e, f, g, h with previous hash value:"
        // );
        let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
        // console.log(
        // 	"a =>",
        // 	a.toString(2),
        // 	"\nb =>",
        // 	b.toString(2),
        // 	"\nc =>",
        // 	c.toString(2),
        // 	"\nd =>",
        // 	d.toString(2),
        // 	"\ne =>",
        // 	e.toString(2),
        // 	"\nf =>",
        // 	f.toString(2),
        // 	"\ng =>",
        // 	g.toString(2),
        // 	"\nh =>",
        // 	h.toString(2)
        // );
        // 3 - main loop (note '>>> 0' for 'addition modulo 2^32')
        const T1 = h + Σ1(e) + Ch(e, f, g) + K[0] + W[0];
        const T2 = Σ0(a) + Maj(a, b, c);
        h = g;
        g = f;
        f = e;
        e = (d + T1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (T1 + T2) >>> 0;
        // console.log(
        // 	"\nUpdated variables a, b, c, d, e, f, g, h after FIRST Iteration:"
        // );
        // console.log(
        // 	"a =>",
        // 	a.toString(2),
        // 	"\nb =>",
        // 	b.toString(2),
        // 	"\nc =>",
        // 	c.toString(2),
        // 	"\nd =>",
        // 	d.toString(2),
        // 	"\ne =>",
        // 	e.toString(2),
        // 	"\nf =>",
        // 	f.toString(2),
        // 	"\ng =>",
        // 	g.toString(2),
        // 	"\nh =>",
        // 	h.toString(2)
        // );
        for (let t = 1; t < 64; t++) {
            const T1 = h + Σ1(e) + Ch(e, f, g) + K[t] + W[t];
            const T2 = Σ0(a) + Maj(a, b, c);
            h = g;
            g = f;
            f = e;
            e = (d + T1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (T1 + T2) >>> 0;
        }
        // console.log(
        // 	"\nUpdated variables a, b, c, d, e, f, g, h AFTER 64 ITERATIONS"
        // );
        // console.log(
        // 	"a =>",
        // 	a.toString(2),
        // 	"\nb =>",
        // 	b.toString(2),
        // 	"\nc =>",
        // 	c.toString(2),
        // 	"\nd =>",
        // 	d.toString(2),
        // 	"\ne =>",
        // 	e.toString(2),
        // 	"\nf =>",
        // 	f.toString(2),
        // 	"\ng =>",
        // 	g.toString(2),
        // 	"\nh =>",
        // 	h.toString(2)
        // );
        H[0] = (H[0] + a) >>> 0;
        H[1] = (H[1] + b) >>> 0;
        H[2] = (H[2] + c) >>> 0;
        H[3] = (H[3] + d) >>> 0;
        H[4] = (H[4] + e) >>> 0;
        H[5] = (H[5] + f) >>> 0;
        H[6] = (H[6] + g) >>> 0;
        H[7] = (H[7] + h) >>> 0;
        // console.log("\nCompute the new intermediate hash value: ");
        // console.log(
        // 	"H0 =>",
        // 	H[0].toString(2),
        // 	"\nH1 =>",
        // 	H[1].toString(2),
        // 	"\nH2 =>",
        // 	H[2].toString(2),
        // 	"\nH3 =>",
        // 	H[3].toString(2),
        // 	"\nH4 =>",
        // 	H[4].toString(2),
        // 	"\nH5 =>",
        // 	H[5].toString(2),
        // 	"\nH6 =>",
        // 	H[6].toString(2),
        // 	"\nH7 =>",
        // 	H[7].toString(2)
        // );
    }
    // convert H0..H7 to hex strings (with leading zeros)
    for (let h = 0; h < H.length; h++)
        H[h] = ("00000000" + H[h].toString(16)).slice(-8);
    // concatenate H0..H7 in one string and return
    return H.join("");
}
exports.hash = hash;
//# sourceMappingURL=hash.js.map