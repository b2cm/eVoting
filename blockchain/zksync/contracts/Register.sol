//SPDX-License-Identifier: GPL
pragma solidity ^0.8.0;

import './Utils.sol';

// This contract handles the registration of new voters
contract Register {
    uint256 private registrationStart;
    uint256 private registrationEnd;
    address public admin;
    Utils.VoterData[] public voterData;

    event RegistrationPeriodSet();
    event RegistrationSuccessful();

    modifier onlyAdmin () {
        require(msg.sender == admin, 'Not the admin');

        _;
    }


    constructor() {
        admin = msg.sender;
    }

    /**@notice Set the registration period
    *@param _start The unix time representing the start of the registration
     *@param _end The unix time representing the end of the registration
    */
    function setRegistrationPeriod(uint256 _start, uint256 _end) external onlyAdmin {
        require(_start < _end, 'The registration cannot end before it even starts');
        require(_start >= block.timestamp && _end > block.timestamp, 'The registration can not take place in the past.');
        registrationStart = _start;
        registrationEnd = _end;
        emit RegistrationPeriodSet();
    }

    /**@notice register a new voter
    *@param _hashedID The hashed voter's id
    *@param _publicKey The LRS public key of the voter. LRS = Linkable Ring Signature
    */
    function register(bytes memory _hashedID, bytes memory _publicKey) external {
        require(isRegistrationOpen(), 'Registration has not started yet or has already ended');
        voterData.push(Utils.VoterData(_publicKey, _hashedID));
        emit RegistrationSuccessful();
    }

    /**@notice Check if the registration is still open
    */
    function isRegistrationOpen() public view returns (bool isOpen) {
        isOpen = (registrationEnd > block.timestamp && registrationStart < block.timestamp);
    }

    /**@notice Get all the hashed ids
    */
    function getHashedIDs() external view returns (bytes[] memory _hashedIDs) {
        uint256 length = voterData.length;
        _hashedIDs = new bytes[](length);
        for (uint256 i = 0; i < length; i++) {
            _hashedIDs[i] = voterData[i].hashedId;
        }
    }

    /**@notice Get the voters data
    */
    function getVoterData() public view returns(Utils.VoterData[] memory ) {
        return voterData;
    }

}