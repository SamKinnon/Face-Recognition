"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Shield, ExternalLink } from "lucide-react"

interface User {
  id: number
  fullName: string
  hasVoted: boolean
  votedAt?: string
}

interface VoteInfo {
  hasVoted: boolean
  votedAt: string
  vote: {
    id: number
    blockchainTx: string
    ipfsHash: string
    candidate: {
      name: string
      party: string
    }
  }
}

export default function AlreadyVotedPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [voteInfo, setVoteInfo] = useState<VoteInfo | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const userData = sessionStorage.getItem("currentUser")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Fetch detailed vote information
    fetchVoteInfo(parsedUser.id)
  }, [router])

  const fetchVoteInfo = async (userId: number) => {
    try {
      const res = await fetch(`/api/vote-status?userId=${userId}`)
      const data = await res.json()
      setVoteInfo(data)
    } catch (error) {
      console.error("Failed to fetch vote info:", error)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser")
    router.push("/")
  }

  if (!user || !voteInfo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vote Already Cast</h1>
          <p className="text-gray-600">Thank you for participating in the democratic process</p>
        </div>

        {/* Vote Confirmation Card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Vote Confirmation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Voter</label>
                <p className="text-lg font-semibold">{user.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vote Cast</label>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <p className="text-lg">
                    {new Date(voteInfo.votedAt).toLocaleDateString()} at{" "}
                    {new Date(voteInfo.votedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {voteInfo.vote && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500">Selected Candidate</label>
                <div className="flex items-center space-x-3 mt-2">
                  <div>
                    <p className="text-lg font-semibold">{voteInfo.vote.candidate.name}</p>
                    <Badge variant="secondary">{voteInfo.vote.candidate.party}</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blockchain Verification */}
        {voteInfo.vote && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Blockchain Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Transaction Hash</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{voteInfo.vote.blockchainTx}</code>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">IPFS Hash</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{voteInfo.vote.ipfsHash}</code>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Immutable Record</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Your vote has been permanently recorded on the blockchain and stored on IPFS. This ensures
                      complete transparency, immutability, and verifiability of the election results.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Security Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold">Face Verified</h4>
                <p className="text-sm text-gray-600">Biometric authentication confirmed</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold">Blockchain Secured</h4>
                <p className="text-sm text-gray-600">Immutable vote recording</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold">One Vote Only</h4>
                <p className="text-sm text-gray-600">System prevents duplicate voting</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="text-center">
          <Button onClick={handleLogout} variant="outline" size="lg">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
