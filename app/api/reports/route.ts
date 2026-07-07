import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// GET /api/reports
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [savedDb, scheduledDb] = await Promise.all([
      prisma.savedReport.findMany({
        include: { createdBy: { select: { name: true } } },
        orderBy: { generatedAt: 'desc' },
      }),
      prisma.scheduledReport.findMany({
        include: { createdBy: { select: { name: true } } },
        orderBy: { nextRunAt: 'asc' },
      })
    ])

    const savedReports = savedDb.map(r => ({
      id: r.publicId,
      name: r.name,
      type: r.type,
      format: r.format,
      size: r.size,
      status: r.status,
      generatedAt: r.generatedAt.toISOString(),
      generatedBy: r.createdBy.name,
      period: r.period,
      parameters: JSON.parse(r.parameters || '[]'),
      description: r.description || undefined,
    }))

    const scheduledReports = scheduledDb.map(r => ({
      id: r.publicId,
      name: r.name,
      type: r.type,
      frequency: r.frequency,
      nextRunAt: r.nextRunAt.toISOString(),
      lastRunAt: r.lastRunAt?.toISOString() || null,
      recipients: JSON.parse(r.recipients || '[]'),
      format: r.format,
      status: r.status,
      owner: r.createdBy.name,
    }))

    return NextResponse.json({ savedReports, scheduledReports })
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
