import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// POST /api/reports/scheduled
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, name, type, frequency, nextRunAt, recipients, format } = body

    const scheduledReport = await prisma.scheduledReport.create({
      data: {
        publicId: id,
        name,
        type,
        frequency,
        nextRunAt: new Date(nextRunAt),
        recipients: JSON.stringify(recipients || []),
        format,
        status: 'active',
        createdById: user.id,
      }
    })

    return NextResponse.json({ success: true, id: scheduledReport.publicId })
  } catch (error) {
    console.error('Failed to create schedule:', error)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}
