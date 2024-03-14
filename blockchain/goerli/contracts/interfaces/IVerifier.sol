// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '../Utils.sol';

interface IEVerifier{

    function verifyTx(Utils.VerifyingKey memory vk, Utils.Proof memory proof, uint[2] memory input) external returns (bool r);

}