"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy } from "lucide-react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/config";
import { ethers } from "ethers";
import { Progress } from "@/components/ui/progress";

export default function ResultsPage() {
  const params = useParams();
  const electionId = Number(params.id);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  const loadResults = async () => {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.abi, provider);

      const published = await contract.elections(electionId).then((e: any) => e.resultsPublished);
      if (!published) {
        setIsPublished(false);
        return;
      }

      const [names, parties, votes] = await contract.getElectionResults(electionId);
      const formatted = names.map((name: string, i: number) => ({
        name,
        party: parties[i],
        voteCount: Number(votes[i]),
      }));

      const total = formatted.reduce((sum, c) => sum + c.voteCount, 0);
      setTotalVotes(total);

      formatted.sort((a, b) => b.voteCount - a.voteCount);
      setCandidates(formatted);
      setIsPublished(true);
    } catch (err) {
      console.error("Error loading results:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [electionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!isPublished) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-yellow-700">
        <h1 className="text-2xl font-bold">⏳ Results Not Yet Published</h1>
        <p className="mt-2">Please check back after the admin publishes the election results.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-green-800">📊 Election Results</h1>

        <div className="text-center text-gray-700 font-semibold">
          🗳️ Total Votes Cast: {totalVotes.toLocaleString()}
        </div>

        {candidates.map((c, index) => {
          const percentage = totalVotes === 0 ? 0 : (c.voteCount / totalVotes) * 100;

          return (
            <Card
              key={index}
              className={`border ${
                index === 0 ? "border-yellow-500 bg-yellow-50" : "bg-gray-50"
              }`}
            >
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle className="text-xl">
                  {c.name}{" "}
                  {index === 0 && (
                    <Trophy className="inline w-5 h-5 text-yellow-500 ml-1" />
                  )}
                </CardTitle>
                <p className="text-sm text-gray-500">{c.party}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-semibold">
                  🗳️ {c.voteCount.toLocaleString()} votes ({percentage.toFixed(1)}%)
                </p>
                <Progress value={percentage} className="h-3 rounded bg-gray-200" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
