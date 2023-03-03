//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Utils {
    struct Voting {
        bytes32 id;
        address addr;
    }

    struct BallotPaper{
        uint8 ballotType;
        string name;
        string information;
        string title;
        string[] candidates;
    }

     struct Ballot {
        bytes32 vote;
        bytes32 voterID;
        bytes32 counter;
        bytes32 signature;
        bytes32 zkp;
    }

}