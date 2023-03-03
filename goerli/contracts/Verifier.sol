//SPDX-License-Identifier: MIT
// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;

import "@opengsn/contracts/src/ERC2771Recipient.sol";
import './Utils.sol';
import './Pairing.sol';
import './interfaces/IVerifier.sol';


contract Verifier is IEVerifier, ERC2771Recipient {
    using Pairing for *;

    event AuthentificationStatus(bool);

    constructor(address _forwarder) {
        _setTrustedForwarder(_forwarder);
    }

    function verifyingKey() pure internal returns (Utils.VerifyingKey memory vk) {
        vk.alpha = Utils.G1Point(uint256(0x066553b8fcba117b33de76a56dd17aaffd849ca7b4fe0d2c6a16e9ec14a88822), uint256(0x066f78592f981303ddda83b10ba98511eba5a37b4ea9b0853da73f9ef9784974));
        vk.beta = Utils.G2Point([uint256(0x07a604c23b2259a5c440f40e0770d6f906e9b42845e5ab2cf664863d4322693c), uint256(0x144d527bfeed78141d970e24292ccd24d91f9190fda2a09da56dc3f7a52f283e)], [uint256(0x20c68e33e17bb1bc424cb2d8212e940d348f25cb2002738b8491ddb16acc6ba1), uint256(0x03237622bda6cd21a559fbb7e525b26d2754178a551e5d6483a13181a8321fa1)]);
        vk.gamma = Utils.G2Point([uint256(0x2c8d18ec7a27c73c549ae598858e04549a4afbf55b35ac27a33500fa47979a31), uint256(0x09af3cff8c3632ca41eec1e7b63da858df12912ffb3c8e2d1d24d40ef4727f9d)], [uint256(0x0dc4ee154e51be54fc5682bfb2139ef09e7681b25d321ddd717cbf7ba9726751), uint256(0x02c73f32b3d80c1b6f9dce28c840c69cefc7d4b7e0ec4a9dab7019bea724e4cc)]);
        vk.delta = Utils.G2Point([uint256(0x15116ac1900ccf0db1d370fec8291f78e78ddc4b18205f54e6a22a224bbb557f), uint256(0x267143bc514049ef27a7953e1c0d9587bb5f1dbfec3d717ec41c86137a991f69)], [uint256(0x28206e51e757bd8b5e4fe2bafbcd1196498643337aaa9e7afd9a47b76c944357), uint256(0x0d14f9093dece5d4af5ed4124ae4600d94499253552996fc7073a1dcde909919)]);
        vk.gamma_abc = new Utils.G1Point[](3);
        vk.gamma_abc[0] = Utils.G1Point(uint256(0x13ed617263023bbc7a813d5788af3340ade29b94293353cc6d4d3221efe507fe), uint256(0x2bb8f6be056cb950abf8267afcd9a6d787b704fd92752e8559f4107cb99521d2));
        vk.gamma_abc[1] = Utils.G1Point(uint256(0x188edc46c3d2c77dce751077dff767c1988a8f3a5b7d419595c17f6c5eb851ee), uint256(0x2af8e5df9668af1995b08ef029fabaae04eb8f497cfacbb9eb442c2fc605dd9f));
        vk.gamma_abc[2] = Utils.G1Point(uint256(0x199f68a740799a5298d65bea4fd65c3ca9add7ef4090b8a9a912ec820e225bea), uint256(0x24ea1ec41b0ee418fa3c73183ca75c5ea2f0bd0dc33af48a0900b6d347d95975));
    }
    function verify(uint[] memory input, Utils.Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        Utils.VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Utils.G1Point memory vk_x = Utils.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }

    function verifyTx(
            Utils.Proof memory proof, uint[2] memory input
        ) external override returns (bool r) {
        uint[] memory inputValues = new uint[](2);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            emit AuthentificationStatus(true);
            return true;
        } else {
            emit AuthentificationStatus(false);
            return false;
        }
    }
}