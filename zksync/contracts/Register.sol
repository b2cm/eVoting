//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Register {
    address[] private eligibleVoters;
    string[] private hashedVoterIDs;

    struct SHA512 {
        bytes32 part1;
        bytes32 part2;
    }

    event HashedIDStored();
    event VoterAdded();

    constructor() {

    }

    function storeHashedID(string memory _voterID) external {
        hashedVoterIDs.push(_voterID);
        emit HashedIDStored();
    }

    function add_eligibleVoter(address _voter) external {
        eligibleVoters.push(_voter);
        emit VoterAdded();
    }

    function getVoterIDs() external view returns(string[] memory) {
        uint256 length = hashedVoterIDs.length;
        string[] memory _voterIDs = new string[](length);
        for (uint256 i = 0; i < length; i++) {
            _voterIDs[i] = hashedVoterIDs[i];
        }
        return _voterIDs;
    }
}