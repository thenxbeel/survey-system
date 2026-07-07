import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// GET /api/notifications — list current user's notifications
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({
    data: notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      category: n.category,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
  })
}

// POST /api/notifications — mark all as read
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  })

  return NextResponse.json({ success: true, message: 'All notifications marked as read' })
}
