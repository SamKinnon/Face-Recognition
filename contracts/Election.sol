// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Election
 * @dev Manages a single election, its candidates, and the voting process.
 * This contract is owned by the ElectionFactory that deploys it.
 */
contract Election is Ownable {
    // --- Structs ---

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // --- State Variables ---

    string public electionName;
    uint public candidatesCount;

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public hasVoted; // Tracks if a voter has already voted in this specific election

    // --- Events ---

    event CandidateAdded(uint indexed candidateId, string name);
    event Voted(address indexed voter, uint indexed candidateId);

    // --- Constructor ---

    /**
     * @dev Sets the initial owner and the name of the election.
     * @param _initialOwner The address of the contract or person creating the election (ElectionFactory).
     * @param _name The official name of the election (e.g., "Presidential Election 2025").
     */
    constructor(address _initialOwner, string memory _name) Ownable(_initialOwner) {
        electionName = _name;
    }

    // --- Functions ---

    /**
     * @dev Adds a new candidate to the election.
     * Can only be called by the owner (ElectionFactory).
     * @param _name The name of the candidate.
     */
    function addCandidate(string memory _name) external onlyOwner {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    /**
     * @dev Allows a voter to cast their vote for a specific candidate.
     * @param _candidateId The ID of the candidate to vote for.
     * @param _isRegisteredVoter A boolean passed by the factory contract to confirm the voter's registration.
     */
    function vote(uint _candidateId, bool _isRegisteredVoter) external {
        // --- Validation Checks ---
        require(_isRegisteredVoter, "Voter is not registered.");
        require(!hasVoted[msg.sender], "You have already cast your vote.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        // --- Record the Vote ---
        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit Voted(msg.sender, _candidateId);
    }

    /**
     * @dev Retrieves the list of all candidates and their current vote counts.
     * @return An array of Candidate structs.
     */
    function getCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidatesCount);
        for (uint i = 0; i < candidatesCount; i++) {
            allCandidates[i] = candidates[i + 1];
        }
        return allCandidates;
    }
}