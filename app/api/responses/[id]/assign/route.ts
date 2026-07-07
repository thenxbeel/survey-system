import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * PATCH /api/responses/[id]/assign
 *
 * Assigns a response to a user.
 *
 * Body: { assignedToId: number }
 *
 * - Authenticates the current user
 * - Validates the response exists (404 if not)
 * - Validates the target user exists and is active (404/409 if not)
 * - Updates Response.assignedToId, Response.assignedAt, Response.status
 * - Creates an ActivityLog entry
 * - Creates a Notification for the assigned user
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(req)
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^RSP-/, '')) || parseInt(id)
  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid response ID' }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body.assignedToId !== 'number') {
    return NextResponse.json({ error: 'assignedToId is required' }, { status: 400 })
  }

  const { assignedToId } = body

  // Verify the response exists
  const response = await prisma.response.findUnique({
    where: { id: numericId },
    select: { id: true, surveyId: true, status: true },
  })
  if (!response) return NextResponse.json({ error: 'Response not found' }, { status: 404 })

  // Verify the target user exists and is active
  const targetUser = await prisma.user.findUnique({
    where: { id: assignedToId },
    select: { id: true, name: true, email: true, isActive: true },
  })
  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (!targetUser.isActive) return NextResponse.json({ error: 'Cannot assign to an inactive user' }, { status: 409 })

  // Update the response
  const updated = await prisma.response.update({
    where: { id: numericId },
    data: {
      assignedToId,
      assignedAt: new Date(),
      status: 'actioned',
    },
    select: {
      id: true,
      assignedToId: true,
      assignedAt: true,
      status: true,
      assignedTo: { select: { id: true, name: true, email: true, employeeId: true } },
    },
  })

  // Create an ActivityLog entry
  await prisma.activityLog.create({
    data: {
      action: 'RESPONSE_ASSIGNED',
      entity: 'Response',
      entityId: numericId,
      details: `Response ${numericId} assigned to ${targetUser.name} by ${currentUser.name}`,
      userId: currentUser.id,
    },
  })

  // Create a notification for the assigned user
  await prisma.notification.create({
    data: {
      title: 'New response assigned to you',
      message: `Response RSP-${String(numericId).padStart(5, '0')} has been assigned to you by ${currentUser.name}.`,
      category: 'response',
      link: `/dashboard/responses`,
      isRead: false,
      userId: assignedToId,
    },
  })

  return NextResponse.json({
    data: {
      id: `RSP-${String(updated.id).padStart(5, '0')}`,
      assignedToId: updated.assignedToId,
      assignedToName: updated.assignedTo?.name ?? null,
      assignedToEmail: updated.assignedTo?.email ?? null,
      assignedAt: updated.assignedAt?.toISOString() ?? null,
      status: updated.status,
    },
  })
}
