"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config";
import { Loader2 } from "lucide-react";

export default function ElectionVotePage() {
  const { id } = useParams();
  const router = useRouter();

  const [election, setElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  const fetchElection = async () => {
    try {
      const res = await fetch(`/api/admin/elections/${id}`);
      const data = await res.json();
      setElection(data);
    } catch (err) {
      console.error("❌ Failed to fetch election", err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfVoted = async () => {
    const res = await fetch("/api/has-voted");
    const data = await res.json();
    setHasVoted(data?.hasVoted);
  };

  useEffect(() => {
    if (id) {
      fetchElection();
      checkIfVoted();
    }
  }, [id]);

  const vote = async (candidateId: number) => {
    if (!window.ethereum) return alert("Please install MetaMask");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.abi, signer);

      const tx = await contract.vote(parseInt(id as string), candidateId);
      await tx.wait();

      // Save vote off-chain
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          electionId: parseInt(id as string),
          candidateId,
        }),
      });

      if (!res.ok) throw new Error("❌ Failed to store vote off-chain");

      alert("✅ Vote successfully recorded!");
      setHasVoted(true);
      router.push("/vote");
    } catch (err: any) {
      alert("❌ " + (err.message || "Voting failed"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        Election not found.
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-green-700">
        <h1 className="text-2xl font-bold">🗳️ Thank you for voting!</h1>
        <p className="mt-2">You can only vote once.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{election.title}</CardTitle>
            <p className="text-sm text-gray-500">
              {new Date(election.startDate).toLocaleDateString()} -{" "}
              {new Date(election.endDate).toLocaleDateString()}
            </p>
          </CardHeader>
        </Card>

        <CardContent className="grid gap-6 sm:grid-cols-2">
          {election.candidates.map((candidate: any) => (
            <Card key={candidate.id} className="border p-4 shadow-sm">
              <h3 className="font-semibold">{candidate.fullName}</h3>
              <p className="text-sm text-gray-500">{candidate.party}</p>
              {candidate.photoUrl && (
                <img
                  src={candidate.photoUrl}
                  alt={candidate.fullName}
                  className="mt-2 w-full h-40 object-cover rounded"
                />
              )}
              <Button
                onClick={() => vote(candidate.id)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white w-full"
              >
                Vote
              </Button>
            </Card>
          ))}
        </CardContent>
      </div>
    </div>
  );
}
