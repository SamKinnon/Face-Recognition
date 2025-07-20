import prisma from '@/lib/prisma'
import { getContract } from "@/lib/contract";

// /api/admin/elections/[id]/publish/route.ts
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  try {
    const contract = await getContract();
    await contract.publishResults(id);
    await prisma.election.update({ where: { id }, data: { isPublished: true } });
    return NextResponse.json({ message: "Results published" });
  } catch (error) {
    console.error("Publish Error:", error);
    return new NextResponse("Failed to publish results", { status: 500 });
  }
}
