"use client"

import { useRef, useEffect, useState } from "react"
import * as faceapi from "face-api.js"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function FaceCapture({ onCapture }: { onCapture: (encoding: number[]) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [isCapturing, setIsCapturing] = useState(false)
  const [faceCaptured, setFaceCaptured] = useState(false)

  useEffect(() => {
    const loadModelsAndCamera = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models")
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models")
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models")

        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        setIsCapturing(true)
      } catch (error) {
        console.error("Error loading models or camera:", error)
        setStatus("error")
        setMessage("❌ Failed to load face recognition models or camera.")
      }
    }

    loadModelsAndCamera()
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isCapturing || faceCaptured || !videoRef.current) return

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (detection) {
        const encoding = Array.from(detection.descriptor)
        onCapture(encoding)
        setStatus("success")
        setMessage("✅ Face captured and encoding generated.")
        setFaceCaptured(true)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isCapturing, faceCaptured, onCapture])

  return (
    <div className="space-y-4">
      <video ref={videoRef} autoPlay muted className="w-full h-60 bg-black rounded-lg" />
      {message && (
        <Alert
          className={`$ {
            status === "success"
              ? "border-green-500"
              : status === "error"
              ? "border-red-500"
              : "border-blue-500"
          }`}
        >
          {status === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
