"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Shield, ExternalLink, SnowflakeIcon as Confetti } from "lucide-react"

export default function VoteConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(true)

  const transactionHash = searchParams.get("tx")

  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))

    // Hide confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000)
  }, [router])

  const handleFinish = () => {
    sessionStorage.removeItem("currentUser")
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6 relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="absolute top-10 left-10 text-yellow-400 animate-bounce">🎉</div>
          <div className="absolute top-20 right-20 text-green-400 animate-bounce delay-100">🎊</div>
          <div className="absolute top-32 left-1/4 text-blue-400 animate-bounce delay-200">✨</div>
          <div className="absolute top-16 right-1/3 text-purple-400 animate-bounce delay-300">🎈</div>
          <div className="absolute top-40 right-10 text-red-400 animate-bounce delay-400">🎉</div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Vote Successfully Cast!</h1>
          <p className="text-xl text-gray-600">
            Thank you, {user.fullName}, for participating in the democratic process
          </p>
        </div>

        {/* Transaction Details */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Blockchain Transaction Confirmed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Your Vote is Secure</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Your vote has been permanently recorded on the blockchain with the following transaction hash:
                  </p>
                </div>
              </div>
            </div>

            {transactionHash && (
              <div>
                <label className="text-sm font-medium text-gray-500">Transaction Hash</label>
                <div className="flex items-center space-x-2 mt-1 p-3 bg-gray-50 rounded-lg">
                  <code className="text-sm font-mono flex-1 break-all">{transactionHash}</code>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Verified</h4>
                <p className="text-sm text-green-700">Identity confirmed via face recognition</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Immutable</h4>
                <p className="text-sm text-blue-700">Permanently recorded on blockchain</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Confetti className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Anonymous</h4>
                <p className="text-sm text-purple-700">Your privacy is protected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Vote Aggregation</h4>
                  <p className="text-sm text-gray-600">
                    All votes are automatically tallied on the blockchain in real-time
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Transparent Results</h4>
                  <p className="text-sm text-gray-600">
                    Election results will be publicly verifiable on the blockchain
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Official Announcement</h4>
                  <p className="text-sm text-gray-600">Final results will be announced through official channels</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Actions */}
        <div className="text-center">
          <Button onClick={handleFinish} size="lg" className="px-8">
            Complete Voting Process
          </Button>
          <p className="text-sm text-gray-500 mt-4">You will be logged out and redirected to the home page</p>
        </div>
      </div>
    </div>
  )
}
