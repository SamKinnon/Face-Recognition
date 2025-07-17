import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nationalId, faceEncoding } = body

    if (!nationalId || !faceEncoding) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    // Fetch all users with a face encoding
    const users = await prisma.user.findMany({
      where: { faceEncoding: { not: null } },
    })

    const inputEncoding = new Float32Array(faceEncoding)

    let bestMatch = null
    let lowestDistance = Infinity

    for (const user of users) {
      const userEncoding = new Float32Array(user.faceEncoding)
      const distance = cosineDistance(userEncoding, inputEncoding)

      if (distance < lowestDistance) {
        lowestDistance = distance
        bestMatch = user
      }
    }

    const isMatch = bestMatch && lowestDistance < 0.5 && bestMatch.nationalId === nationalId

    if (!isMatch) {
      return NextResponse.json({
        match: false,
        error: "Face or ID does not match any registered user",
      }, { status: 401 })
    }

    return NextResponse.json({
      match: true,
      user: { fullName: bestMatch.fullName },
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Simple cosine distance calculator
function cosineDistance(a: Float32Array, b: Float32Array): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] ** 2
    normB += b[i] ** 2
  }
  return 1 - dot / (Math.sqrt(normA) * Math.sqrt(normB))
}
