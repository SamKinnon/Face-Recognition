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

  useEffect(() => {
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
                      {election.isPublished ? "✅ Published" : "🕒 Draft"}
                    </p>
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
