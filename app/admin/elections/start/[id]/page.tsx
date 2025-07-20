import prisma from '@/lib/prisma'
import { getContract } from "@/lib/contract";

// /api/admin/elections/[id]/start/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  try {
    await prisma.election.update({
      where: { id },
      data: { isStarted: true, startTime: new Date() },
    });
    return NextResponse.json({ message: "Election started" });
  } catch (error) {
    console.error("Start Error:", error);
    return new NextResponse("Failed to start election", { status: 500 });
  }
}