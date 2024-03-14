// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// UpkeepIDConsumerExample.sol imports functions from both ./AutomationRegistryInterface1_2.sol and
// ./interfaces/LinkTokenInterface.sol

import {AutomationRegistryInterface, State, Config} from "@chainlink/contracts/src/v0.8/interfaces/AutomationRegistryInterface1_2.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

interface KeeperRegistrarInterface {
    function register(
        string memory name,
        bytes calldata encryptedEmail,
        address upkeepContract,
        uint32 gasLimit,
        address adminAddress,
        bytes calldata checkData,
        uint96 amount,
        uint8 source,
        address sender
    ) external;
}

contract RegisterUpkeeper {
    LinkTokenInterface public immutable i_link;
    address public registrar;
    AutomationRegistryInterface public i_registry;
    bytes4 registerSig = KeeperRegistrarInterface.register.selector;

    event UpkeeperID(uint256 upkeepID);

    constructor(
        LinkTokenInterface _link,
        address _registrar,
        AutomationRegistryInterface _registry
    ) {
        i_link = _link;
        registrar = _registrar;
        i_registry = _registry;
    }

    function registerAndPredictID(
        string memory name,
        bytes calldata encryptedEmail,
        address upkeepContract,
        uint32 gasLimit,
        address adminAddress,
        bytes calldata checkData,
        uint96 amount,
        uint8 source
    ) external {
        (State memory state, Config memory _c, address[] memory _k) = i_registry.getState();
        uint256 oldNonce = state.nonce;
        bytes memory payload = abi.encode(
            name,
            encryptedEmail,
            upkeepContract,
            gasLimit,
            adminAddress,
            checkData,
            amount,
            source,
            address(this)
        );
/*
        i_link.transferAndCall(
            registrar,
            amount,
            bytes.concat(registerSig, payload)
        );
        */
        (state, _c, _k) = i_registry.getState();
        uint256 newNonce = state.nonce;
        if (newNonce == oldNonce + 1) {
            uint256 upkeepID = uint256(
                keccak256(
                    abi.encodePacked(
                        blockhash(block.number - 1),
                        address(i_registry),
                        uint32(oldNonce)
                    )
                )
            );
            emit UpkeeperID(upkeepID);
            // DEV - Use the upkeepID however you see fit
            // link = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB, 
            // registar = 0x9806cf6fBc89aBF286e8140C42174B94836e36F2, 0x29BA782aC65C22a43F6Fe358aF077aA906cD6c86
            // registry = 0x02777053d6764996e594c3E88AF1D58D5363a2e6
            // random = 0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d
            //0x326C977E6efc84E512bB9C30f76E30c160eD06FB, 0x9806cf6fBc89aBF286e8140C42174B94836e36F2, 0x02777053d6764996e594c3E88AF1D58D5363a2e6
            // 0xc146544959e126B19987033F8E12e08118C512AC
        } else {
            revert("auto-approve disabled");
        }
    }

    function set_registrar(address _registrar) external {
        registrar = _registrar;
    }

    function set_registry(AutomationRegistryInterface _registry) external {
        i_registry = _registry;
    }
}