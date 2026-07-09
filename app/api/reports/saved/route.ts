import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// GET /api/reports/saved — return all saved reports for current user
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const reports = await prisma.savedReport.findMany({
      where: { createdById: user.id },
      include: { createdBy: { select: { name: true } } },
      orderBy: { generatedAt: 'desc' },
    })
    return NextResponse.json({ data: reports })
  } catch (error) {
    console.error('Failed to fetch saved reports:', error)
    return NextResponse.json({ error: 'Failed to fetch saved reports' }, { status: 500 })
  }
}

// POST /api/reports/saved
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, name, type, format, size, status, period, parameters, description } = body

    if (!name || !type || !period) {
      return NextResponse.json({ error: `Missing required fields: name=${name}, type=${type}, period=${period}` }, { status: 400 })
    }

    const savedReport = await prisma.savedReport.create({
      data: {
        publicId: id || `rpt_${Date.now()}`,
        name,
        type,
        format: format || 'pdf',
        size: size || '—',
        status: status || 'ready',
        period,
        parameters: JSON.stringify(parameters || []),
        description,
        createdById: user.id,
      }
    })

    return NextResponse.json({ success: true, id: savedReport.publicId })
  } catch (error: any) {
    console.error('Failed to save report:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Failed to save report' }, { status: 500 })
  }
}
