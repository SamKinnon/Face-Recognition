// /api/admin/elections/[id]/end/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  try {
    await prisma.election.update({
      where: { id },
      data: { isEnded: true, endTime: new Date() },
    });
    return NextResponse.json({ message: "Election ended" });
  } catch (error) {
    console.error("End Error:", error);
    return new NextResponse("Failed to end election", { status: 500 });
  }
}