//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Register {
    address[] private eligibleVoters;
    bytes[] private votersHashedIDs;
    bytes[] private lrs;
    string[] private hashedIDs;
    mapping(bytes => bytes) private lrsPublicKeys; // hashedID => lrsPublicKey (Linkable Ring Signature pk)
    uint256 private registrationStart;
    uint256 private registrationEnd;
    address public admin;
    string public sessionID;

    event HashedIDStored();
    event VoterAdded();
    event LRSPKStored();
    event RegistrationPeriodSet();
    event SessionIDSet();

    modifier onlyAdmin () {
        require(msg.sender == admin, 'Not the admin');

        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function setSessionID(string memory _id) external {
        sessionID = _id;
        emit SessionIDSet();
    }

    function setRegistrationPeriod(uint256 _start, uint256 _end) external onlyAdmin {
        require(_start < _end, 'The registration cannot end before it even starts');
        require(_start >= block.timestamp && _end > block.timestamp, 'The registration can not take place in the past.');

        registrationStart = _start;
        registrationEnd = _end;

        emit RegistrationPeriodSet();
    }

    function isRegistrationOpen() public view returns (bool isOpen) {
        isOpen = (registrationEnd > block.timestamp && registrationStart < block.timestamp);
    }


    function getHashedIDs() external view returns (bytes[] memory _hashedIDs) {
        uint256 length = votersHashedIDs.length;
        _hashedIDs = new bytes[](length);
        for (uint256 i = 0; i < length; i++) {
            _hashedIDs[i] = votersHashedIDs[i];
        }
    }

    function storeVoterData(bytes memory _hashedID, bytes memory _publicKey) external {
        require(isRegistrationOpen(), 'Registration has not started yet or has already ended');
        votersHashedIDs.push(_hashedID);
        lrsPublicKeys[_hashedID] = _publicKey;
        lrs.push(_publicKey);
        emit HashedIDStored();
        emit LRSPKStored();
    }

    function addEligibleVoter(address _voter) external {
        eligibleVoters.push(_voter);
        emit VoterAdded();
    }

    function getLRSGroup() external view returns(bytes[] memory _lrs) {
        _lrs = new bytes[](lrs.length);
        for (uint256 i = 0; i < lrs.length; i++) {
            _lrs[i] = lrs[i];
        }
    }
}