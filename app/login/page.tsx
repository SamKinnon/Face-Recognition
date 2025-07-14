"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, CheckCircle, AlertCircle, Loader2, User } from "lucide-react"
import * as faceapi from "face-api.js"

export default function LoginPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [currentStep, setCurrentStep] = useState<"start" | "camera" | "liveness" | "verify">("start")
  const [livenessStep, setLivenessStep] = useState<"blink" | "smile" | "turn" | "complete">("blink")
  const [faceApiLoaded, setFaceApiLoaded] = useState(false)
  const [recognizedUser, setRecognizedUser] = useState<any>(null)

  useEffect(() => {
    loadFaceApi()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const loadFaceApi = async () => {
    try {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
      script.onload = async () => {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models")
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models")
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models")
        setFaceApiLoaded(true)
      }
      document.head.appendChild(script)
    } catch (error) {
      console.error("Error loading face-api.js:", error)
      setMessage("Error loading face detection models")
      setMessageType("error")
    }
  }

  const startCamera = async () => {
    try {
      setIsLoading(true)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setCurrentStep("liveness")
      setMessage("Camera started. Complete liveness verification to proceed.")
      setMessageType("info")
    } catch (error) {
      setMessage("Error accessing camera. Please allow camera permissions.")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLivenessStep = () => {
    switch (livenessStep) {
      case "blink":
        setLivenessStep("smile")
        setMessage("Great! Now please smile for the camera.")
        break
      case "smile":
        setLivenessStep("turn")
        setMessage("Perfect! Now slowly turn your head left and right.")
        break
      case "turn":
        setLivenessStep("complete")
        setCurrentStep("verify")
        setMessage("Liveness verification complete! Verifying your identity...")
        setMessageType("success")
        setTimeout(verifyFace, 1000)
        break
    }
  }

  const verifyFace = async () => {
    if (!videoRef.current || !canvasRef.current || !faceApiLoaded) return

    try {
      setIsLoading(true)
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      if (!context) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        setMessage("No face detected. Please position your face clearly in the camera.")
        setMessageType("error")
        return
      }

      const faceEncoding = Array.from(detection.descriptor)

      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faceEncoding: faceEncoding,
        }),
      })

      const result = await response.json()

      if (response.ok && result.match) {
        setRecognizedUser(result.user)
        setMessage(`Welcome back, ${result.user.name}! Face verification successful.`)
        setMessageType("success")
        // Stop camera
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      } else {
        setMessage("Face not recognized. Please try again or register first.")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error verifying face:", error)
      setMessage("Error processing face verification")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const getLivenessPrompt = () => {
    switch (livenessStep) {
      case "blink":
        return "Please blink your eyes slowly"
      case "smile":
        return "Please smile for the camera"
      case "turn":
        return "Please turn your head left and right"
      default:
        return "Liveness check complete"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Face Login</h1>
          <p className="text-gray-600">Verify your identity using facial recognition</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Face Verification
            </CardTitle>
            <CardDescription>
              {currentStep === "start" && "Click start to begin face verification"}
              {currentStep === "camera" && "Initializing camera..."}
              {currentStep === "liveness" && `Liveness Check: ${getLivenessPrompt()}`}
              {currentStep === "verify" && "Verifying your identity..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recognizedUser ? (
              <div className="text-center space-y-4">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{recognizedUser.name}</h3>
                  <p className="text-gray-600">{recognizedUser.email}</p>
                  <p className="text-sm text-gray-500 mt-2">Last login: {new Date().toLocaleString()}</p>
                </div>
                <Button onClick={() => (window.location.href = "/")}>Continue to Dashboard</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentStep === "start" && (
                  <div className="text-center">
                    <Button onClick={startCamera} disabled={isLoading || !faceApiLoaded} size="lg">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Camera className="h-4 w-4 mr-2" />
                      )}
                      Start Face Verification
                    </Button>
                  </div>
                )}

                {currentStep !== "start" && (
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                    <video ref={videoRef} autoPlay muted className="w-full h-64 object-cover" />
                    <canvas ref={canvasRef} className="hidden" />

                    {currentStep === "liveness" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-center text-white">
                          <div className="text-2xl mb-4">{getLivenessPrompt()}</div>
                          <Button onClick={handleLivenessStep} variant="secondary">
                            {livenessStep === "turn" ? "Complete" : "Next"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {currentStep === "verify" && isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-center text-white">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                          <div className="text-xl">Verifying your identity...</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {message && (
          <Alert
            className={`mt-6 ${
              messageType === "success"
                ? "border-green-500"
                : messageType === "error"
                  ? "border-red-500"
                  : "border-blue-500"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : messageType === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
