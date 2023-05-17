// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@opengsn/contracts/src/forwarder/IForwarder.sol";
import '@opengsn/contracts/src/BasePaymaster.sol';
import '@opengsn/contracts/src/utils/GsnTypes.sol';

contract Paymaster is BasePaymaster {
    address public ourTarget;

    event TargetSet(address target);

    // The contract we are willing to pay gas for.
    function setTarget(address target) external onlyOwner {
        ourTarget = target;
        emit TargetSet(target);
    }

    function versionPaymaster() external view override virtual returns (string memory){
        return "3.0.0-beta.3+opengsn.test-pea.ipaymaster";
    }

    function deposit() public payable {
        require(address(relayHub) != address(0), "relay hub address not set");
        relayHub.depositFor{value:msg.value}(address(this));
    }

    function _preRelayedCall(
        GsnTypes.RelayRequest calldata relayRequest,
        bytes calldata signature,
        bytes calldata approvalData,
        uint256 maxPossibleGas
    ) internal view override returns (bytes memory context, bool rejectOnRecipientRevert) {
        (relayRequest, signature);
        (approvalData, maxPossibleGas);
        return ("no revert here",false);
    }
        
    function _postRelayedCall(
        bytes calldata context,
        bool success,
        uint256 gasUseWithoutPost,
        GsnTypes.RelayData calldata relayData
    ) internal view override{
        (context, success, gasUseWithoutPost, relayData);
    }

    function withdrawAll(address payable destination) public {
        uint256 amount = relayHub.balanceOf(address(this));
        withdrawRelayHubDepositTo(amount, destination);
    }
}