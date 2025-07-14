import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "face_recognition",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

// Calculate Euclidean distance between two face encodings
function calculateDistance(encoding1: number[], encoding2: number[]): number {
  if (encoding1.length !== encoding2.length) {
    throw new Error("Encodings must have the same length")
  }

  let sum = 0
  for (let i = 0; i < encoding1.length; i++) {
    sum += Math.pow(encoding1[i] - encoding2[i], 2)
  }

  return Math.sqrt(sum)
}

export async function POST(request: NextRequest) {
  try {
    const { faceEncoding } = await request.json()

    if (!faceEncoding || !Array.isArray(faceEncoding)) {
      return NextResponse.json({ error: "Invalid face encoding" }, { status: 400 })
    }

    // Create database connection
    const connection = await mysql.createConnection(dbConfig)

    try {
      // Get all registered users
      const [users] = await connection.execute("SELECT id, name, email, face_encoding FROM users")

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json({
          match: false,
          message: "No registered users found",
        })
      }

      // Find the best match
      let bestMatch = null
      let bestDistance = Number.POSITIVE_INFINITY
      const threshold = 0.6 // Similarity threshold (lower = more similar)

      for (const user of users as any[]) {
        try {
          const storedEncoding = JSON.parse(user.face_encoding)
          const distance = calculateDistance(faceEncoding, storedEncoding)

          if (distance < bestDistance && distance < threshold) {
            bestDistance = distance
            bestMatch = {
              id: user.id,
              name: user.name,
              email: user.email,
              similarity: (1 - distance).toFixed(3),
            }
          }
        } catch (error) {
          console.error("Error processing user encoding:", error)
        }
      }

      if (bestMatch) {
        // Update last login
        await connection.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [bestMatch.id])

        return NextResponse.json({
          match: true,
          user: bestMatch,
          distance: bestDistance.toFixed(3),
        })
      } else {
        return NextResponse.json({
          match: false,
          message: "No matching face found",
        })
      }
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
