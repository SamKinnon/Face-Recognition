// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Election.sol";

/**
 * @title ElectionFactory
 * @dev The central administrative contract for creating elections and managing voters.
 * The administrator of the voting system owns this contract.
 */
contract ElectionFactory is Ownable {
    // --- State Variables ---

    address[] public deployedElections;
    mapping(address => bool) public registeredVoters;

    // --- Events ---

    event ElectionCreated(address indexed electionAddress, string name, address indexed createdBy);
    event VoterRegistered(address indexed voterAddress);
    event VoterRemoved(address indexed voterAddress);

    // --- Constructor ---
    
    constructor(address _initialOwner) Ownable(_initialOwner) {}

    // --- Admin Functions ---

    /**
     * @dev Registers a new voter's address, making them eligible to vote.
     * Can only be called by the owner.
     * @param _voterAddress The Ethereum address of the voter to register.
     */
    function registerVoter(address _voterAddress) external onlyOwner {
        require(_voterAddress != address(0), "Cannot register the zero address.");
        registeredVoters[_voterAddress] = true;
        emit VoterRegistered(_voterAddress);
    }

    /**
     * @dev Removes a voter's address from the registration list.
     * Can only be called by the owner.
     * @param _voterAddress The Ethereum address of the voter to remove.
     */
    function removeVoter(address _voterAddress) external onlyOwner {
        registeredVoters[_voterAddress] = false;
        emit VoterRemoved(_voterAddress);
    }

    /**
     * @dev Creates and deploys a new Election contract.
     * The new Election contract will be owned by this factory.
     * @param _name The name for the new election (e.g., "Parliamentary Election 2026").
     */
    function createElection(string memory _name) external onlyOwner {
        // Create a new Election contract, setting this factory as its owner
        Election newElection = new Election(address(this), _name);
        
        // Store the address of the newly created election
        deployedElections.push(address(newElection));
        
        emit ElectionCreated(address(newElection), _name, msg.sender);
    }

    // --- Public/View Functions ---

    /**
     * @dev Checks if a given address is a registered voter.
     * @param _voterAddress The address to check.
     * @return A boolean indicating registration status.
     */
    function isVoterRegistered(address _voterAddress) external view returns (bool) {
        return registeredVoters[_voterAddress];
    }
    
    /**
     * @dev Retrieves a list of all election addresses created by this factory.
     * @return An array of addresses for all deployed Election contracts.
     */
    function getDeployedElections() external view returns (address[] memory) {
        return deployedElections;
    }
}