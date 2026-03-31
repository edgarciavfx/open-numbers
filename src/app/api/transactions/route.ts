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
    select: { id: true }
  })
  const accountIds = accounts.map((a: { id: string }) => a.id)

  const transactions = await prisma.transaction.findMany({
    where: { accountId: { in: accountIds } },
    include: {
      account: true,
      relatedAccount: true
    },
    orderBy: { date: 'desc' }
  })

  return NextResponse.json(transactions)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const household = await prisma.household.findFirst({
    where: { userId: session.user.id }
  })

  if (!household) {
    return NextResponse.json({ error: 'No household' }, { status: 400 })
  }

  const body = await request.json()
  const { accountId, amount, type, description, date } = body

  const account = await prisma.account.findFirst({
    where: { id: accountId, householdId: household.id }
  })

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  let balanceChange: any
  
  if (type === 'INCOME') {
    balanceChange = { increment: amount }
  } else if (type === 'EXPENSE') {
    balanceChange = { decrement: amount }
  } else {
    return NextResponse.json({ error: 'Use /api/transfer for TRANSFER type' }, { status: 400 })
  }

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        accountId,
        amount,
        type,
        description,
        date: date ? new Date(date) : new Date()
      }
    }),
    prisma.account.update({
      where: { id: accountId },
      data: { balance: balanceChange }
    })
  ])

  return NextResponse.json(transaction)
}