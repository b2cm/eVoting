// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./EvotingLogic.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";



contract EvotingFactory {

    //address[] public evotingClones;
    event ProxyCreated(address proxy);

    /// @dev Create a minimal proxy of a deployed contract 
    /// @param _implementation The address of the deployed contract
    /// @return The proxy address
    function createClone(address _implementation) public returns (address) {
        address proxy = Clones.clone(_implementation);
       // evotingClones.push(proxy);
        emit ProxyCreated(proxy);
        return proxy;
    }
    

}