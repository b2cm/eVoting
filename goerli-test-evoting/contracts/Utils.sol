//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Utils {
    // Verifier Struct
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }

    struct VerifyingKey {
        G2Point beta;
        G1Point alpha;
        G2Point gamma;
        G2Point delta;
        G1Point[] gamma_abc;
    }
    
    struct Proof {
        G1Point a;
        G2Point b;
        G1Point c;
    }
}