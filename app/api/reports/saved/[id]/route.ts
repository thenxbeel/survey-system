import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// DELETE /api/reports/saved/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const report = await prisma.savedReport.findUnique({ where: { publicId: id } })
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Only allow owner to delete
    if (report.createdById !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.savedReport.delete({ where: { publicId: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete report:', error)
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
  }
}
