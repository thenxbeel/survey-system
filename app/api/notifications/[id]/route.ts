import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// DELETE /api/notifications/:id — delete a single notification
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.notification.delete({
    where: { id: parseInt(id) },
  }).catch(() => { /* ignore if already deleted */ })

  return NextResponse.json({ success: true })
}
