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
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("info")
  const [currentStep, setCurrentStep] = useState("info")
  const [livenessStep, setLivenessStep] = useState("blink")
  const [userName, setUserName] = useState("")
  const [userAddress, setUserAddress] = useState("")
  const [userId, setUserId] = useState("")
  const [faceApiLoaded, setFaceApiLoaded] = useState(false)
  const [confidence, setConfidence] = useState(0)

  useEffect(() => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models")
    ])
      .then(() => setFaceApiLoaded(true))
      .catch((error) => {
        console.error("Model loading error", error)
        setMessage("Failed to load face recognition models.")
        setMessageType("error")
      })

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    let interval
    if (currentStep === "liveness" && videoRef.current) {
      interval = setInterval(() => handleLivenessStep(), 500)
    }
    return () => clearInterval(interval)
  }, [currentStep, livenessStep])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current.play()
          setCurrentStep("liveness")
          setMessage("Camera ready. Begin liveness check.")
          setMessageType("info")
        }
      }
    } catch (err) {
      console.error("Camera error:", err)
      setMessage("Failed to access camera.")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLivenessStep = async () => {
    if (!videoRef.current || !faceApiLoaded) return

    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()

    if (!detections) {
      setMessage("No face detected. Make sure your face is visible.")
      setMessageType("error")
      return
    }

    if (canvasRef.current) {
      const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true)
      const resized = faceapi.resizeResults(detections, dims)
      faceapi.draw.drawDetections(canvasRef.current, resized)
    }

    const expressions = detections.expressions || {}
    const happy = expressions.happy || 0
    const neutral = expressions.neutral || 0
    const sad = expressions.sad || 0

    if (livenessStep === "blink") {
      if (neutral > 0.9) {
        setConfidence(Math.round(neutral * 100))
        setLivenessStep("smile")
        setMessage("Great! Now please smile.")
      } else {
        setConfidence(Math.round(neutral * 100))
        setMessage("Please blink slowly")
      }
    } else if (livenessStep === "smile") {
      if (happy > 0.9) {
        setConfidence(Math.round(happy * 100))
        setLivenessStep("turn")
        setMessage("Awesome! Now turn your head slowly.")
      } else {
        setConfidence(Math.round(happy * 100))
        setMessage("Please smile clearly")
      }
    } else if (livenessStep === "turn") {
      if (sad > 0.5) {
        setConfidence(Math.round(sad * 100))
        setLivenessStep("complete")
        setCurrentStep("capture")
        setMessage("Liveness complete. Ready to capture.")
        setMessageType("success")
      } else {
        setConfidence(Math.round(sad * 100))
        setMessage("Please turn your head slowly")
      }
    }
  }

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current || !faceApiLoaded) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setMessage("Video not ready.")
      setMessageType("error")
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) {
      setMessage("Face not detected.")
      setMessageType("error")
      return
    }

    const faceEncoding = Array.from(detection.descriptor)

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userName,
        address: userAddress,
        nationalId: userId,
        faceEncoding
      })
    })

    if (response.ok) {
      setMessage("Registration successful.")
      setMessageType("success")
      stream?.getTracks().forEach((track) => track.stop())
    } else {
      const data = await response.json()
      setMessage(data.error || "Registration failed")
      setMessageType("error")
    }
  }

  const isValidId = (id) => /^1\d{15}$/.test(id)

  return (
    <div className="min-h-screen p-6 bg-blue-50">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Fill in your details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Full Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <Input placeholder="Address" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} />
            <Input
              placeholder="National ID (16 digits starting with 1)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              maxLength={16}
            />
            <Button
              onClick={startCamera}
              disabled={!userName || !userAddress || !isValidId(userId) || !faceApiLoaded}
              className="w-full"
            >
              Start Camera
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Camera</CardTitle>
            <CardDescription>
              {currentStep === "info" && "Start to begin."}
              {currentStep === "liveness" && `Liveness: ${livenessStep} (${confidence}%)`}
              {currentStep === "capture" && "Ready to capture face."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video ref={videoRef} autoPlay muted className="w-full h-64 rounded-lg bg-black" />
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-64" />
            </div>
            {currentStep === "capture" && (
              <Button onClick={captureFace} className="mt-4 w-full">
                Capture & Register
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {message && (
        <Alert
          className={`mt-6 max-w-2xl mx-auto ${
            messageType === "success"
              ? "border-green-500"
              : messageType === "error"
              ? "border-red-500"
              : "border-blue-500"
          }`}
        >
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
