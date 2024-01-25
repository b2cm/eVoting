//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Utils2 {
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
        uint256 maxSelectableAnswer;
    }

    struct Proof {
        string[] p1;
        string[] p2;
        string[] p3;
    }

    struct Signature {
        string y0;
        string s;
        string[] c;
    }

     struct Ballot {
        string sessionId;
        string cipherText; // The vote : musst be a string
        Proof proof;
        //bytes32 counter;
        Signature signature;
        string groupId;
        string token;
    }

    struct BallotWithIndex {
        uint8 index; // The index of the ballot paper => Just for the mapping.
        Ballot[] ballot;
    }

}