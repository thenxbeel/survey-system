import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// PATCH /api/notifications/:id/read — mark a single notification as read
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.notification.update({
    where: { id: parseInt(id) },
    data: { isRead: true },
  })

  return NextResponse.json({ success: true })
}
