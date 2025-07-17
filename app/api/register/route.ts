import { NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { z } from 'zod'

const prisma = new PrismaClient()

const RegistrationSchema = z.object({
  fullName: z.string().min(3),
  address: z.string().min(3),
  nationalId: z
    .string()
    .length(16, 'National ID must be 16 digits')
    .regex(/^1/, 'Must start with 1'),
  email: z.string().email().optional(),
  faceEncoding: z.array(z.number()).length(128),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RegistrationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
    }

    const { fullName, address, nationalId, email, faceEncoding } = parsed.data

    // Check if already registered
    const existing = await prisma.user.findUnique({ where: { nationalId } })
    if (existing) {
      return NextResponse.json({ error: 'National ID already registered' }, { status: 409 })
    }

    const newUser = await prisma.user.create({
      data: {
        fullName,
        address,
        nationalId,
        email,
        faceEncoding, // stored as JSON
      },
    })

    return NextResponse.json(
      { message: 'Registration successful', userId: newUser.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
