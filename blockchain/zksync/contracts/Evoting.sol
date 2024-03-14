//SPDX-License-Identifier: GPL
pragma solidity ^0.8.0;

import './Utils.sol';


contract Evoting {
    string public voteID; // The session Id
    string public name;
    string public description;
    address public admin;
    uint256 public start_time;
    uint256 public end_time;
    uint256 public createdAt;
    bool public canceled;
    
    Utils.BallotPaper[] public ballot_papers;
    Utils.Vote[] public votes;
    mapping(uint256 => bool) public is_valid_ballot; // Check if ballot was not deleted(false).

    enum VotingState {
        IN_PREPARATION,
        LIVE,
        COMPLETED,
        CANCELED
    }

    event VoterAdded(bool);
    event VotingOpened();
    event VotingClosed();
    event BallotsAdded();
    event BallotsRemoved();
    event VotingCanceled();
    event VoteReceived();
    event VotingUpdated();

    modifier onlyAdmin() {
        require(msg.sender == admin, 'You are not an Admin.');

        _;
    }


    constructor(string memory _voteID, string memory _name, string memory _description, address _admin, uint256 _start_time, uint256 _end_time, Utils.BallotPaper[] memory _ballot_papers) {
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
    function add_ballots(Utils.BallotPaper[] memory _ballot_papers) private  {
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

    /**@dev only admin can update ballot papers
    *@param _details the vote information to update
    *@param _to_update the ballots that need to be modify
    *@param _to_add the new ballots to add
    *@param _to_delete the ballots to delete
    */
    function update_voting(Utils.VotingDetails memory _details, Utils.BallotDetails[] memory _to_update, Utils.BallotPaper[] memory _to_add, uint256[] memory _to_delete) external onlyAdmin {
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

    function update_ballot(Utils.BallotDetails[] memory _ballots) internal {
        for (uint256 i = 0; i < _ballots.length; i++)  {
            uint256 index = _ballots[i].index;
            ballot_papers[index] = _ballots[i].ballot_paper;
        }
    }

    /**@notice This function can only be called if the vote has'nt yet started yet.
    */
    function cancel_voting() external onlyAdmin {
        VotingState state = get_state();
        require(state == VotingState.IN_PREPARATION, 'The voting has already started or has already ended');
        canceled = true;
        emit VotingCanceled();
    }

    /**@dev Only those eligible to vote can access this function after successful login.
    *@param _vote the vote.
    */ 
    function vote(Utils.Vote memory _vote) external {
        require(!canceled, 'The vote was canceled');
        Utils.Token[] memory token;
        for (uint8 i; i < _vote.token.length; i++) {
            token[i] = (Utils.Token(
                _vote.token[i].vid,
                _vote.token[i].partyId,
                _vote.token[i].counter
            ));

        }
        Utils.Vote memory v = Utils.Vote(
            _vote.sessionId,
            _vote.cipherText,
            Utils.Proof(
                _vote.proof.p1,
                _vote.proof.p2,
                _vote.proof.p3
            ),
            Utils.Signature(
                _vote.signature.y0,
                _vote.signature.s,
                _vote.signature.c
            ),
            _vote.groupId,
            token
        );

        votes.push(v);
        emit VoteReceived();
    }

    /**@notice Get vote informations and the ballot papers. 
    */
    function get_details() external view 
    returns(address _admin, string memory _name, string memory _description, VotingState _state, 
    uint256 _start_time, uint256 _end_time, uint256 _createdAt, string memory _voteID, Utils.BallotPaper[] memory _ballot_papers) 
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

    /**@notice Get the ballot papers
    */
    function get_ballot_papers() public view returns(Utils.BallotPaper[] memory) {
        uint256 length = ballot_papers.length;
        Utils.BallotPaper[] memory _ballotPapers = new Utils.BallotPaper[](length);
        for (uint256 i = 0; i < length; i++) {
            _ballotPapers[i] = ballot_papers[i];
        }
        return _ballotPapers;
    }

    /**@notice get the vote state.
    */
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

    /**@notice Get the votes
    */
    function get_votes() external view returns(Utils.Vote[] memory) {
        return votes;
    }

  
}