"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import * as faceapi from "face-api.js"

export default function RegisterPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [currentStep, setCurrentStep] = useState<"info" | "camera" | "liveness" | "capture">("info")
  const [livenessStep, setLivenessStep] = useState<"blink" | "smile" | "turn" | "complete">("blink")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [faceApiLoaded, setFaceApiLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    loadFaceApi()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!isClient || !stream) return

    const video = videoRef.current
    if (!video) return

    const logVideoState = () => {
      console.log("Video state:", {
        dimensions: `${video.videoWidth}x${video.videoHeight}`,
        readyState: video.readyState
      })
    }

    video.addEventListener("play", logVideoState)
    video.addEventListener("loadedmetadata", logVideoState)
    
    return () => {
      video.removeEventListener("play", logVideoState)
      video.removeEventListener("loadedmetadata", logVideoState)
    }
  }, [stream, isClient])

  const loadFaceApi = async () => {
    try {
      setIsLoading(true)
      setMessage("Loading face detection models...")

      // Verify model files exist
      const modelFiles = [
        '/models/tiny_face_detector_model-weights_manifest.json',
        '/models/face_landmark_68_model-weights_manifest.json'
      ]
      
      for (const file of modelFiles) {
        const exists = await fetch(file).then(r => r.ok).catch(() => false)
        if (!exists) throw new Error(`Missing model file: ${file}`)
      }

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models")
      ])

      setFaceApiLoaded(true)
      setMessage("Face detection ready")
      console.log("All models loaded successfully")
    } catch (error) {
      console.error("Model loading error:", error)
      setMessage(`Failed to load face detection: ${error.message}`)
      setMessageType("error")
      setFaceApiLoaded(false)
    } finally {
      setIsLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setMessage("Initializing camera...")

      if (!isClient || !videoRef.current) {
        throw new Error("Video system not ready")
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }
      })

      if (!videoRef.current) {
        mediaStream.getTracks().forEach(track => track.stop())
        throw new Error("Video element unavailable")
      }

      const video = videoRef.current
      video.srcObject = mediaStream
      setStream(mediaStream)

      await new Promise((resolve, reject) => {
        const onReady = () => {
          video.removeEventListener('loadedmetadata', onReady)
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            console.log("Video ready:", video.videoWidth, "x", video.videoHeight)
            resolve(true)
          } else {
            reject("Video has no dimensions")
          }
        }

        video.addEventListener('loadedmetadata', onReady, { once: true })
        video.onerror = () => reject("Video playback failed")
      })

      setCurrentStep("liveness")
      setMessage("Camera ready - follow instructions")
    } catch (error) {
      console.error("Camera error:", error)
      setMessage(`Camera error: ${error.message}`)
      setMessageType("error")
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
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
        setCurrentStep("capture")
        setMessage("Liveness verification complete! Ready to capture your face.")
        setMessageType("success")
        break
    }
  }

  const captureFace = async () => {
    try {
      setIsLoading(true)
      setMessage("Detecting face...")

      const video = videoRef.current
      const canvas = canvasRef.current
      
      if (!video || !canvas) throw new Error("Missing video/canvas elements")
      if (video.readyState < 2) throw new Error("Video not ready")
      if (video.videoWidth === 0) throw new Error("Video has zero width")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context")

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const detection = await faceapi.detectSingleFace(
        canvas,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.52
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptor()

      if (!detection) {
        throw new Error("No face detected - center your face and try again")
      }

      console.log("Face detected:", detection)
      setMessage("Face detected! Processing...")
      
      // Registration logic here...
      
    } catch (error) {
      console.error("Detection failed:", error)
      setMessage(error.message)
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const getLivenessPrompt = () => {
    switch (livenessStep) {
      case "blink": return "Please blink your eyes slowly"
      case "smile": return "Please smile for the camera"
      case "turn": return "Please turn your head left and right"
      default: return "Liveness check complete"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Face</h1>
          <p className="text-gray-600">Complete the registration process to add your face to the system</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Enter your details for registration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              {currentStep === "info" && (
                <Button
                  onClick={startCamera}
                  disabled={!userName || !userEmail || isLoading || !faceApiLoaded}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Camera className="h-4 w-4 mr-2" />
                  )}
                  Start Face Registration
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Face Capture</CardTitle>
              <CardDescription>
                {currentStep === "info" && "Click start to begin face registration"}
                {currentStep === "camera" && "Initializing camera..."}
                {currentStep === "liveness" && `Liveness Check: ${getLivenessPrompt()}`}
                {currentStep === "capture" && "Ready to capture your face"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {currentStep !== "info" && isClient && (
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden border-4 border-red-500">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover bg-black"
                      style={{ transform: 'scaleX(-1)' }}
                      onLoadedMetadata={() => console.log("Video metadata loaded")}
                      onError={(e) => console.error("Video error:", e.currentTarget.error)}
                    />
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

                    <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-70 p-1 rounded">
                      {videoRef.current?.readyState === 4 ? 
                        `Live: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}` : 
                        "Waiting for video..."}
                    </div>
                  </div>
                )}

                {currentStep === "capture" && (
                  <div className="mt-4">
                    <Button onClick={captureFace} disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Capture Face
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {message && (
          <Alert className={`mt-6 ${
            messageType === "success" ? "border-green-500" :
            messageType === "error" ? "border-red-500" :
            "border-blue-500"
          }`}>
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

        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
          <h4 className="font-bold">System Status:</h4>
          <ul className="space-y-1">
            <li>Client: {isClient ? "✅ Ready" : "❌ Loading"}</li>
            <li>Video Element: {videoRef.current ? "✅ Found" : "❌ Missing"}</li>
            <li>Models: {faceApiLoaded ? "✅ Loaded" : "❌ Loading"}</li>
            <li>Camera: {stream ? "✅ Active" : "❌ Inactive"}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}