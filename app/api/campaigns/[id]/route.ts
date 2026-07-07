import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { UpdateCampaignSchema } from '@/lib/validation'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id)

  const campaign = await prisma.campaign.findUnique({
    where: { id: numericId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      surveys: {
        select: {
          id: true, title: true, slug: true, surveyCode: true, publicUrl: true,
          lifecycleStatus: true, createdAt: true, expirationDate: true,
          _count: { select: { responses: true } },
        },
      },
      _count: { select: { responses: true } },
    },
  })
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  // Channel breakdown
  const channelBreakdown = await prisma.response.groupBy({
    by: ['distributionChannel'],
    where: { campaignId: numericId },
    _count: { _all: true },
    _avg: { npsScore: true },
  })

  // NPS distribution
  const npsDistribution = await prisma.response.groupBy({
    by: ['npsScore'],
    where: { campaignId: numericId, npsScore: { not: null } },
    _count: { npsScore: true },
  })

  // Daily trend (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  const trend = await prisma.response.findMany({
    where: { campaignId: numericId, submittedAt: { gte: thirtyDaysAgo } },
    select: { submittedAt: true, npsScore: true },
    orderBy: { submittedAt: 'asc' },
  })

  return NextResponse.json({
    data: {
      id: campaign.id,
      name: campaign.name,
      code: campaign.code,
      description: campaign.description,
      channel: campaign.channel.toLowerCase(),
      isActive: campaign.isActive,
      startDate: campaign.startDate?.toISOString() ?? null,
      endDate: campaign.endDate?.toISOString() ?? null,
      owner: campaign.owner,
      surveys: campaign.surveys,
      responseCount: campaign._count.responses,
      channelBreakdown: channelBreakdown.map(c => ({
        channel: c.distributionChannel.toLowerCase(),
        count: c._count._all,
        avgNps: c._avg.npsScore ? Math.round(c._avg.npsScore) : null,
      })),
      npsDistribution: npsDistribution.map(n => ({ score: n.npsScore, count: n._count.npsScore })),
      trend: trend.map(t => ({ date: t.submittedAt.toISOString(), npsScore: t.npsScore })),
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
    },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id)

  const body = await req.json()
  const parsed = UpdateCampaignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const data: any = { ...parsed.data }
  if (parsed.data.channel) data.channel = parsed.data.channel.toUpperCase()
  if (parsed.data.startDate) data.startDate = new Date(parsed.data.startDate)
  if (parsed.data.endDate) data.endDate = new Date(parsed.data.endDate)

  const updated = await prisma.campaign.update({
    where: { id: numericId },
    data,
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id)

  // Unlink surveys & responses before deleting to preserve referential integrity
  await prisma.survey.updateMany({ where: { campaignId: numericId }, data: { campaignId: null } })
  await prisma.response.updateMany({ where: { campaignId: numericId }, data: { campaignId: null } })
  await prisma.campaign.delete({ where: { id: numericId } })

  return NextResponse.json({ success: true })
}
