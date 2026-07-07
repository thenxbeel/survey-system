import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// PATCH /api/reports/scheduled/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const report = await prisma.scheduledReport.findUnique({ where: { publicId: id } })
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Only allow owner to modify
    if (report.createdById !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { status, lastRunAt } = body

    const data: any = {}
    if (status) data.status = status
    if (lastRunAt) data.lastRunAt = new Date(lastRunAt)

    await prisma.scheduledReport.update({
      where: { publicId: id },
      data
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update schedule:', error)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

// DELETE /api/reports/scheduled/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const report = await prisma.scheduledReport.findUnique({ where: { publicId: id } })
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Only allow owner to delete
    if (report.createdById !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.scheduledReport.delete({ where: { publicId: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete schedule:', error)
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
  }
}
