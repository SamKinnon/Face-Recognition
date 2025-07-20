// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract VotingSystem {
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
        bool isActive;
    }
    
    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool resultsPublished;
    }
    
    struct Vote {
        uint256 electionId;
        uint256 candidateId;
        address voter;
        uint256 timestamp;
        bytes32 voteHash;
    }
    
    address public admin;
    uint256 public electionCounter;
    uint256 public candidateCounter;
    uint256 public voteCounter;
    
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => uint256) public electionCandidateCount;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(uint256 => Vote) public votes;
    mapping(string => address) public voterAddresses; // nationalId => address
    
    event ElectionCreated(uint256 indexed electionId, string title);
    event CandidateRegistered(uint256 indexed electionId, uint256 indexed candidateId, string name);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter);
    event ElectionStarted(uint256 indexed electionId);
    event ElectionEnded(uint256 indexed electionId);
    event ResultsPublished(uint256 indexed electionId);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier electionExists(uint256 _electionId) {
        require(_electionId <= electionCounter && _electionId > 0, "Election does not exist");
        _;
    }
    
    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        electionCounter = 0;
        candidateCounter = 0;
        voteCounter = 0;
    }
    
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) public onlyAdmin {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_endTime > block.timestamp, "End time must be in the future");
        
        electionCounter++;
        elections[electionCounter] = Election({
            id: electionCounter,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            isActive: false,
            resultsPublished: false
        });
        
        emit ElectionCreated(electionCounter, _title);
    }
    
    function registerCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _party
    ) public onlyAdmin electionExists(_electionId) {
        require(!elections[_electionId].isActive, "Cannot add candidates to active election");
        
        candidateCounter++;
        electionCandidateCount[_electionId]++;
        
        candidates[_electionId][electionCandidateCount[_electionId]] = Candidate({
            id: candidateCounter,
            name: _name,
            party: _party,
            voteCount: 0,
            isActive: true
        });
        
        emit CandidateRegistered(_electionId, candidateCounter, _name);
    }
    
    function startElection(uint256 _electionId) public onlyAdmin electionExists(_electionId) {
        require(!elections[_electionId].isActive, "Election is already active");
        require(electionCandidateCount[_electionId] > 0, "No candidates registered");
        
        elections[_electionId].isActive = true;
        emit ElectionStarted(_electionId);
    }
    
    function endElection(uint256 _electionId) public onlyAdmin electionExists(_electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        
        elections[_electionId].isActive = false;
        emit ElectionEnded(_electionId);
    }
    
    function registerVoter(string memory _nationalId, address _voterAddress) public onlyAdmin {
        voterAddresses[_nationalId] = _voterAddress;
    }
    
    function castVote(
        uint256 _electionId,
        uint256 _candidateId,
        string memory _nationalId
    ) public electionExists(_electionId) electionActive(_electionId) {
        require(voterAddresses[_nationalId] == msg.sender, "Voter not registered or invalid address");
        require(!hasVoted[msg.sender][_electionId], "Voter has already voted in this election");
        require(_candidateId <= electionCandidateCount[_electionId] && _candidateId > 0, "Invalid candidate");
        require(candidates[_electionId][_candidateId].isActive, "Candidate is not active");
        
        // Mark voter as having voted
        hasVoted[msg.sender][_electionId] = true;
        
        // Increment candidate vote count
        candidates[_electionId][_candidateId].voteCount++;
        
        // Create vote record
        voteCounter++;
        bytes32 voteHash = keccak256(abi.encodePacked(_electionId, _candidateId, msg.sender, block.timestamp));
        
        votes[voteCounter] = Vote({
            electionId: _electionId,
            candidateId: _candidateId,
            voter: msg.sender,
            timestamp: block.timestamp,
            voteHash: voteHash
        });
        
        emit VoteCast(_electionId, _candidateId, msg.sender);
    }
    
    function publishResults(uint256 _electionId) public onlyAdmin electionExists(_electionId) {
        require(!elections[_electionId].isActive, "Election must be ended first");
        require(!elections[_electionId].resultsPublished, "Results already published");
        
        elections[_electionId].resultsPublished = true;
        emit ResultsPublished(_electionId);
    }
    
    function getElectionResults(uint256 _electionId) public view electionExists(_electionId) returns (
        string[] memory candidateNames,
        string[] memory candidateParties,
        uint256[] memory voteCounts
    ) {
        require(elections[_electionId].resultsPublished, "Results not yet published");
        
        uint256 candidateCount = electionCandidateCount[_electionId];
        candidateNames = new string[](candidateCount);
        candidateParties = new string[](candidateCount);
        voteCounts = new uint256[](candidateCount);
        
        for (uint256 i = 1; i <= candidateCount; i++) {
            candidateNames[i-1] = candidates[_electionId][i].name;
            candidateParties[i-1] = candidates[_electionId][i].party;
            voteCounts[i-1] = candidates[_electionId][i].voteCount;
        }
    }
    
    function getElectionCandidates(uint256 _electionId) public view electionExists(_electionId) returns (
        uint256[] memory candidateIds,
        string[] memory candidateNames,
        string[] memory candidateParties
    ) {
        uint256 candidateCount = electionCandidateCount[_electionId];
        candidateIds = new uint256[](candidateCount);
        candidateNames = new string[](candidateCount);
        candidateParties = new string[](candidateCount);
        
        for (uint256 i = 1; i <= candidateCount; i++) {
            candidateIds[i-1] = candidates[_electionId][i].id;
            candidateNames[i-1] = candidates[_electionId][i].name;
            candidateParties[i-1] = candidates[_electionId][i].party;
        }
    }
    
    function hasVoterVoted(address _voter, uint256 _electionId) public view returns (bool) {
        return hasVoted[_voter][_electionId];
    }
    
    function getTotalVotes(uint256 _electionId) public view electionExists(_electionId) returns (uint256) {
        uint256 totalVotes = 0;
        uint256 candidateCount = electionCandidateCount[_electionId];
        
        for (uint256 i = 1; i <= candidateCount; i++) {
            totalVotes += candidates[_electionId][i].voteCount;
        }
        
        return totalVotes;
    }
}