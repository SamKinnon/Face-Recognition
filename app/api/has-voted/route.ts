import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/has-voted?wallet=0xYourWalletAddress&electionId=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");
    const electionId = searchParams.get("electionId");

    if (!wallet || !electionId) {
      return NextResponse.json({ error: "Missing wallet or electionId" }, { status: 400 });
    }

    // Find user by wallet address
    const user = await prisma.user.findUnique({
      where: { wallet: wallet.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has already voted in this election
    const vote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        electionId: parseInt(electionId),
      },
    });

    return NextResponse.json({ hasVoted: !!vote });
  } catch (error) {
    console.error("❌ has-voted error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
