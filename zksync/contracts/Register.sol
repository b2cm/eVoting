//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Register {
    address[] private eligibleVoters;
    bytes[] private hashedVoterIDs;
    mapping(bytes => bytes) private lrsPublicKeys; // hashedID => lrsPublicKey

    struct SHA512 {
        bytes32 part1;
        bytes32 part2;
    }

    event HashedIDStored();
    event VoterAdded();
    event LRSPKStored();

    constructor() {

    }

    function storeHashedIDAndPK(bytes memory _hashedID, bytes memory _publicKey) external {
        hashedVoterIDs.push(_hashedID);
        lrsPublicKeys[_hashedID] = _publicKey;
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

    function storeLRSPK (bytes memory _hashedID, bytes memory _publicKey) external {
        lrsPublicKeys[_hashedID] = _publicKey;
        emit LRSPKStored();
    }

    function getLRSPKs(bytes memory _hashedID) external view returns(bytes memory pk) {
        pk = lrsPublicKeys[_hashedID];
    }
}