// app/api/admin/elections/[id]/candidates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const electionId = parseInt(params.id);
    const { fullName, party = null, photoUrl = null } = await req.json();

    if (!fullName || isNaN(electionId)) {
      return NextResponse.json({ message: "Invalid data." }, { status: 400 });
    }

    const candidate = await prisma.candidate.create({
      data: {
        fullName,
        party,
        photoUrl,
        electionId,
      },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (err) {
    console.error("❌ Failed to add candidate:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
