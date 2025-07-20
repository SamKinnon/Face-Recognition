import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all elections (optional)
export async function GET() {
  try {
    const elections = await prisma.election.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        candidates: true,
        votes: true,
      },
    });

    return NextResponse.json(elections);
  } catch (error) {
    console.error("GET /api/admin/elections error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST: Create new election
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type, startDate, endDate, description } = body;

    if (!title || !type || !startDate || !endDate || !description) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const newElection = await prisma.election.create({
      data: {
        title,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isPublished: false,
      },
    });

    return NextResponse.json(newElection, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/elections error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
