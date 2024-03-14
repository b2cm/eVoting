//SPDX-License-Identifier: GPL
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";
import './Evoting.sol';
import './Utils.sol';

// This contract manages the creation of new votes
contract FactoryEvoting {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private admins;
    mapping(string => address) private votingsAddr; // mapping voteID => contract address
    string[] private voteIDs;

    event VotingCreated(address contractAddr);

    constructor() {
        admins.add(msg.sender);
    }

    modifier onlyAdmins() {
        require(admins.contains(msg.sender), 'You are not an admin.');

        _;
    }

    /**@notice This function can only be called by admin.
    *@param _voteID a string representing the voteID
    *@param _name a string representing the vote's name
    *@param _description the vote's description
    *@param _startTime the start time 
    *@param _endTime the end time
    *@param _ballotPapers an array of ballot papers
    */
    function new_voting(string memory _voteID, string memory _name, string memory _description, uint256 _startTime, uint256 _endTime, Utils.BallotPaper[] memory _ballotPapers) external onlyAdmins {
        Evoting evoting = new Evoting(
            _voteID,
            _name,
            _description,
            msg.sender,
            _startTime,
            _endTime,
            _ballotPapers
            );
        address addr = address(evoting);
        require(addr != address(0), 'Contract deployment fails.');
        votingsAddr[_voteID] = addr;
        voteIDs.push(_voteID);
        emit VotingCreated(addr);
    }

    /**@notice Add a new administrator
    *@param _admin the new admin
    */
    function add_admin(address _admin) external onlyAdmins() {
        admins.add(_admin);
    }

    /**@notice Check if the passed address is an admin
    *@param _admin the address to check
     */
    function is_admin(address _admin) external view returns(bool) {
        return admins.contains(_admin);
    }

    /**@notice Get all the admins
    */
    function get_admins() public view returns(address[] memory _admins) {
        _admins = admins.values();
    }

    /**@notice Get all the votes
    */
    function get_votings() external view returns (address[] memory) {
        address[] memory _votings = new address[](voteIDs.length);
        for (uint256 i = 0; i < voteIDs.length; i++) {
            _votings[i] = votingsAddr[voteIDs[i]];
        }
        return _votings;
    }

    /**@notice Get all the vote ids
    */
    function get_voteIDs() external view returns(string[] memory ) {
        string[] memory _voteIDs = new string[](voteIDs.length);
        for (uint256 i = 0; i < voteIDs.length; i++) {
            _voteIDs[i] = voteIDs[i];
        }
        return _voteIDs;
    }

    /**@notice Get vote's address by id
    */
    function get_voting(string memory _id) external view returns (address) {
        return votingsAddr[_id];
    }

    /**@notice Get the number of votes
    */
    function votings_length() external view returns (uint256) {
        return voteIDs.length;
    } 
}