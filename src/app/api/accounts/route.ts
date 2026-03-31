import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const household = await prisma.household.findFirst({
    where: { userId: session.user.id }
  })

  if (!household) {
    return NextResponse.json([])
  }

  const accounts = await prisma.account.findMany({
    where: { householdId: household.id },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(accounts)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let household = await prisma.household.findFirst({
    where: { userId: session.user.id }
  })

  if (!household) {
    household = await prisma.household.create({
      data: {
        name: 'My Household',
        userId: session.user.id
      }
    })
  }

  const body = await request.json()
  const { name, type, balance, cutDay, payDay } = body

  const account = await prisma.account.create({
    data: {
      householdId: household.id,
      name,
      type,
      balance: balance || 0,
      cutDay: cutDay || null,
      payDay: payDay || null
    }
  })

  return NextResponse.json(account)
}