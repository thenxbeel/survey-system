import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, hasActionAccess } from '@/lib/auth/session'

/**
 * PATCH /api/responses/[id]/solve
 *
 * Marks a response as solved.
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
    select: { id: true, surveyId: true, status: true, assignedToId: true, survey: { select: { department: true, branch: true } } },
  })
  if (!response) return NextResponse.json({ error: 'Response not found' }, { status: 404 })

  // ── Department & Branch access control ──────────────────────────────────
  if (!hasActionAccess(currentUser, response.survey?.department ?? null, response.survey?.branch ?? null)) {
    return NextResponse.json({ error: 'Forbidden — You do not have action access to this department/branch' }, { status: 403 })
  }

  // Update the response
  const updated = await prisma.response.update({
    where: { id: numericId },
    data: {
      status: 'solved',
    },
    select: {
      id: true,
      status: true,
    },
  })

  // Create an ActivityLog entry
  await prisma.activityLog.create({
    data: {
      action: 'RESPONSE_SOLVED',
      entity: 'Response',
      entityId: numericId,
      details: `Problem for response ${numericId} marked as solved by ${currentUser.name}`,
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
