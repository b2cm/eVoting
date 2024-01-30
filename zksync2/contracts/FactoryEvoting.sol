//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2; // Allow to return a struct and pass struct array as parameter.

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";

import './Evoting.sol';
import './Utils.sol';
import './interfaces/IFactoryEvoting.sol';

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

    function get_voteIDs() external view returns(string[] memory ) {
        string[] memory _voteIDs = new string[](voteIDs.length);
        for (uint256 i = 0; i < voteIDs.length; i++) {
            _voteIDs[i] = voteIDs[i];
        }
        return _voteIDs;
    }

    /**@dev Only an admin can call this function.
     */
     //TODO: Add param in documentation
    function new_voting(string memory _voteID, string memory _name, string memory _description, uint256 _start_time, uint256 _end_time, Utils.BallotPaper[] memory _ballot_papers) external onlyAdmins {
        Evoting evoting = new Evoting(
            _voteID,
            _name,
            _description,
            msg.sender,
            _start_time,
            _end_time,
            _ballot_papers
            );
        address addr = address(evoting);
        require(addr != address(0), 'Contract deployment fails.');
        votingsAddr[_voteID] = addr;
        voteIDs.push(_voteID);
        emit VotingCreated(addr);
    }

    function add_admin(address _admin) external onlyAdmins() {
        admins.add(_admin);
    }

    function is_admin(address _admin) external view returns(bool) {
        return admins.contains(_admin);
    }

    function get_admins() public view returns(address[] memory _admins) {
        _admins = admins.values();
    }

    function get_votings() external view returns (address[] memory) {
        address[] memory _votings = new address[](voteIDs.length);
        for (uint256 i = 0; i < voteIDs.length; i++) {
            _votings[i] = votingsAddr[voteIDs[i]];
        }
        return _votings;
    }


    function get_voting(string memory _id) external view returns (address) {
        return votingsAddr[_id];
    }

    function votings_length() external view returns (uint256) {
        return voteIDs.length;
    } 
}