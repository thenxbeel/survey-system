import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { CreateCustomerSchema, parsePagination } from '@/lib/validation'

// GET /api/customers — list with pagination, search, filtering
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = parsePagination(req.nextUrl.searchParams)
  const tier    = req.nextUrl.searchParams.get('tier')
  const status  = req.nextUrl.searchParams.get('status')
  const branchId = req.nextUrl.searchParams.get('branchId')

  const where: any = {}
  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { email: { contains: params.search } },
      { customerCode: { contains: params.search } },
      { phone: { contains: params.search } },
    ]
  }
  if (tier && tier !== 'all') where.tier = tier.toUpperCase()
  if (status && status !== 'all') where.status = status.toUpperCase()
  if (branchId) where.branchId = parseInt(branchId)

  const orderBy: any = {}
  if (params.sort === 'lifetimeValue') orderBy.lifetimeValue = params.sortDir
  else if (params.sort === 'name') orderBy.name = params.sortDir
  else orderBy.createdAt = 'desc'

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: {
        branch: true,
        assignedTo: { select: { name: true } },
        _count: { select: { responses: true, followUps: true } },
      },
      orderBy,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.customer.count({ where }),
  ])

  // Compute lifetime NPS for each customer
  const customerIds = customers.map(c => c.id)
  const npsScores = await prisma.response.findMany({
    where: { customerId: { in: customerIds }, npsScore: { not: null } },
    select: { customerId: true, npsScore: true },
  })
  const npsMap = new Map<number, number[]>()
  npsScores.forEach(r => {
    const arr = npsMap.get(r.customerId!) ?? []
    arr.push(r.npsScore!)
    npsMap.set(r.customerId!, arr)
  })

  const data = customers.map(c => {
    const scores = npsMap.get(c.id) ?? []
    const avgNps = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
    return {
      id: `CUS-${String(c.id).padStart(4, '0')}`,
      numericId: c.id,
      customerCode: c.customerCode,
      name: c.name,
      email: c.email ?? '',
      phone: c.phone ?? '',
      tier: c.tier.toLowerCase(),
      status: c.status.toLowerCase(),
      branch: c.branch?.name ?? 'Unassigned',
      branchId: c.branchId,
      assignedTo: c.assignedTo?.name ?? null,
      assignedToId: c.assignedToId,
      lifetimeValue: c.lifetimeValue ?? 0,
      policyCount: c.policyCount,
      notes: c.notes,
      responseCount: c._count.responses,
      followUpCount: c._count.followUps,
      lifetimeNps: avgNps,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }
  })

  return NextResponse.json({
    data,
    pagination: {
      page: params.page, pageSize: params.pageSize, total,
      totalPages: Math.ceil(total / params.pageSize),
    },
  })
}

// POST /api/customers — create
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateCustomerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.customer.findUnique({ where: { customerCode: parsed.data.customerCode } })
  if (existing) {
    return NextResponse.json({ error: 'Customer code already exists' }, { status: 409 })
  }

  const created = await prisma.customer.create({
    data: parsed.data,
    include: { branch: true },
  })

  await prisma.activityLog.create({
    data: { action: 'CUSTOMER_CREATED', entity: 'Customer', entityId: created.id, userId: user.id },
  })

  return NextResponse.json({
    data: {
      id: created.id, customerCode: created.customerCode, name: created.name,
      branch: created.branch?.name ?? null,
    },
  }, { status: 201 })
}
