import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

// GET /api/admin/users → List all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error("GET /admin/users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// PUT /api/admin/users → Update role (expects JSON: { userId, role })
export async function PUT(req: Request) {
  try {
    const { userId, role } = await req.json()

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing userId or role" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    return NextResponse.json({ message: "User role updated", user: updated })
  } catch (error) {
    console.error("PUT /admin/users error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE /api/admin/users?userId=123
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = Number(searchParams.get("userId"))

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ message: "User deleted" })
  } catch (error) {
    console.error("DELETE /admin/users error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
