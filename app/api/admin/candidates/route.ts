import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();

const CandidateSchema = z.object({
  fullName: z.string().min(3),
  party: z.string().nullable(), // can be null if independent
  photoUrl: z.string().url().nullable().optional(),
  electionId: z.number(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CandidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { fullName, party, photoUrl, electionId } = parsed.data;

    const newCandidate = await prisma.candidate.create({
      data: {
        fullName,
        party: party === "" ? null : party,
        photoUrl: photoUrl || null,
        electionId,
      },
    });

    return NextResponse.json(
      { message: "Candidate added successfully", candidateId: newCandidate.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding candidate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
