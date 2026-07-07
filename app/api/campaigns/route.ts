import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { CreateCampaignSchema, parsePagination } from '@/lib/validation'
import { notify } from '@/lib/notify'

/**
 * GET /api/campaigns — list campaigns with aggregated metrics
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = parsePagination(req.nextUrl.searchParams)
  const channel = req.nextUrl.searchParams.get('channel')
  const isActive = req.nextUrl.searchParams.get('isActive')

  const where: any = {}
  if (channel && channel !== 'all') where.channel = channel.toUpperCase()
  if (isActive !== null && isActive !== undefined && isActive !== 'all') {
    where.isActive = isActive === 'true'
  }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { code: { contains: params.search } },
      { description: { contains: params.search } },
    ]
  }

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { surveys: true, responses: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.campaign.count({ where }),
  ])

  // Aggregate NPS per campaign
  const campaignIds = campaigns.map(c => c.id)
  const npsAgg = await prisma.response.groupBy({
    by: ['campaignId'],
    where: { campaignId: { in: campaignIds }, npsScore: { not: null } },
    _count: { npsScore: true },
    _avg: { npsScore: true },
  })

  const data = campaigns.map(c => {
    const agg = npsAgg.find(a => a.campaignId === c.id)
    const responseCount = c._count.responses
    const surveyCount = c._count.surveys
    return {
      id: c.id,
      name: c.name,
      code: c.code,
      description: c.description,
      channel: c.channel.toLowerCase(),
      isActive: c.isActive,
      startDate: c.startDate?.toISOString() ?? null,
      endDate: c.endDate?.toISOString() ?? null,
      owner: c.owner,
      surveyCount,
      responseCount,
      avgNps: agg?._avg.npsScore ? Math.round(agg._avg.npsScore) : null,
      npsResponseCount: agg?._count.npsScore ?? 0,
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

/**
 * POST /api/campaigns — create a new campaign
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateCampaignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  // Generate a unique campaign code
  const code = `CMP-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`

  const created = await prisma.campaign.create({
    data: {
      ...parsed.data,
      code,
      channel: parsed.data.channel as any,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      ownerId: user.id,
    },
    include: { owner: { select: { id: true, name: true, email: true } } },
  })

  await prisma.activityLog.create({
    data: {
      action: 'CAMPAIGN_CREATED',
      entity: 'Campaign',
      entityId: created.id,
      details: `Created campaign "${created.name}"`,
      userId: user.id,
    },
  })

  // ── Notify the campaign owner that the campaign was created ──────────
  try {
    await notify({
      userId: user.id,
      title: 'Campaign Created',
      message: `Campaign "${created.name}" (${code}) was created.`,
      category: 'system',
      link: '/dashboard/campaigns',
    })
  } catch { /* non-fatal */ }

  return NextResponse.json({ data: created }, { status: 201 })
}
