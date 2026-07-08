import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { parsePagination } from '@/lib/validation'
import { deriveLifecycleStatus, computeRemainingMs } from '@/lib/survey-url'

/**
 * GET /api/me/surveys
 *
 * Returns surveys created by the currently authenticated user, with
 * rich metadata for the Employee Profile → "Created Surveys" section.
 *
 * Supports: search, sort, filter by status / lifecycleStatus / date range.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = parsePagination(req.nextUrl.searchParams)
  const status     = req.nextUrl.searchParams.get('status')
  const lifecycle  = req.nextUrl.searchParams.get('lifecycle')
  const dateFrom   = req.nextUrl.searchParams.get('dateFrom')
  const dateTo     = req.nextUrl.searchParams.get('dateTo')
  const surveyId   = req.nextUrl.searchParams.get('surveyId')

  const where: any = { createdById: user.id }
  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { surveyCode: { contains: params.search } },
      { slug: { contains: params.search } },
    ]
  }
  if (status && status !== 'all') where.status = status.toUpperCase()
  if (lifecycle && lifecycle !== 'all') where.lifecycleStatus = lifecycle.toUpperCase()
  if (surveyId) where.id = parseInt(surveyId.replace(/^SRV-/, '') || surveyId)
  if (dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) }
  if (dateTo)   where.createdAt = { ...where.createdAt, lte: new Date(dateTo + 'T23:59:59') }

  const orderBy: any = {}
  switch (params.sort) {
    case 'title':         orderBy.title = params.sortDir; break
    case 'createdAt':     orderBy.createdAt = params.sortDir; break
    case 'responseCount': orderBy.responses = { _count: params.sortDir }; break
    default:              orderBy.updatedAt = 'desc'
  }

  const [surveys, total] = await Promise.all([
    prisma.survey.findMany({
      where,
      include: {
        campaign: { select: { id: true, name: true, channel: true } },
        _count: { select: { responses: true, questions: true } },
      },
      orderBy,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.survey.count({ where }),
  ])

  const surveyIds = surveys.map(s => s.id)
  const npsAgg = await prisma.response.groupBy({
    by: ['surveyId'],
    where: { surveyId: { in: surveyIds }, npsScore: { not: null } },
    _count: { npsScore: true },
    _avg: { npsScore: true },
  })
  const lastResp = await prisma.response.groupBy({
    by: ['surveyId'],
    where: { surveyId: { in: surveyIds } },
    _max: { submittedAt: true },
  })

  const data = surveys.map(s => {
    const agg = npsAgg.find(a => a.surveyId === s.id)
    const last = lastResp.find(r => r.surveyId === s.id)
    const responseCount = s._count.responses
    const derivedLifecycle = deriveLifecycleStatus(
      s.lifecycleStatus, s.activationDate, s.expirationDate, s.closedAt,
    )
    const responseRate = responseCount > 0
      ? Math.round(((agg?._count.npsScore ?? 0) / responseCount) * 100)
      : 0
    return {
      id: `SRV-${String(s.id).padStart(4, '0')}`,
      numericId: s.id,
      title: s.title,
      touchpoint: s.touchpoint,
      status: s.status.toLowerCase(),
      lifecycleStatus: derivedLifecycle,
      visibility: s.visibility.toLowerCase(),
      isAnonymous: s.isAnonymous,
      questionCount: s._count.questions,
      responseCount,
      responseRate,
      npsScore: agg?._avg.npsScore ? Math.round(agg._avg.npsScore) : null,
      npsResponseCount: agg?._count.npsScore ?? 0,
      lastResponseAt: last?._max.submittedAt?.toISOString() ?? null,
      slug: s.slug,
      publicUrl: s.publicUrl,
      qrCode: s.qrCode,
      surveyCode: s.surveyCode,
      activationDate: s.activationDate?.toISOString() ?? null,
      expirationDate: s.expirationDate?.toISOString() ?? null,
      remainingMs: computeRemainingMs(s.expirationDate),
      campaign: s.campaign
        ? { id: s.campaign.id, name: s.campaign.name, channel: s.campaign.channel }
        : null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
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
