import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { UpdateCustomerSchema } from '@/lib/validation'

// GET /api/customers/:id — detail with survey history, timeline
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^CUS-/, '')) || parseInt(id)

  const c = await prisma.customer.findUnique({
    where: { id: numericId },
    include: {
      branch: true,
      assignedTo: { select: { name: true, email: true } },
      responses: {
        include: { survey: { select: { title: true, touchpoint: true } } },
        orderBy: { submittedAt: 'desc' },
        take: 20,
      },
      followUps: {
        include: { assignedTo: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
  if (!c) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

  const scores = c.responses.map(r => r.npsScore).filter((s): s is number => s !== null)
  const avgNps = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const promoters = scores.filter(s => s >= 9).length
  const detractors = scores.filter(s => s <= 6).length

  return NextResponse.json({
    data: {
      id: `CUS-${String(c.id).padStart(4, '0')}`,
      numericId: c.id,
      customerCode: c.customerCode,
      name: c.name,
      email: c.email,
      phone: c.phone,
      tier: c.tier.toLowerCase(),
      status: c.status.toLowerCase(),
      branch: c.branch?.name ?? null,
      branchId: c.branchId,
      assignedTo: c.assignedTo?.name ?? null,
      assignedToEmail: c.assignedTo?.email ?? null,
      lifetimeValue: c.lifetimeValue ?? 0,
      policyCount: c.policyCount,
      notes: c.notes,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      // Analytics
      lifetimeNps: avgNps,
      totalResponses: c.responses.length,
      promoterCount: promoters,
      detractorCount: detractors,
      // History
      surveyHistory: c.responses.map(r => ({
        id: r.id, surveyTitle: r.survey.title, touchpoint: r.survey.touchpoint,
        npsScore: r.npsScore, feedback: r.feedback, submittedAt: r.submittedAt.toISOString(),
      })),
      followUps: c.followUps.map(f => ({
        id: f.id, caseId: f.caseId, title: f.title, status: f.status.toLowerCase(),
        priority: f.priority.toLowerCase(), assignedTo: f.assignedTo.name,
        createdAt: f.createdAt.toISOString(),
      })),
    },
  })
}

// PUT /api/customers/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^CUS-/, '')) || parseInt(id)

  const body = await req.json()
  const parsed = UpdateCustomerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await prisma.customer.update({
    where: { id: numericId },
    data: parsed.data,
  })

  await prisma.activityLog.create({
    data: { action: 'CUSTOMER_UPDATED', entity: 'Customer', entityId: numericId, userId: user.id },
  })

  return NextResponse.json({ data: { id: updated.id, name: updated.name } })
}

// DELETE /api/customers/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^CUS-/, '')) || parseInt(id)

  await prisma.customer.delete({ where: { id: numericId } })
  await prisma.activityLog.create({
    data: { action: 'CUSTOMER_DELETED', entity: 'Customer', entityId: numericId, userId: user.id },
  })

  return NextResponse.json({ success: true, message: 'Customer deleted' })
}
