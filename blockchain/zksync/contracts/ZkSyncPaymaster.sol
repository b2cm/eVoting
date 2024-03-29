//SPDX-License-Identifier: GPL
pragma solidity ^0.8.0;

import { IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC } from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol';
import { IPaymasterFlow } from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol';
import { TransactionHelper, Transaction } from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";

import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';



contract ZkSyncPaymaster is IPaymaster {

    modifier onlyBootloader() {
        require(msg.sender == BOOTLOADER_FORMAL_ADDRESS, 'Only bootloader can call this method');

        _;
    }
    
    function validateAndPayForPaymasterTransaction(
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) external payable override onlyBootloader returns (bytes4 magic, bytes memory context){
        // By default we consider the transaction as accepted.
        magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;

        // Transaction validation logic goes here
        require(_transaction.paymasterInput.length >= 4, 'The standard paymaster input must be at least 4 bytes long');

        bytes4 paymasterInputSelector = bytes4(_transaction.paymasterInput[0:4]);
        if (paymasterInputSelector == IPaymasterFlow.general.selector) {
            
            uint256 requireETH = _transaction.gasLimit * _transaction.maxFeePerGas;
            //The Bootloader never returns any data, so it can safetly be ignored.
            (bool success, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{value: requireETH}("");
            require(success, 'Failed to transfer funds to the bootloader');
            //context = '';
        } else {
            revert('Unsupported paymaster flow');
        }
    }

    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable override onlyBootloader {
        // This contract does not support any refunding logic
    }

    


    receive() external payable {}
}