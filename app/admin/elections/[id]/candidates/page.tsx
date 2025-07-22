"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Candidate {
  id: number;
  fullName: string;
  party: string | null;
  photoUrl: string | null;
}

export default function ElectionCandidatesPage() {
  const { id } = useParams();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch(`/api/admin/elections/${id}/candidates`);
        const data = await res.json();
        setCandidates(data);
      } catch (err) {
        console.error("Error fetching candidates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [id]);

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">🧑‍💼 Candidates</h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : candidates.length === 0 ? (
          <p className="text-gray-500 text-center">No candidates found for this election.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {candidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardHeader>
                  <CardTitle>{candidate.fullName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {candidate.photoUrl && (
                    <img
                      src={candidate.photoUrl}
                      alt={candidate.fullName}
                      className="w-full h-40 object-cover rounded"
                    />
                  )}
                  <p><strong>Party:</strong> {candidate.party || "Independent"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
