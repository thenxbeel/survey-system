import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// POST /api/reports/saved
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, name, type, format, size, status, period, parameters, description } = body

    const savedReport = await prisma.savedReport.create({
      data: {
        publicId: id,
        name,
        type,
        format,
        size: size || '—',
        status: status || 'ready',
        period,
        parameters: JSON.stringify(parameters || []),
        description,
        createdById: user.id,
      }
    })

    return NextResponse.json({ success: true, id: savedReport.publicId })
  } catch (error) {
    console.error('Failed to save report:', error)
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
  }
}
