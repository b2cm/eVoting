// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

//import "vrf-solidity/contracts/VRF.sol";
import "../client/node_modules/vrf-solidity/contracts/VRF.sol";


contract VRFTestHelper_SECP256K1 {


 function verify(uint256[2] memory _publicKey, uint256[4] memory _proof, bytes memory _message) public returns (bool){
    return VRF.verify(_publicKey, _proof, _message);
  }

  function fastVerify(
    uint256[2] memory _publicKey,
    uint256[4] memory _proof,
    bytes memory _message,
    uint256[2] memory _uPoint,
    uint256[4] memory _vComponents)
  public returns (bool)
  {
    return VRF.fastVerify(
      _publicKey,
      _proof,
      _message,
      _uPoint,
      _vComponents);
  }

  function computeFastVerifyParams(uint256[2] memory _publicKey, uint256[4] memory _proof, bytes memory _message)
    public returns (uint256[2] memory, uint256[4] memory)
  {
    return VRF.computeFastVerifyParams(_publicKey, _proof, _message);
  }

  function decodeProof(bytes memory _proof) public returns (uint[4] memory) {
    return VRF.decodeProof(_proof);
  }

  function proofToHash(uint256 _gammaX, uint256 _gammaY) public returns (bytes32) {
    return VRF.gammaToHash(_gammaX, _gammaY);
  }

  function hashToTryAndIncrement(uint256[2] memory _publicKey, bytes memory _message) public returns (uint, uint) {
    return VRF.hashToTryAndIncrement(_publicKey, _message);
  }

  function hashPoints(
    uint256 _hPointX,
    uint256 _hPointY,
    uint256 _gammaX,
    uint256 _gammaY,
    uint256 _uPointX,
    uint256 _uPointY,
    uint256 _vPointX,
    uint256 _vPointY)
  public returns (bytes16)
  {
    return VRF.hashPoints(
      _hPointX,
      _hPointY,
      _gammaX,
      _gammaY,
      _uPointX,
      _uPointY,
      _vPointX,
      _vPointY);
  }

}