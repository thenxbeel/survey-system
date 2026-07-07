import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * GET /api/surveys/[id]/audit-log
 *
 * Returns the audit log entries for a specific survey. Authenticated
 * employees/admins only.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^SRV-/, '')) || parseInt(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid survey ID' }, { status: 400 })
  }

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('pageSize') || '50'), 200)

  const logs = await prisma.surveyAuditLog.findMany({
    where: { surveyId: numericId },
    include: {
      actor: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({
    data: logs.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      metadata: log.metadata ? safeJsonParse(log.metadata) : null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      actor: log.actor ? { id: log.actor.id, name: log.actor.name, email: log.actor.email } : null,
      createdAt: log.createdAt.toISOString(),
    })),
  })
}

function safeJsonParse(s: string): unknown {
  try { return JSON.parse(s) } catch { return s }
}
