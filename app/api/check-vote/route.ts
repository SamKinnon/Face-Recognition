import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  try {
    const vote = await prisma.vote.findFirst({
      where: { userId }
    })

    return NextResponse.json({ hasVoted: !!vote })
  } catch (error) {
    return NextResponse.json(
      { error: "Error checking vote status" },
      { status: 500 }
    )
  }
}