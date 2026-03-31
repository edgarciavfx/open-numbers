import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password, name } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
  }

  const user = await prisma.user.create({
    data: {
      email,
      password,
      name
    }
  })

  await prisma.household.create({
    data: {
      name: 'My Household',
      userId: user.id
    }
  })

  return NextResponse.json({ success: true })
}