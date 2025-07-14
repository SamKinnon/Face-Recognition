import * as faceapi from "face-api.js"

export interface FaceDetectionResult {
  detected: boolean
  confidence: number
  landmarks?: any
  descriptor?: Float32Array
}

export interface LivenessCheckResult {
  passed: boolean
  checks: {
    blink: boolean
    smile: boolean
    headMovement: boolean
  }
}

export class FaceDetectionUtils {
  private static instance: FaceDetectionUtils
  private faceApiLoaded = false

  private constructor() {}

  static getInstance(): FaceDetectionUtils {
    if (!FaceDetectionUtils.instance) {
      FaceDetectionUtils.instance = new FaceDetectionUtils()
    }
    return FaceDetectionUtils.instance
  }

  async loadModels(): Promise<boolean> {
    try {
      if (this.faceApiLoaded) return true

      // Load face-api.js models
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models")
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models")
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models")
      await faceapi.nets.faceExpressionNet.loadFromUri("/models")

      this.faceApiLoaded = true
      return true
    } catch (error) {
      console.error("Error loading face-api models:", error)
      return false
    }
  }

  async detectFace(imageElement: HTMLVideoElement | HTMLCanvasElement): Promise<FaceDetectionResult> {
    try {
      if (!this.faceApiLoaded) {
        throw new Error("Face API models not loaded")
      }

      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()
        .withFaceExpressions()

      if (!detection) {
        return { detected: false, confidence: 0 }
      }

      return {
        detected: true,
        confidence: detection.detection.score,
        landmarks: detection.landmarks,
        descriptor: detection.descriptor,
      }
    } catch (error) {
      console.error("Face detection error:", error)
      return { detected: false, confidence: 0 }
    }
  }

  async performLivenessCheck(videoElement: HTMLVideoElement, duration = 3000): Promise<LivenessCheckResult> {
    const result: LivenessCheckResult = {
      passed: false,
      checks: {
        blink: false,
        smile: false,
        headMovement: false,
      },
    }

    try {
      const startTime = Date.now()
      let blinkDetected = false
      let smileDetected = false
      let headMovementDetected = false
      let previousLandmarks: any = null

      const checkInterval = setInterval(async () => {
        try {
          const detection = await faceapi
            .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()

          if (detection) {
            // Check for blink (eye aspect ratio)
            const leftEye = detection.landmarks.getLeftEye()
            const rightEye = detection.landmarks.getRightEye()
            const eyeAspectRatio = this.calculateEyeAspectRatio(leftEye, rightEye)

            if (eyeAspectRatio < 0.25) {
              blinkDetected = true
            }

            // Check for smile
            if (detection.expressions.happy > 0.7) {
              smileDetected = true
            }

            // Check for head movement
            if (previousLandmarks) {
              const movement = this.calculateHeadMovement(previousLandmarks, detection.landmarks)
              if (movement > 10) {
                headMovementDetected = true
              }
            }
            previousLandmarks = detection.landmarks
          }

          // Check if all conditions are met or timeout
          if (Date.now() - startTime > duration) {
            clearInterval(checkInterval)
            result.checks.blink = blinkDetected
            result.checks.smile = smileDetected
            result.checks.headMovement = headMovementDetected
            result.passed = blinkDetected && smileDetected && headMovementDetected
          }
        } catch (error) {
          console.error("Liveness check error:", error)
        }
      }, 100)

      // Wait for the check to complete
      await new Promise((resolve) => {
        const waitForCompletion = () => {
          if (Date.now() - startTime > duration) {
            resolve(result)
          } else {
            setTimeout(waitForCompletion, 100)
          }
        }
        waitForCompletion()
      })
    } catch (error) {
      console.error("Liveness check error:", error)
    }

    return result
  }

  private calculateEyeAspectRatio(leftEye: any[], rightEye: any[]): number {
    // Calculate eye aspect ratio for blink detection
    const leftEAR = this.getEyeAspectRatio(leftEye)
    const rightEAR = this.getEyeAspectRatio(rightEye)
    return (leftEAR + rightEAR) / 2
  }

  private getEyeAspectRatio(eye: any[]): number {
    // Calculate the euclidean distances between the two sets of vertical eye landmarks
    const A = this.euclideanDistance(eye[1], eye[5])
    const B = this.euclideanDistance(eye[2], eye[4])
    const C = this.euclideanDistance(eye[0], eye[3])

    // Compute the eye aspect ratio
    return (A + B) / (2.0 * C)
  }

  private euclideanDistance(point1: any, point2: any): number {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2))
  }

  private calculateHeadMovement(landmarks1: any, landmarks2: any): number {
    // Calculate movement of nose tip as indicator of head movement
    const nose1 = landmarks1.getNose()[3] // Nose tip
    const nose2 = landmarks2.getNose()[3]

    return this.euclideanDistance(nose1, nose2)
  }

  calculateSimilarity(encoding1: number[], encoding2: number[]): number {
    if (encoding1.length !== encoding2.length) {
      throw new Error("Encodings must have the same length")
    }

    let sum = 0
    for (let i = 0; i < encoding1.length; i++) {
      sum += Math.pow(encoding1[i] - encoding2[i], 2)
    }

    const distance = Math.sqrt(sum)
    return 1 - distance // Convert distance to similarity (higher = more similar)
  }
}

export default FaceDetectionUtils
