import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { Account, Household } from '@prisma/client'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const household = await prisma.household.findFirst({
    where: { userId: session.user.id },
    include: {
      accounts: true
    }
  })

  if (!household) {
    return NextResponse.json({
      debitTotal: 0,
      creditTotal: 0,
      voucherTotal: 0,
      liquidity: 0,
      accounts: []
    })
  }

  const accounts: Account[] = household.accounts

  const debitTotal = accounts
    .filter(a => a.type === 'DEBIT')
    .reduce((sum: number, a) => sum + Number(a.balance), 0)

  const creditTotal = accounts
    .filter(a => a.type === 'CREDIT')
    .reduce((sum: number, a) => sum + Number(a.balance), 0)

  const voucherTotal = accounts
    .filter(a => a.type === 'VOUCHER')
    .reduce((sum: number, a) => sum + Number(a.balance), 0)

  const liquidity = debitTotal + voucherTotal + creditTotal

  return NextResponse.json({
    debitTotal,
    creditTotal,
    voucherTotal,
    liquidity,
    accounts: accounts.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      balance: a.balance.toString(),
      cutDay: a.cutDay,
      payDay: a.payDay
    }))
  })
}