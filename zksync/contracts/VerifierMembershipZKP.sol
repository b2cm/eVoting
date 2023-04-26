// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;
import './libraries/BigNumbers.sol';

contract VerifierMembershipZKP {
    using BigNumbers for *;

    function BN(bytes[] memory _values) external view returns (BigNumber[] memory _bg) {
        _bg = new BigNumber[](_values.length);
        for (uint256 i = 0; i < _values.length; i++) {
            _bg[i] = BigNumbers.init(_values[i], false);
        }
    }

    function generator(BigNumber memory _bg) internal view returns (BigNumber memory) {
        BigNumber memory ONE = hex"0001".init(false);
       return _bg.add(ONE);
    }

    function verifyMembershipZKP(
        bytes memory _ciphertext, 
        bytes[][] memory _proof,
        bool[] memory _isProof0Negativ,
        bytes[] memory _as,
        bytes[] memory _ias,
        bytes[] memory _gmk,
        bytes memory _e,
        bytes memory _pubKey) external view returns(bool)
         {
            BigNumber memory pubKey = BigNumbers.init((_pubKey), false);
            BigNumber memory pubKey2 = pubKey.mul(pubKey);
            // Verify the first modular inverses (_as)
            for (uint256 i = 0; i < _gmk.length; i++) {
                bool val = verifyInvMod(_gmk[i], pubKey.val, _as[i]);
                require(val, 'Modular inverse verification fails.');
            }
            
            BigNumber memory cipher = BigNumbers.init((_ciphertext), false);
            BigNumber[] memory AS = new BigNumber[](_as.length);
            
            for (uint256 i = 0; i < _as.length; i++) {
                BigNumber memory uk = cipher.modmul(BigNumbers.init(_as[i], false), pubKey2);
                AS[i]= uk;
            }

            // Verify the second modular inverses (inverse of AS values).
            // Because proof[0][0] is negativ, we calculate the modular exponentiation (ai**ei mod(N*N)) using the modular inverse of ai (see checkEvery function).
            for (uint256 i = 0; i < AS.length; i++) {
                bool val = verifyInvMod(AS[i].val, _pubKey, _ias[0]);
                require(val, 'Second modular inverses verification fails.');
            }
            
            BigNumber memory eSum = BigNumbers.zero(); 
            for (uint256 i = 0; i < _proof[0].length; i++) {
                BigNumber memory _i = BigNumbers.init((_proof[0][i]), false);
                if ( _isProof0Negativ[i] ) {
                    _i = BigNumbers.init((_proof[0][i]), true);
                }
                eSum = (eSum.add(_i)).mod(pubKey);
            }
            
            if (!eSum.eq(BigNumbers.init((_e), false))) {
                return false;
            }

           return checkEvery(_proof, _isProof0Negativ, AS, _ias, pubKey);
    }

    function checkEvery(bytes[][] memory _proof, bool[] memory _isProof0Negativ, BigNumber[] memory _as, bytes[] memory _ias, BigNumber memory _pub) public view returns(bool) {
        BigNumber memory pubKey2 = _pub.mul(_pub);
         for (uint256 i = 0; i < _proof[2].length; i++) {
                BigNumber memory v = BigNumbers.init((_proof[2][i]), false);
                BigNumber memory ui = BigNumbers.init((_proof[1][i]), false);
                BigNumber memory ai = _as[i];
                BigNumber memory vin = BigNumbers.modexp(v, _pub, pubKey2);
                BigNumber memory ei = BigNumbers.init((_proof[0][i]), false);
                BigNumber memory aie;
                BigNumber memory uiae;
                if ( _isProof0Negativ[i] ) {
                    ei = BigNumbers.init((_proof[0][i]), true);
                    BigNumber memory inv = BigNumbers.init(_ias[0], false);
                    aie = BigNumbers.modexp(ai, inv, ei, pubKey2);
                    uiae = BigNumbers.modmul(ui, aie, pubKey2);
                } else {
                    aie = BigNumbers.modexp(ai, ei, pubKey2);
                    uiae = BigNumbers.modmul(ui, aie, pubKey2);
                }

                if (!(vin.eq(uiae))) {
                    return false;
                }
            }
            return true;
    }

    function verifyInvMod(bytes memory _gmk, bytes memory _N, bytes memory _r) public view returns(bool verify) {
        BigNumber memory gmk = BigNumbers.init(_gmk, false);
        BigNumber memory N = BigNumbers.init(_N, false);
        BigNumber memory r = BigNumbers.init(_r, false);
        verify = BigNumbers.modinvVerify(gmk, N, r);
    }

    function add1(uint256 a, uint256 b) public view returns (uint256 result) {
        result = a + b;
    }

    function add2(bytes memory _a, bytes memory _b) public view returns (BigNumber memory result) {
        BigNumber memory a = BigNumbers.init(_a, false);
        BigNumber memory b = BigNumbers.init(_b, false);
        result = a.add(b);
    }

}