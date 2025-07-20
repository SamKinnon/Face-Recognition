import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const admin = await prisma.user.findFirst({
    where: { email, role: "ADMIN" },
  });

  if (!admin || password !== "admin123") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ message: "Login successful", adminId: admin.id });
}
