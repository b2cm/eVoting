//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Register {
    address[] private eligibleVoters;
    bytes[] private hashedVoterIDs;
    string[] private lrs;
    string[] private hashedIDs;
    mapping(bytes => string) private lrsPublicKeys; // hashedID => lrsPublicKey (Linkable Ring Signature pk)

    struct SHA512 {
        bytes32 part1;
        bytes32 part2;
    }

    event HashedIDStored();
    event VoterAdded();
    event LRSPKStored();

    constructor() {

    }

    function storeHashedID(string memory _hashedID) external {
        hashedIDs.push(_hashedID);
        emit HashedIDStored();
    }

    function getHashedIDs() external view returns (string[] memory _hashedIDs) {
        uint256 length = hashedIDs.length;
        _hashedIDs = new string[](length);
        for (uint256 i = 0; i < length; i++) {
            _hashedIDs[i] = hashedIDs[i];
        }
    }

    function storeHashedIDAndPK(bytes memory _hashedID, string memory _publicKey) external {
        hashedVoterIDs.push(_hashedID);
        lrsPublicKeys[_hashedID] = _publicKey;
        lrs.push(_publicKey);
        emit HashedIDStored();
        emit LRSPKStored();
    }

    function addEligibleVoter(address _voter) external {
        eligibleVoters.push(_voter);
        emit VoterAdded();
    }

    function getVoterIDs() external view returns(bytes[] memory) {
        uint256 length = hashedVoterIDs.length;
        bytes[] memory _voterIDs = new bytes[](length);
        for (uint256 i = 0; i < length; i++) {
            _voterIDs[i] = hashedVoterIDs[i];
        }
        return _voterIDs;
    }

    function storeLRSPK (bytes memory _hashedID, string memory _publicKey) external {
        lrsPublicKeys[_hashedID] = _publicKey;
        emit LRSPKStored();
    }

    function getLRSPKs(bytes memory _hashedID) external view returns(string memory pk) {
        pk = lrsPublicKeys[_hashedID];
    }

    function getLRSGroup() external view returns(string[] memory _lrs) {
        _lrs = new string[](lrs.length);
        for (uint256 i = 0; i < lrs.length; i++) {
            _lrs[i] = lrs[i];
        }
    }
}