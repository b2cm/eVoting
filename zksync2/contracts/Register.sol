//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Register {
    address[] private eligibleVoters;
    address[] public voters;
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

    struct VoterData {
        bytes pubKey;
        bytes hashedId;
    }

    VoterData[] public voterData;

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

    // This function is yet not secure because it can be called by anyone.
    // This function should be called just by the verifier contranct (proof of correct membership) deployed on L1.
    function addVoter(address _voter) external {
        voters.push(_voter);
        emit VoterAdded();
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


    function getHashedIDs() external view returns (bytes[] memory) {
       return votersHashedIDs;
    }

    function storeVoterData(bytes memory _hashedID, bytes memory _publicKey) external {
        //require(isRegistrationOpen(), 'Registration has not started yet or has already ended');
        votersHashedIDs.push(_hashedID);
        lrsPublicKeys[_hashedID] = _publicKey;
        lrs.push(_publicKey);
        VoterData memory data = VoterData(_publicKey, _hashedID);
        voterData.push(data);
        emit HashedIDStored();
        emit LRSPKStored();
    }

    function getVoterData() public view returns(VoterData[] memory ) {
        return voterData;
    }


    function getLRSGroup() external view returns(bytes[] memory _lrs) {
        _lrs = new bytes[](lrs.length);
        for (uint256 i = 0; i < lrs.length; i++) {
            _lrs[i] = lrs[i];
        }
    }

    function addEligibleVoter(address _voter) external {
        eligibleVoters.push(_voter);
        emit VoterAdded();
    }


}