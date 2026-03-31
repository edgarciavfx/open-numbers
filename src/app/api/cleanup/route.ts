import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const household = await prisma.household.findFirst({
    where: { userId: session.user.id }
  })

  if (!household) {
    return NextResponse.json({ success: true })
  }

  await prisma.transaction.deleteMany({
    where: { account: { householdId: household.id } }
  })

  await prisma.account.deleteMany({
    where: { householdId: household.id }
  })

  return NextResponse.json({ success: true })
}