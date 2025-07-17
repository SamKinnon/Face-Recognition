import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Function to compare two face encodings
function compareEncodings(encoding1: number[], encoding2: number[]): number {
  const sum = encoding1.reduce((acc, val, i) => {
    return acc + Math.pow(val - encoding2[i], 2);
  }, 0);
  return Math.sqrt(sum);
}

export async function POST(req: Request) {
  try {
    const { nationalId, faceEncoding } = await req.json();

    if (!nationalId || !faceEncoding) {
      return NextResponse.json({ error: "Missing data." }, { status: 400 });
    }

    // Find user by National ID
    const user = await prisma.user.findUnique({
      where: { nationalId },
    });

    if (!user) {
      return NextResponse.json({ match: false, error: "User not found." }, { status: 404 });
    }

    // Compare encodings
    const distance = compareEncodings(user.faceEncoding, faceEncoding);
    const isMatch = distance < 0.55; // Threshold (can adjust based on testing)

    if (isMatch) {
      return NextResponse.json({ match: true, user: { fullName: user.fullName } });
    } else {
      return NextResponse.json({ match: false, error: "Face does not match." });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
