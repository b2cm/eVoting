//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Utils2.sol';


contract Evoting {
    bytes32 public voteID;
    string public name;
    string public description;
    address public admin;
    uint256 public start_time;
    uint256 public end_time;
    uint256 public createdAt;
    bool public canceled;
    Utils2.BallotPaper[] public ballot_papers;
    
    mapping(uint256 => mapping(uint256 => Utils2.Ballot[])) public votes_per_ballot_paper_type2_per_candidates; // ballotID => candidate index => votes[]
    mapping(uint256 => bool) public is_valid_ballot; // Check if ballot was not deleted(false).
    mapping(uint256 => Utils2.Ballot[]) public votes_per_ballot_paper_type1; // Map votes to the corresponding ballot paper.
    mapping(address => Utils2.Ballot[]) public votes_per_voters;
    mapping(uint256 => uint256) private count_total_votes_per_ballot_paper;
    uint256 private count_total_votes;
    Utils2.BallotWithIndex[] public votes;
    Utils2.Ballot[][] public finalVotes;
    
    struct VotingDetails {
        string name;
        string description;
        uint256 start_time;
        uint256 end_time;
    }

    struct BallotDetails {
        uint256 index;
        Utils2.BallotPaper ballot_paper;
    }

    enum VotingState {
        IN_PREPARATION,
        LIVE,
        COMPLETED,
        CANCELED
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, 'You are not an Admin.');

        _;
    }

    event VoterAdded(bool);
    event VotingOpened();
    event VotingClosed();
    event BallotsAdded();
    event BallotsRemoved();
    event VotingCanceled();
    event VoteReceived();
    event VotingUpdated();


    constructor(bytes32 _voteID, string memory _name, string memory _description, address _admin, uint256 _start_time, uint256 _end_time, Utils2.BallotPaper[] memory _ballot_papers) {
        require(_start_time < _end_time, 'The end time must be greater than the start time.');
        voteID = _voteID;
        name = _name;
        description = _description;
        admin = _admin;
        start_time = _start_time;
        end_time = _end_time;
        createdAt = block.timestamp;
        add_ballots(_ballot_papers);
    }

    /**@dev Only admin can add ballot papers.
    *@param _ballot_papers an array containing the ballot papers.
     */
    function add_ballots(Utils2.BallotPaper[] memory _ballot_papers) private  {
        uint256 length = _ballot_papers.length;
        for (uint256 i = 0; i < length; i++ ) {
            if (_ballot_papers[i].ballotType == 2) {
                require(_ballot_papers[i].maxSelectableAnswer <= _ballot_papers[i].candidates.length, 'Ballots not set correctly');
            }
            ballot_papers.push(_ballot_papers[i]);
        }
        emit BallotsAdded();
    }

    /**@dev Only admin can delete ballot papers.
    *@notice This method results in an unordered array.
    *@param _ballot_ids Array containing the ids of the ballot paper to remove.
     */
    function delete_ballots(uint256[] memory _ballot_ids) private {
        for (uint256 i = 0; i < _ballot_ids.length; i++) {
            require(_ballot_ids[i] < ballot_papers.length, "Ballot not found.");
            ballot_papers[_ballot_ids[i]] = ballot_papers[ballot_papers.length - 1];
            ballot_papers.pop();
        }
        emit BallotsRemoved();
    }

    function update_ballot(BallotDetails[] memory _ballots) private {
        for (uint256 i = 0; i < _ballots.length; i++)  {
            uint256 index = _ballots[i].index;
            ballot_papers[index] = _ballots[i].ballot_paper;
        }
    }

    function update_voting(VotingDetails memory _details, BallotDetails[] memory _to_update, Utils2.BallotPaper[] memory _to_add, uint256[] memory _to_delete) external onlyAdmin {
        require(get_state() == VotingState.IN_PREPARATION, 'The voting has already started or has ended.');
        name = _details.name;
        description = _details.description;
        start_time = _details.start_time;
        end_time = _details.end_time;
        update_ballot(_to_update);
        add_ballots(_to_add);
        delete_ballots(_to_delete);
        emit VotingUpdated();
    }
    
   
     //TODO: Need to verify the signature and the zkp.
     
    function vote(Utils2.BallotWithIndex[] memory _ballots) external {
        require(get_state() == VotingState.LIVE, 'Vote has not started yet or has ended or has been canceled');
        uint256 length = _ballots.length;
        uint256 votesCount = votes.length;
        for (uint256 i = 0; i < length; i++) {
            uint8 ballotType = ballot_papers[_ballots[i].index].ballotType;
            //votes_per_voters[msg.sender].push(_ballots[i].ballot);
            //Utils2.Ballot[] memory currentBallots = _ballots[i].ballot;
            Utils2.Ballot[] memory _b;
            for (uint256 j = 0; j < _ballots[i].ballot.length; j++) {
                /*
                string memory sessionId = _ballots[i].ballot[j].sessionId;
                string memory cipherText = _ballots[i].ballot[j].cipherText;
                Utils2.Proof memory proof = Utils2.Proof(
                    _ballots[i].ballot[j].proof.p1,
                    _ballots[i].ballot[j].proof.p2,
                    _ballots[i].ballot[j].proof.p3
                    );
                Utils2.Signature memory signature = Utils2.Signature(
                    _ballots[i].ballot[j].signature.y0,
                    _ballots[i].ballot[j].signature.s,
                    _ballots[i].ballot[j].signature.c
                    );
                string memory groupId = _ballots[i].ballot[j].groupId;
                string memory token = _ballots[i].ballot[j].token;

                Utils2.Ballot memory ballot = Utils2.Ballot(
                    sessionId,
                    cipherText,
                    proof,
                    signature,
                    groupId,
                    token
                );
                _b[i] = ballot;
                
                finalVotes[i].push(Utils2.Ballot(
                    _ballots[i].ballot[j].sessionId,
                    _ballots[i].ballot[j].cipherText,
                    Utils2.Proof(
                    _ballots[i].ballot[j].proof.p1,
                    _ballots[i].ballot[j].proof.p2,
                    _ballots[i].ballot[j].proof.p3
                    ),
                    Utils2.Signature(
                    _ballots[i].ballot[j].signature.y0,
                    _ballots[i].ballot[j].signature.s,
                    _ballots[i].ballot[j].signature.c
                    ),
                    _ballots[i].ballot[j].groupId,
                    _ballots[i].ballot[j].token
                ));
                */
            }
            //Utils2.BallotWithIndex memory __b = Utils2.BallotWithIndex( _ballots[i].index, _b);
            //votes.push(Utils2.BallotWithIndex( _ballots[i].index, _b));
            /*
            if (ballotType == 1) {
                votes_per_ballot_paper_type1[i].push(_ballots[i].ballot[0]);
                //count_total_votes_per_ballot_paper[i] += 1;
            }
            else if (ballotType == 2) {
                for (uint256 j = 0; j < _ballots[i].ballot.length; j++ ) {
                    votes_per_ballot_paper_type2_per_candidates[i][j].push(_ballots[i].ballot[j]);
                }
            }
            */
            
        }
        emit VoteReceived();
    }


    function sendVote(Utils2.Ballot memory _b) external {
        votes_per_ballot_paper_type1[0].push(_b);
        emit VoteReceived();
    }

    function getVotes() external view returns(Utils2.BallotWithIndex[] memory _votes) {
        uint256 length = ballot_papers.length;
        for (uint256 i = 0; i < length; i++) {

        }
    }

    
    function get_votes() external view returns(Utils2.Ballot[][] memory) {
        uint256 length = ballot_papers.length;
        Utils2.Ballot[][] memory _ballots = new Utils2.Ballot[][](length);
        for (uint256 i = 0; i < length; i ++) {
            Utils2.Ballot[] memory inner_ballots = votes_per_ballot_paper_type1[i];
            uint256 length2 = inner_ballots.length;
            Utils2.Ballot[] memory _inner_ballots = new Utils2.Ballot[](length2);
            for (uint256 j = 0; j < length2; j++) {
                _inner_ballots[j] = inner_ballots[j];
            }
            _ballots[i] = _inner_ballots;
        }
        return _ballots;
    }

    function get_count_total_votes() external view returns(uint256[] memory) {
         uint256 length = ballot_papers.length;
         uint256[] memory counts = new uint256[](length);
         for (uint256 i = 0; i < length; i++) {
            counts[i] = count_total_votes_per_ballot_paper[i];
         }
         return counts;
    }

    function get_ballot_papers() public view returns(Utils2.BallotPaper[] memory) {
        uint256 length = ballot_papers.length;
        Utils2.BallotPaper[] memory _ballotPapers = new Utils2.BallotPaper[](length);
        for (uint256 i = 0; i < length; i++) {
            _ballotPapers[i] = ballot_papers[i];
        }
        return _ballotPapers;
    }

    function cancel_voting() external onlyAdmin {
        VotingState state = get_state();
        require(state == VotingState.IN_PREPARATION, 'The voting has already started or has already ended');
        canceled = true;
        emit VotingCanceled();
    }

   
    function get_state() public view returns(VotingState state) {
        if (canceled) {
            state = VotingState.CANCELED;
        }
        else if (start_time > block.timestamp && end_time > block.timestamp) {
            state = VotingState.IN_PREPARATION;
        }
        else if (start_time < block.timestamp && end_time > block.timestamp) {
            state = VotingState.LIVE;
        }
        else if (end_time < block.timestamp) {
            state = VotingState.COMPLETED;
        }
    }

    function get_ballots_length() external view returns(uint256 _length) {
        _length = ballot_papers.length;
    }

    function get_details() external view 
    returns(address _admin, string memory _name, string memory _description, VotingState _state, 
    uint256 _start_time, uint256 _end_time, uint256 _createdAt, bytes32 _voteID, Utils2.BallotPaper[] memory _ballot_papers) 
    {
        _admin = admin;
        _name = name;
        _description = description;
        _state = get_state();
        _start_time = start_time;
        _end_time = end_time;
        _createdAt = createdAt;
        _voteID = voteID;
        _ballot_papers = get_ballot_papers();

    }
}