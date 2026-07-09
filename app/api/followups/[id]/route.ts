import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { UpdateFollowUpSchema, FollowUpNoteSchema } from '@/lib/validation'

// GET /api/followups/:id — detail with notes + activity timeline
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  // id can be caseId (FU-XXXX) or numeric
  let followup
  if (id.startsWith('FU-')) {
    followup = await prisma.followUp.findUnique({
      where: { caseId: id },
      include: {
        assignedTo: { select: { name: true, email: true } },
        response: { include: { survey: { select: { title: true, touchpoint: true } }, customer: { include: { branch: true } } } },
        customer: { include: { branch: true } },
        notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
    })
  } else {
    followup = await prisma.followUp.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignedTo: { select: { name: true, email: true } },
        response: { include: { survey: { select: { title: true, touchpoint: true } }, customer: { include: { branch: true } } } },
        customer: { include: { branch: true } },
        notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
    })
  }

  if (!followup) return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 })

  return NextResponse.json({
    data: {
      id: followup.caseId,
      numericId: followup.id,
      caseId: followup.caseId,
      title: followup.title,
      priority: followup.priority.toLowerCase(),
      status: followup.status.toLowerCase(),
      remarks: followup.remarks,
      resolution: followup.resolution,
      escalated: followup.escalated,
      escalationLevel: followup.escalationLevel,
      dueDate: followup.dueDate?.toISOString() ?? null,
      resolvedAt: followup.resolvedAt?.toISOString() ?? null,
      createdAt: followup.createdAt.toISOString(),
      updatedAt: followup.updatedAt.toISOString(),
      assignedTo: followup.assignedTo.name,
      assignedToId: followup.assignedToId,
      customerName: followup.customer?.name ?? followup.response?.customerName ?? 'Unknown',
      customerEmail: followup.response?.customer?.email ?? null,
      branch: followup.customer?.branch?.name ?? 'Unknown',
      touchpoint: followup.response?.survey.touchpoint ?? 'N/A',
      surveyTitle: followup.response?.survey.title ?? 'N/A',
      npsScore: followup.response?.npsScore ?? null,
      notes: followup.notes.map(n => ({
        id: n.id, content: n.content, author: n.author.name,
        createdAt: n.createdAt.toISOString(),
      })),
    },
  })
}

// PUT /api/followups/:id — update status, priority, assignment, resolution
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = UpdateFollowUpSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const data: any = { ...parsed.data }
  if (parsed.data.status) data.status = parsed.data.status.toUpperCase() as any
  if (parsed.data.priority) data.priority = parsed.data.priority.toUpperCase() as any
  if (parsed.data.dueDate) data.dueDate = new Date(parsed.data.dueDate)

  // If status is RESOLVED or CLOSED, set resolvedAt
  if (parsed.data.status === 'RESOLVED' || parsed.data.status === 'CLOSED') {
    data.resolvedAt = new Date()
  }

  // Escalation
  if (parsed.data.escalationLevel && parsed.data.escalationLevel > 0) {
    data.escalated = `Level ${parsed.data.escalationLevel}`
  }

  const followup = id.startsWith('FU-')
    ? await prisma.followUp.update({ where: { caseId: id }, data })
    : await prisma.followUp.update({ where: { id: parseInt(id) }, data })

  await prisma.activityLog.create({
    data: { action: 'FOLLOWUP_UPDATED', entity: 'FollowUp', entityId: followup.id, userId: user.id },
  })

  return NextResponse.json({ data: { id: followup.id, caseId: followup.caseId, status: followup.status } })
}
