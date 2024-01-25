// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import './libraries/BigNumbers.sol';
import 'hardhat/console.sol';

contract VerifierZKPCorrectDecryption {
    using BigNumbers for *;

    function verifyTx(
        bytes memory _c,
        bytes memory _ci,
        bytes memory _R1,
        bytes memory _R2,
        bytes memory _z,
        bytes memory _cc,
        bytes memory _vki,
        bytes memory _N,
        bytes memory _delta,
        bytes memory _vk
    ) external view returns(bool) {
        //BigNumber memory c = BigNumbers.init(_c, false);
        //BigNumber memory ci = BigNumbers.init(_ci, false);
        //BigNumber memory R1 = BigNumbers.init(_R1, false);
        //BigNumber memory R2 = BigNumbers.init(_R2, false);
        //BigNumber memory z = BigNumbers.init(_z, false);
        //BigNumber memory cc = BigNumbers.init(_cc, false);
        //BigNumber memory vki = BigNumbers.init(_vki, false);
        //BigNumber memory N = BigNumbers.init(_N, false);
        //BigNumber memory delta = BigNumbers.init(_delta, false);
        //BigNumber memory vk = BigNumbers.init(_vk, false);

        //BigNumber memory NN = N.mul(N);
        //BigNumber memory FOUR = BigNumbers.init(4, false);
        //BigNumber memory TWO = BigNumbers.init(2, false);

        /*
        BigNumber memory equality_1_left = BigNumbers.modexp(BigNumbers.init(_vk, false), BigNumbers.init(_delta, false).mul(z), NN);
        BigNumber memory equality_1_right = BigNumbers.modmul(
            R1,
            BigNumbers.modexp(vki, cc, NN),
            NN
        );

        BigNumber memory equality_2_left = BigNumbers.modexp(c, BigNumbers.init(4, false).mul(BigNumbers.init(_delta, false).mul(z)), NN);
        BigNumber memory equality_2_right = BigNumbers.modmul(
            R2,
            BigNumbers.modexp(BigNumbers.init(_ci, false), BigNumbers.mul(BigNumbers.init(2, false), cc), NN),
            NN
        );
        

        bool partial_ZKP_check = equality_1_left.eq(equality_1_right) &&
                                equality_2_left.eq(equality_2_right);
        */
        BigNumber memory _equality_1_left = equality_1_left(_vk, _delta, _z, _N);
        BigNumber memory _equality_1_right = equality_1_right(_R1, _vki, _cc, _N);
        BigNumber memory _equality_2_left = equality_2_left(_c, _delta, _z, _N);
        BigNumber memory _equality_2_right = equality_2_right(_R2, _ci, _cc, _N);

        bool partial_ZKP_check = _equality_1_left.eq(_equality_1_right) &&
                                _equality_2_left.eq(_equality_2_right);
        return partial_ZKP_check;
    }

    function equality_1_left(bytes memory _vk, bytes memory _delta, bytes memory _z, bytes memory _N) internal view returns(BigNumber memory) {
        BigNumber memory N = BigNumbers.init(_N, false);
        BigNumber memory NN = N.mul(N);
        BigNumber memory _equality_1_left = BigNumbers.modexp(BigNumbers.init(_vk, false), BigNumbers.init(_delta, false).mul(BigNumbers.init(_z, false)), NN);
        return _equality_1_left;
    }

    function equality_1_right(bytes memory _R1, bytes memory _vki, bytes memory _cc, bytes memory _N) internal view returns(BigNumber memory){
        BigNumber memory R1 = BigNumbers.init(_R1, false);
        BigNumber memory vki = BigNumbers.init(_vki, false);
        BigNumber memory cc = BigNumbers.init(_cc, false);
        BigNumber memory N = BigNumbers.init(_N, false);
        BigNumber memory NN = N.mul(N);
        BigNumber memory _equality_1_right = BigNumbers.modmul(
            R1,
            BigNumbers.modexp(vki, cc, NN),
            NN
        );
        return _equality_1_right;
    }

    function equality_2_left(bytes memory _c, bytes memory _delta, bytes memory _z, bytes memory _N) internal view returns(BigNumber memory) {
        BigNumber memory N = BigNumbers.init(_N, false);
        BigNumber memory NN = N.mul(N);
        BigNumber memory _equality_2_left = BigNumbers.modexp(BigNumbers.init(_c, false), BigNumbers.init(4, false).mul(BigNumbers.init(_delta, false).mul(BigNumbers.init(_z, false))), NN);
        return _equality_2_left;
    }

    function equality_2_right(bytes memory _R2, bytes memory _ci, bytes memory _cc, bytes memory _N) internal view returns(BigNumber memory){
        BigNumber memory R2 = BigNumbers.init(_R2, false);
        BigNumber memory ci = BigNumbers.init(_ci, false);
        BigNumber memory cc = BigNumbers.init(_cc, false);
        BigNumber memory N = BigNumbers.init(_N, false);
        BigNumber memory NN = N.mul(N);
        BigNumber memory _equality_2_right = BigNumbers.modmul(
            R2,
            BigNumbers.modexp(ci, BigNumbers.mul(BigNumbers.init(2, false), cc), NN),
            NN
        );
        return _equality_2_right;
    }
}