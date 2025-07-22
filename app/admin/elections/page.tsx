"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Election {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  type: string;
}

export default function AdminElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  const loadElections = async () => {
    try {
      const res = await fetch("/api/admin/elections");
      const data = await res.json();
      setElections(data);
    } catch (err) {
      console.error("Error fetching elections:", err);
    } finally {
      setLoading(false);
    }
  };

  const publishResults = async (electionId: number) => {
    try {
      const res = await fetch(`/api/admin/elections/${electionId}/publish`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to publish results");
      alert("✅ Results published!");
      loadElections(); // Refresh
    } catch (err) {
      console.error(err);
      alert("❌ Could not publish results");
    }
  };

  useEffect(() => {
    loadElections();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Elections Dashboard</h1>
          <Link href="/admin/elections/add">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">➕ Add Election</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {elections.length === 0 ? (
              <p className="text-gray-500">No elections found.</p>
            ) : (
              elections.map((election) => (
                <Card key={election.id} className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">{election.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Type:</strong> {election.type}</p>
                    <p><strong>Start:</strong> {new Date(election.startDate).toLocaleDateString()}</p>
                    <p><strong>End:</strong> {new Date(election.endDate).toLocaleDateString()}</p>
                    <p className={election.isPublished ? "text-green-600" : "text-yellow-600"}>
                      {election.isPublished ? "✅ Results Published" : "🕒 Draft"}
                    </p>

                    <div className="flex gap-2 flex-wrap mt-3">
                      <Link href={`/admin/elections/${election.id}/candidates/add`}>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                          ➕ Add Candidate
                        </Button>
                      </Link>

                      <Link href={`/results/${election.id}`}>
                        <Button size="sm" variant="outline">📊 View Results</Button>
                      </Link>

                      {!election.isPublished && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => publishResults(election.id)}
                        >
                          📢 Publish Results
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
