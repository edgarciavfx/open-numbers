import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const household = await prisma.household.findFirst({
    where: { userId: session.user.id }
  })

  if (!household) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const account = await prisma.account.findFirst({
    where: { id, householdId: household.id }
  })

  if (!account) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(account)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const household = await prisma.household.findFirst({
    where: { userId: session.user.id }
  })

  if (!household) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const account = await prisma.account.findFirst({
    where: { id, householdId: household.id }
  })

  if (!account) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.account.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}