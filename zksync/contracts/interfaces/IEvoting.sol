//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './IFactoryEvoting.sol';


interface IEvoting {
  

    /**@dev This method can only be called by the verifier contract.
     *@param _voter address of the authenticated voter. 
     */
    function add_voter(address _voter) external;


    /**@dev Only admin can add ballot papers.
    *@param _ballot_papers an array containing the ballot papers.
     */
    function add_ballots(Utils.BallotPaper[] memory _ballot_papers) external;

    /**@dev Only admin can delete ballot papers.
    *@notice This method results in an unordered array.
    *@param _ballot_id id of the ballot paper to remove.
     */
    function delete_ballot(uint256 _ballot_id) external;

    /**@dev Only eligible voters can call this function.
    *@param _votes an array containing the ballots.
     */
    function vote(Utils.Vote[] memory _votes) external returns(bool success);

    function get_voters() external view returns(address[] memory);

    function get_votes() external view returns(Utils.Vote[][] memory);

    function get_count_total_votes() external view returns(uint256[] memory);

}