//SPDX-License-Identifier: GPL
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

    struct Token {
        string vid;
        string partyId;
        string counter;
    }

     struct Vote {
        string sessionId;
        string cipherText; // The vote : musst be a string
        Proof proof;
        Signature signature;
        string groupId;
        Token[] token;
    }
    
    struct VotingDetails {
        string name;
        string description;
        uint256 start_time;
        uint256 end_time;
    }

    struct BallotDetails {
        uint256 index;
        Utils.BallotPaper ballot_paper;
    }

    struct VoterData {
        bytes pubKey;
        bytes hashedId;
    }

}