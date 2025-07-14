import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Shield, Users, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Face Recognition System</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced biometric authentication using facial features. Secure, fast, and reliable identity verification.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Camera className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-lg">Real-time Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Uses webcam for instant face detection with no downloads required
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <CardTitle className="text-lg">Liveness Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Anti-spoofing protection with blink, smile, and head movement verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <CardTitle className="text-lg">Fast Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Mathematical face encodings for quick and accurate identity verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <CardTitle className="text-lg">Secure Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Only face encodings stored, never actual photos for maximum privacy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Register New Face
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
              Face Login
            </Button>
          </Link>
        </div>

        {/* How it Works */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Face Detection</h3>
              <p className="text-sm text-gray-600">Camera detects and locates your face in real-time</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Liveness Check</h3>
              <p className="text-sm text-gray-600">Verify you're real with blink, smile, and head movements</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Face Encoding</h3>
              <p className="text-sm text-gray-600">Convert face to mathematical representation</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Face Matching</h3>
              <p className="text-sm text-gray-600">Compare with stored encodings for verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
