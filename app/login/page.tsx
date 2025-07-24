"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import * as faceapi from "face-api.js"

export default function FaceLoginPage() {
  const router = useRouter()

  const [nationalId, setNationalId] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"success" | "error" | "info">("info")
  const [isVerifying, setIsVerifying] = useState(false)
  const [stepMessage, setStepMessage] = useState("Loading models...")
  const [userData, setUserData] = useState<{ fullName: string } | null>(null)

  const [faceEncoding, setFaceEncoding] = useState<number[] | null>(null)
  const [faceApiLoaded, setFaceApiLoaded] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models")
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models")
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models")
        await faceapi.nets.faceExpressionNet.loadFromUri("/models")
        setFaceApiLoaded(true)
        setStepMessage("✅ Models loaded. Enter ID to begin.")
      } catch (error) {
        console.error("Error loading models:", error)
        setMessage("Failed to load face detection models")
        setStatus("error")
      }
    }
    loadModels()

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720,
          facingMode: "user",
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          runLivenessDetection()
        }
      }
    } catch (err) {
      console.error("Camera error:", err)
      setMessage("Camera access denied or failed to start")
      setStatus("error")
    }
  }

  const runLivenessDetection = async () => {
    setIsDetecting(true)
    let blinked = false
    let smiled = false
    let turned = false

    const detect = async () => {
      if (!videoRef.current || !canvasRef.current) return
      const video = videoRef.current
      const canvas = canvasRef.current

      try {
        const dims = faceapi.matchDimensions(canvas, {
          width: video.videoWidth,
          height: video.videoHeight,
        })

        const result = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withFaceDescriptor()

        const ctx = canvas.getContext("2d")!
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (result) {
          const resized = faceapi.resizeResults(result, dims)
          faceapi.draw.drawDetections(canvas, resized)
          faceapi.draw.drawFaceLandmarks(canvas, resized)

          const expressions = result.expressions
          const noseX = result.landmarks.getNose()[0].x

          if (!blinked && expressions.surprised > 0.3 && expressions.neutral < 0.6) {
            setStepMessage("✅ Blink detected")
            blinked = true
          } else if (blinked && !smiled && expressions.happy > 0.8) {
            setStepMessage("✅ Smile detected")
            smiled = true
          } else if (smiled && !turned && (noseX < 150 || noseX > 250)) {
            setStepMessage("✅ Turn detected")
            turned = true
          }

          if (blinked && smiled && turned) {
            const encoding = Array.from(result.descriptor)
            setFaceEncoding(encoding)
            setStepMessage("Verifying identity...")
            setIsDetecting(false)
            verifyFace(encoding)
            return
          }
        } else {
          setStepMessage("Face not detected. Align your face in the frame.")
        }

        if (!turned) requestAnimationFrame(detect)
      } catch (error) {
        console.error("Detection error:", error)
        setIsDetecting(false)
        setMessage("Face detection failed")
        setStatus("error")
      }
    }

    detect()
  }

  const verifyFace = async (encoding: number[]) => {
    setIsVerifying(true)
    setMessage("🔍 Verifying face and ID...")
    setStatus("info")

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationalId, faceEncoding: encoding }),
      })

      const data = await res.json()

      if (res.ok && data.match) {
        setMessage(`✅ Welcome, ${data.user.fullName}`)
        setStatus("success")
        setUserData(data.user)

        // Stop camera
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          stream.getTracks().forEach((track) => track.stop())
          videoRef.current.srcObject = null
        }

        // ⏩ Redirect to blockchain dashboard
        router.push("/blockchain")
      } else {
        setMessage(data.error || "❌ Face or ID not recognized.")
        setStatus("error")
      }
    } catch {
      setMessage("Server error during verification.")
      setStatus("error")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleStart = () => {
    if (!/^1\d{15}$/.test(nationalId)) {
      setMessage("National ID must be 16 digits and start with '1'")
      setStatus("error")
      return
    }

    setMessage("")
    setStepMessage("Starting camera...")
    startCamera()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-bold">Face Login</h2>

          <div>
            <Label>National ID</Label>
            <Input
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="Enter 16-digit Rwandan ID"
            />
          </div>

          <Button
            onClick={handleStart}
            disabled={!faceApiLoaded || isVerifying || isDetecting}
            className="w-full mt-2"
          >
            {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Start Login
          </Button>

          {message && (
            <Alert
              className={`mt-4 ${
                status === "success"
                  ? "border-green-500"
                  : status === "error"
                  ? "border-red-500"
                  : "border-blue-500"
              }`}
            >
              {status === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Camera Feed */}
        <div className="relative bg-black rounded-xl overflow-hidden">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-72 object-cover" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
          <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white py-2 text-center text-sm font-medium">
            {stepMessage}
          </div>
        </div>
      </div>
    </div>
  )
}
