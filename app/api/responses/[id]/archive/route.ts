import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * PATCH /api/responses/[id]/archive
 *
 * Archives a response by updating its status to 'archived'.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(req)
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^RSP-/, '')) || parseInt(id)
  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid response ID' }, { status: 400 })

  // Verify the response exists
  const response = await prisma.response.findUnique({
    where: { id: numericId },
    select: { id: true, status: true, survey: { select: { department: true } } },
  })
  if (!response) return NextResponse.json({ error: 'Response not found' }, { status: 404 })

  // ── Department access control ──────────────────────────────────────────
  if (currentUser.role !== 'Admin' && response.survey?.department && response.survey.department !== currentUser.department) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update the response status to archived
  const updated = await prisma.response.update({
    where: { id: numericId },
    data: {
      status: 'archived',
    },
    select: {
      id: true,
      status: true,
    },
  })

  // Create an ActivityLog entry
  await prisma.activityLog.create({
    data: {
      action: 'RESPONSE_ARCHIVED',
      entity: 'Response',
      entityId: numericId,
      details: `Response ${numericId} archived by ${currentUser.name}`,
      userId: currentUser.id,
    },
  })

  return NextResponse.json({
    data: {
      id: `RSP-${String(updated.id).padStart(5, '0')}`,
      status: updated.status,
    },
  })
}
