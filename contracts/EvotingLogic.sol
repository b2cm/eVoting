// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";


contract EvotingLogic is Initializable{

    string private _description;
    address private _administrator1;
    address private _administrator2;
    address private _administrator3;
    address private _administrator4;
    address private _administrator5;
    // Store the administrator parameters
    mapping(address => bytes32) private parameters;

    event ParametersCommited(address admin, bool success);
    event ParametersUpdated(address admin, bool success);
    event InitContract(string desc, address admin1, address admin2, address admin3, address admin4, address admin5);

    /// @dev Restrict a function to only be called by an administrator
    /// @param _caller The adminstrator address
    modifier onlyAdministrator(address _caller) {
        require(_caller == _administrator1 || _caller == _administrator2 || 
        _caller == _administrator3 || _caller == _administrator4 || 
        _caller == _administrator5, "You're not an administrator !");

        _;
    }

    /// @dev Init the contract, can only call once
    /// @param _desc The voting description
    /// @param _admin1 The first administrator
    /// @param _admin2 The second administrator
    /// @param _admin3 The third administrator
    /// @param _admin4 The fourth administrator
    /// @param _admin5 The fifth administrator   
    function init(string calldata _desc, address _admin1, address _admin2, address _admin3, address _admin4, address _admin5) initializer external{
        _description = _desc;
        _administrator1 = _admin1;
        _administrator2 = _admin2;
        _administrator3 = _admin3;
        _administrator4 = _admin4;
        _administrator5 = _admin5;
        emit InitContract(_description, _administrator1, _administrator2, _administrator3, _administrator4, _administrator5);
    } 
    
    /// @dev Hash and store the parameters, can only be called by administrator
    /// @param _gg The gg parameter
    /// @param _pp The pp parameter
    /// @param _vk The vk parameter
    function commitParameters(uint256 _gg, uint256 _pp, uint256 _vk) external onlyAdministrator(msg.sender){
        require(parameters[msg.sender] == bytes32(0), "You have already committed parameters");
        parameters[msg.sender] = keccak256(abi.encodePacked(_gg, _pp, _vk));
        emit ParametersCommited(msg.sender, true);
    }

    /// @dev Hash and update the parameters, can only be called by administrator
    /// @param _gg The gg parameter
    /// @param _pp The pp parameter
    /// @param _vk The vk parameter
    function updateParameters(uint256 _gg, uint256 _pp, uint256 _vk) external onlyAdministrator(msg.sender) { 
        require(parameters[msg.sender] != bytes32(0), "You need to first committ parameters");
        parameters[msg.sender] = keccak256(abi.encodePacked(_gg, _pp, _vk));
        emit ParametersUpdated(msg.sender, true);
    }

    /// @dev Retrieve the stored parameters
    /// @param _admin The administrator address 
    /// @return value The stored parameters
    function getHashedParameters(address _admin) external view returns(bytes32 value){
        value = parameters[_admin];
    }

    /// @dev Retrieve the voting description
    /// @return description The description
    function getDescription() external view returns(string memory description){
        description = _description;
    }

   
}


