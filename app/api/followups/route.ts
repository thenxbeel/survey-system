import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { CreateFollowUpSchema, parsePagination } from '@/lib/validation'

// GET /api/followups — list with pagination, search, filtering
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = parsePagination(req.nextUrl.searchParams)
  const status     = req.nextUrl.searchParams.get('status')
  const priority   = req.nextUrl.searchParams.get('priority')
  const assignedToId = req.nextUrl.searchParams.get('assignedToId')

  const where: any = {}
  if (params.search) {
    where.OR = [
      { caseId: { contains: params.search } },
      { title: { contains: params.search } },
      { remarks: { contains: params.search } },
    ]
  }
  if (status && status !== 'all') where.status = status.toUpperCase()
  if (priority && priority !== 'all') where.priority = priority.toUpperCase()
  if (assignedToId) where.assignedToId = parseInt(assignedToId)

  const orderBy: any = {}
  if (params.sort === 'priority') orderBy.priority = params.sortDir
  else if (params.sort === 'dueDate') orderBy.dueDate = params.sortDir
  else orderBy.createdAt = 'desc'

  const [followups, total] = await Promise.all([
    prisma.followUp.findMany({
      where,
      include: {
        assignedTo: { select: { name: true } },
        response: { select: { customerName: true, npsScore: true, survey: { select: { touchpoint: true } } } },
        customer: { select: { name: true, branch: { select: { name: true } } } },
        _count: { select: { notes: true } },
      },
      orderBy,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.followUp.count({ where }),
  ])

  const data = followups.map(f => ({
    id: f.caseId,
    numericId: f.id,
    caseId: f.caseId,
    title: f.title,
    priority: f.priority.toLowerCase(),
    status: f.status.toLowerCase(),
    remarks: f.remarks,
    resolution: f.resolution,
    escalated: f.escalated,
    escalationLevel: f.escalationLevel,
    dueDate: f.dueDate?.toISOString() ?? null,
    resolvedAt: f.resolvedAt?.toISOString() ?? null,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
    assignedTo: f.assignedTo.name,
    assignedToId: f.assignedToId,
    customerName: f.customer?.name ?? f.response?.customerName ?? 'Unknown',
    branch: f.customer?.branch?.name ?? 'Unknown',
    touchpoint: f.response?.survey.touchpoint ?? 'N/A',
    npsScore: f.response?.npsScore ?? null,
    noteCount: f._count.notes,
  }))

  return NextResponse.json({
    data,
    pagination: {
      page: params.page, pageSize: params.pageSize, total,
      totalPages: Math.ceil(total / params.pageSize),
    },
  })
}

// POST /api/followups — create
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateFollowUpSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { dueDate, ...followUpData } = parsed.data
  const caseId = `FU-${Date.now()}`

  const created = await prisma.followUp.create({
    data: {
      ...followUpData,
      caseId,
      priority: followUpData.priority as any,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  })

  // Notify the assigned user
  await prisma.notification.create({
    data: {
      title: 'New follow-up assigned',
      message: `Case ${caseId} has been assigned to you.`,
      category: 'followup',
      link: '/dashboard/followups',
      userId: followUpData.assignedToId,
    },
  })

  await prisma.activityLog.create({
    data: { action: 'FOLLOWUP_CREATED', entity: 'FollowUp', entityId: created.id, userId: user.id },
  })

  return NextResponse.json({ data: { id: created.id, caseId } }, { status: 201 })
}
