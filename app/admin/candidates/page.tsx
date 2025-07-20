"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

type Election = {
  id: number
  title: string
}

export default function AddCandidatePage() {
  const [elections, setElections] = useState<Election[]>([])
  const [electionId, setElectionId] = useState("")
  const [name, setName] = useState("")
  const [party, setParty] = useState("")
  const [isIndependent, setIsIndependent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadElections = async () => {
      try {
        const res = await fetch("/api/elections")
        const data = await res.json()
        setElections(data || [])
      } catch {
        toast.error("Failed to load elections")
      }
    }

    loadElections()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/elections", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        startDate,
        endDate,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to create election");
    }

    const result = await res.json(); // ❗ This will fail if the response is not valid JSON
    console.log("Election created:", result);
    // Optional: redirect or notify success
  } catch (err) {
    setError("Something went wrong");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-slate-200 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-md border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-blue-700">
              Add New Candidate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Select Election</Label>
              <select
                value={electionId}
                onChange={(e) => setElectionId(e.target.value)}
                className="w-full border p-2 rounded-md mt-1"
              >
                <option value="">Select...</option>
                {elections.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Candidate Name</Label>
              <Input
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label>Political Party</Label>
              <Input
                placeholder="e.g. Green Party"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                disabled={isIndependent}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="independent"
                checked={isIndependent}
                onCheckedChange={(checked: boolean) =>
                  setIsIndependent(checked)
                }
              />
              <Label htmlFor="independent">Independent Candidate</Label>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Submit Candidate
            </Button>

            {success && (
              <div className="flex items-center justify-center text-green-600 space-x-2 pt-4">
                <CheckCircle2 />
                <span>Candidate added successfully</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
