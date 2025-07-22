import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/elections/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const electionId = parseInt(params.id);

    if (isNaN(electionId)) {
      return NextResponse.json({ message: "Invalid election ID" }, { status: 400 });
    }

    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { candidates: true },
    });

    if (!election) {
      return NextResponse.json({ message: "Election not found" }, { status: 404 });
    }

    return NextResponse.json(election);
  } catch (err) {
    console.error("Error fetching election:", err);
    return NextResponse.json({ message: "Failed to fetch election" }, { status: 500 });
  }
}

// DELETE /api/admin/elections/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const electionId = parseInt(params.id);

    if (isNaN(electionId)) {
      return NextResponse.json({ message: "Invalid election ID" }, { status: 400 });
    }

    // Delete related votes first (due to foreign key constraints)
    await prisma.vote.deleteMany({
      where: { electionId },
    });

    // Then delete related candidates
    await prisma.candidate.deleteMany({
      where: { electionId },
    });

    // Finally, delete the election itself
    await prisma.election.delete({
      where: { id: electionId },
    });

    return NextResponse.json({ message: "Election deleted successfully." });
  } catch (err) {
    console.error("Error deleting election:", err);
    return NextResponse.json({ message: "Failed to delete election" }, { status: 500 });
  }
}
