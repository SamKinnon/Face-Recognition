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

export async function POST(request: NextRequest) {
  try {
    const { name, email, faceEncoding } = await request.json()

    if (!name || !email || !faceEncoding) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create database connection
    const connection = await mysql.createConnection(dbConfig)

    try {
      // Check if user already exists
      const [existingUsers] = await connection.execute("SELECT id FROM users WHERE email = ?", [email])

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
      }

      // Insert new user
      const [result] = await connection.execute(
        "INSERT INTO users (name, email, face_encoding, created_at) VALUES (?, ?, ?, NOW())",
        [name, email, JSON.stringify(faceEncoding)],
      )

      return NextResponse.json({
        success: true,
        message: "User registered successfully",
        userId: (result as any).insertId,
      })
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
