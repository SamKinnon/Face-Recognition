import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { nationalId, electionId, candidateId } = await req.json();

  if (!nationalId || !electionId || !candidateId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  // Mark user as hasVoted = true
  await prisma.user.update({
    where: { nationalId },
    data: { hasVoted: true },
  });

  // Optionally log the vote in database (non-blockchain tracking)
  await prisma.vote.create({
    data: {
      electionId,
      candidateId,
      voter: {
        connect: { nationalId },
      },
    },
  });

  return NextResponse.json({ success: true });
}
