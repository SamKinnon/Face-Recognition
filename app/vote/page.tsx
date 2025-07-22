"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, Loader2, Vote, Shield, Users, Wallet, Calendar } from "lucide-react"
import { web3Service } from "@/lib/web3-service"

interface User {
  id: number
  fullName: string
  nationalId: string
  hasVoted: boolean
  votedAt?: string
}

interface Election {
  id: number
  name: string
  description: string
  startTime: number
  endTime: number
  isActive: boolean
  resultsPublished: boolean
  totalVotes: number
}

interface Candidate {
  id: number
  name: string
  party: string
  description: string
  imageUrl: string
  electionId: number
  voteCount: number
  isActive: boolean
}

export default function VotePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [elections, setElections] = useState<Election[]>([])
  const [candidates, setCandidates] = useState<{ [key: number]: Candidate[] }>({})
  const [selectedCandidates, setSelectedCandidates] = useState<{ [key: number]: number }>({})
  const [isVoting, setIsVoting] = useState(false)
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"success" | "error" | "info">("info")
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [activeTab, setActiveTab] = useState("0")

  useEffect(() => {
    // Check if user is authenticated
    const userData = sessionStorage.getItem("currentUser")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Load elections and check wallet connection
    loadElections()
    checkWalletConnection()
  }, [router])

  const checkWalletConnection = async () => {
    if (web3Service.isConnected()) {
      setWalletConnected(true)
      setWalletAddress(web3Service.getAccount() || "")
    }
  }

  const loadElections = async () => {
    try {
      const activeElections = await web3Service.getActiveElections()
      setElections(activeElections)

      // Load candidates for each election
      const candidatesData: { [key: number]: Candidate[] } = {}
      for (const election of activeElections) {
        const electionCandidates = await web3Service.getElectionCandidates(election.id)
        candidatesData[election.id] = electionCandidates
      }
      setCandidates(candidatesData)

      // Set first election as active tab
      if (activeElections.length > 0) {
        setActiveTab(activeElections[0].id.toString())
      }
    } catch (error) {
      console.error("Error loading elections:", error)
      setMessage("Failed to load elections")
      setStatus("error")
    }
  }

  const handleWalletConnect = async () => {
    try {
      const account = await web3Service.connectWallet()
      setWalletConnected(true)
      setWalletAddress(account)
      setMessage("Wallet connected successfully!")
      setStatus("success")
    } catch (error: any) {
      setMessage(error.message || "Failed to connect wallet")
      setStatus("error")
    }
  }

  const handleCandidateSelect = (electionId: number, candidateId: number) => {
    if (!walletConnected) return
    setSelectedCandidates((prev) => ({
      ...prev,
      [electionId]: candidateId,
    }))
  }

  const handleVote = async (electionId: number) => {
    if (!selectedCandidates[electionId] || !user || !walletConnected) return

    const candidateId = selectedCandidates[electionId]

    // Check if user has already voted in this election
    try {
      const hasVoted = await web3Service.hasVoterVotedInElection(user.id, electionId)
      if (hasVoted) {
        setMessage("You have already voted in this election!")
        setStatus("error")
        return
      }
    } catch (error) {
      console.error("Error checking vote status:", error)
    }

    setIsVoting(true)
    setMessage("🗳️ Recording your vote on the blockchain...")
    setStatus("info")

    try {
      // Cast vote on blockchain
      const txHash = await web3Service.vote(user.id, candidateId, electionId)

      // Record vote in database
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          candidateId: candidateId,
          electionId: electionId,
          blockchainTx: txHash,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage("✅ Vote recorded successfully on blockchain!")
        setStatus("success")

        // Update user session
        const updatedUser = { ...user, hasVoted: true, votedAt: new Date().toISOString() }
        sessionStorage.setItem("currentUser", JSON.stringify(updatedUser))

        // Redirect to confirmation page
        setTimeout(() => {
          router.push(`/vote/confirmation?tx=${txHash}&election=${electionId}`)
        }, 2000)
      } else {
        setMessage(data.error || "Failed to record vote in database")
        setStatus("error")
      }
    } catch (error: any) {
      console.error("Voting error:", error)
      setMessage(error.message || "Failed to cast vote. Please try again.")
      setStatus("error")
    } finally {
      setIsVoting(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Secure Blockchain Voting</h1>
              <p className="text-gray-600">Welcome, {user.fullName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Verified Voter</span>
              </Badge>
              {walletConnected ? (
                <Badge variant="default" className="flex items-center space-x-1">
                  <Wallet className="w-4 h-4" />
                  <span>Wallet Connected</span>
                </Badge>
              ) : (
                <Button onClick={handleWalletConnect} size="sm">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Voting Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Vote className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Voting Instructions</h3>
              <p className="text-blue-700 text-sm mt-1">
                {!walletConnected
                  ? "Connect your MetaMask wallet to Ganache network first, then select your preferred candidates."
                  : "Select your preferred candidate in each election below. Your votes will be securely recorded on the blockchain."}
              </p>
            </div>
          </div>
        </div>

        {/* Elections Tabs */}
        {elections.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                {elections.map((election) => (
                  <TabsTrigger key={election.id} value={election.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">{election.name}</span>
                      <span className="sm:hidden">{election.name.split(" ")[0]}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {elections.map((election) => (
                <TabsContent key={election.id} value={election.id.toString()} className="space-y-6">
                  {/* Election Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">{election.name}</h3>
                    <p className="text-gray-600 mb-3">{election.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Ends: {formatDate(election.endTime)}</span>
                      <Badge variant="outline">{election.totalVotes} votes cast</Badge>
                    </div>
                  </div>

                  {/* Candidates Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {candidates[election.id]?.map((candidate) => (
                      <Card
                        key={candidate.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          selectedCandidates[election.id] === candidate.id
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        } ${!walletConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => handleCandidateSelect(election.id, candidate.id)}
                      >
                        <CardHeader className="text-center pb-3">
                          <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gray-200">
                            <img
                              src={candidate.imageUrl || "/placeholder.svg"}
                              alt={candidate.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardTitle className="text-lg">{candidate.name}</CardTitle>
                          <Badge variant="secondary">{candidate.party}</Badge>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-600 text-center mb-3">{candidate.description}</p>
                          <div className="flex items-center justify-center">
                            {selectedCandidates[election.id] === candidate.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Vote Button */}
                  <div className="text-center">
                    <Button
                      onClick={() => handleVote(election.id)}
                      disabled={!selectedCandidates[election.id] || isVoting || !walletConnected}
                      size="lg"
                      className="w-full max-w-md"
                    >
                      {isVoting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Recording Vote on Blockchain...
                        </>
                      ) : !walletConnected ? (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          Connect Wallet to Vote
                        </>
                      ) : (
                        <>
                          <Vote className="w-4 h-4 mr-2" />
                          Cast Your Vote in {election.name}
                        </>
                      )}
                    </Button>

                    {selectedCandidates[election.id] && !isVoting && walletConnected && (
                      <p className="text-sm text-gray-600 mt-2">
                        You have selected:{" "}
                        <strong>
                          {candidates[election.id]?.find((c) => c.id === selectedCandidates[election.id])?.name}
                        </strong>
                      </p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Elections</h3>
            <p className="text-gray-600">There are currently no active elections available for voting.</p>
          </div>
        )}

        {message && (
          <Alert
            className={`mt-6 ${
              status === "success" ? "border-green-500" : status === "error" ? "border-red-500" : "border-blue-500"
            }`}
          >
            {status === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : status === "error" ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Blockchain Secured</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Anonymous Voting</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wallet className="w-4 h-4" />
              <span>MetaMask + Ganache</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
