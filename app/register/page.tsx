"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import * as faceapi from "face-api.js";

export default function UserRegistrationForm() {
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    nationalId: "",
    email: "",
    role: "VOTER"
  });

  const [faceEncoding, setFaceEncoding] = useState<number[] | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | "info">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [instruction, setInstruction] = useState("Loading camera...");
  const [isDetecting, setIsDetecting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      setFaceApiLoaded(true);
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (faceApiLoaded) startCamera();
  }, [faceApiLoaded]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          detectFaceLoop();
        };
      }
    } catch (err) {
      setMessage("Failed to access camera.");
      setStatus("error");
    }
  };

  const detectFaceLoop = async () => {
    setIsDetecting(true);
    const steps = ["Look straight at the camera", "Blink slowly", "Smile"];
    let currentStep = 0;

    const runDetection = async () => {
      if (!videoRef.current) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const confidence = detection.detection.score;
        setInstruction(`${steps[currentStep]} (Confidence: ${(confidence * 100).toFixed(2)}%)`);

        if (confidence > 0.9) {
          currentStep++;

          if (currentStep >= steps.length) {
            const encoding = Array.from(detection.descriptor);
            setFaceEncoding(encoding);
            setInstruction("✅ Face captured with high confidence");
            setIsDetecting(false);
            return;
          }
        }
      } else {
        setInstruction("Please position your face clearly in the frame");
      }

      setTimeout(runDetection, 900); // Faster loop
    };

    runDetection();
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValidNationalId = (id: string) => /^1\d{15}$/.test(id);

  const isFormComplete =
  form.fullName.trim().length > 0 &&
  form.address.trim().length > 0 &&
  isValidNationalId(form.nationalId) &&
  Array.isArray(faceEncoding) &&
  faceEncoding.length === 128;

  const handleSubmit = async () => {
    if (!isValidNationalId(form.nationalId)) {
      setMessage("National ID must be 16 digits and start with '1'");
      setStatus("error");
      return;
    }

    if (!faceEncoding) {
      setMessage("Face not captured yet.");
      setStatus("error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, faceEncoding }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Registration successful!");
        setStatus("success");
      } else {
        setMessage(data.error || "Registration failed.");
        setStatus("error");
      }
    } catch (err) {
      setMessage("Network error.");
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-bold">User Registration</h2>

          <div>
            <Label>Full Name</Label>
            <Input
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="e.g. Kigali"
            />
          </div>

          <div>
            <Label>National ID</Label>
            <Input
              value={form.nationalId}
              onChange={(e) => handleChange("nationalId", e.target.value)}
              placeholder="16-digit Rwandan ID starting with 1"
            />
          </div>

          <div>
            <Label>Email (optional)</Label>
            <Input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <Label>Role</Label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
            >
              <option value="VOTER">VOTER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isFormComplete || isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit Registration
          </Button>

          {message && (
            <Alert className={`mt-4 ${status === "success" ? "border-green-500" : "border-red-500"}`}>
              {status === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="relative bg-black rounded-xl overflow-hidden">
          <video ref={videoRef} autoPlay muted className="w-full h-72 object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-0 w-full text-center bg-black bg-opacity-60 text-white py-2 text-sm font-medium">
            {instruction}
          </div>
        </div>
      </div>
    </div>
  );
}
