import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

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
  const { fromAccountId, toAccountId, amount, description } = body

  if (!fromAccountId || !toAccountId || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const [fromAccount, toAccount] = await Promise.all([
    prisma.account.findFirst({ where: { id: fromAccountId, householdId: household.id } }),
    prisma.account.findFirst({ where: { id: toAccountId, householdId: household.id } })
  ])

  if (!fromAccount || !toAccount) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const [t1, t2] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        accountId: fromAccountId,
        amount,
        type: 'TRANSFER',
        description: description || 'Transfer',
        relatedAccountId: toAccountId,
        date: new Date()
      }
    }),
    prisma.transaction.create({
      data: {
        accountId: toAccountId,
        amount: amount,
        type: 'TRANSFER',
        description: description || 'Transfer received',
        relatedAccountId: fromAccountId,
        date: new Date()
      }
    }),
    prisma.account.update({
      where: { id: fromAccountId },
      data: { balance: { decrement: amount } }
    }),
    prisma.account.update({
      where: { id: toAccountId },
      data: { balance: { increment: amount } }
    })
  ])

  return NextResponse.json({ from: t1, to: t2 })
}