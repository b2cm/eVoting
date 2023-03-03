//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2; // Allow to return a struct and pass struct array as parameter.

import '../Utils.sol';

interface IFactoryEvoting {
    
    /**@dev Only an admin can call this function.
     */
    function new_voting(address _mainAddr, address _l1Verifier, string memory _name, string memory _description, string memory _admin, uint256 _start_time, uint256 _end_time, Utils.BallotPaper[] memory _ballot_papers) external;

    function get_votings() external view returns (address[] memory);

    function get_voting(bytes32 _id) external view returns (address);

    function votings_length() external view returns (uint256);

    function add_admin(address _admin) external;

    function is_admin(address _admin) external view returns(bool);
}