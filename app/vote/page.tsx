"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../../contracts/VotingSystem.json";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

const CONTRACT_ADDRESS = "0x265392de776245eAA3492944aBbad60D047E16cd"; // Replace with your deployed contract address

export default function VotingPage() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [account, setAccount] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("info");

  let contract;

  const connectToBlockchain = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
      return contract;
    } else {
      alert("Please install MetaMask to use this application");
    }
  };

  const loadElections = async () => {
    try {
      const contract = await connectToBlockchain();
      const count = await contract.electionCounter();
      const loadedElections = [];

      for (let i = 1; i <= count; i++) {
        const el = await contract.elections(i);
        if (el.isActive) {
          loadedElections.push({ id: el.id.toNumber(), title: el.title });
        }
      }
      setElections(loadedElections);
    } catch (error) {
      console.error("Failed to load elections:", error);
    }
  };

  const loadCandidates = async (electionId) => {
    try {
      const contract = await connectToBlockchain();
      const [ids, names, parties] = await contract.getElectionCandidates(electionId);
      const candidatesList = ids.map((id, i) => ({
        id: id.toNumber(),
        name: names[i],
        party: parties[i],
      }));
      setCandidates(candidatesList);
    } catch (error) {
      console.error("Failed to load candidates:", error);
    }
  };

  const checkIfVoted = async (electionId) => {
    const contract = await connectToBlockchain();
    const voted = await contract.hasVoterVoted(account, electionId);
    setHasVoted(voted);
  };

  const handleVote = async (candidateId) => {
    try {
      const contract = await connectToBlockchain();
      await contract.castVote(selectedElection.id, candidateId, nationalId);
      setMessage("✅ Vote cast successfully!");
      setStatus("success");
      setHasVoted(true);
    } catch (error) {
      console.error("Voting error:", error);
      setMessage("❌ Failed to cast vote.");
      setStatus("error");
    }
  };

  useEffect(() => {
    loadElections();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white mt-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">Voting System</h2>

      {!account && <p>Please connect MetaMask to vote.</p>}

      <div className="space-y-4">
        <div>
          <label className="block font-medium">Enter your National ID</label>
          <input
            type="text"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder="16-digit National ID"
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Select Election</label>
          <select
            className="border p-2 rounded w-full"
            onChange={(e) => {
              const election = elections.find((el) => el.id === parseInt(e.target.value));
              setSelectedElection(election);
              loadCandidates(election.id);
              checkIfVoted(election.id);
            }}
          >
            <option>Select an election</option>
            {elections.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        {selectedElection && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Candidates</h3>
            {hasVoted ? (
              <p className="text-green-600">You have already voted in this election.</p>
            ) : (
              <ul className="space-y-2">
                {candidates.map((c) => (
                  <li key={c.id} className="flex justify-between items-center border p-2 rounded">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-gray-600">{c.party}</p>
                    </div>
                    <Button onClick={() => handleVote(c.id)}>Vote</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {message && (
          <Alert className={`${status === "success" ? "border-green-500" : "border-red-500"}`}>
            {status === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
