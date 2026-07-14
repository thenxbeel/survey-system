import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getScopeFilters } from '@/lib/auth/session'

/**
 * GET /api/analytics/nps
 *
 * Live NPS score distribution (0-10 buckets) + promoter/passive/detractor
 * breakdown + the computed NPS score.
 *
 * This endpoint exists so the NPS Distribution chart can render an accurate
 * per-bucket count via a single `groupBy` instead of paginating through raw
 * responses (which would undercount once the dataset exceeds the page size).
 *
 * Supports the same filter query params as /api/analytics/overview
 * (period, branch, department, touchpoint, npsCategory).
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const period      = req.nextUrl.searchParams.get('period') ?? '30d'
  const branch      = req.nextUrl.searchParams.get('branch') ?? 'all'
  const department  = req.nextUrl.searchParams.get('department') ?? 'all'
  const touchpoint  = req.nextUrl.searchParams.get('touchpoint') ?? 'all'
  const npsCategory = req.nextUrl.searchParams.get('npsCategory') ?? 'all'

  // ── Date range (mirrors /api/analytics/overview) ──
  const now = new Date()
  let since = new Date()
  switch (period) {
    case '7d':  since.setDate(now.getDate() - 7); break
    case '30d': since.setDate(now.getDate() - 30); break
    case '90d': since.setDate(now.getDate() - 90); break
    case '1y':  since.setFullYear(now.getFullYear() - 1); break
    case 'qtr': since.setMonth(Math.floor(now.getMonth() / 3) * 3, 1); since.setHours(0, 0, 0, 0); break
    case 'ytd': since = new Date(now.getFullYear(), 0, 1); break
    case 'all': since = new Date(0); break
  }

  // Survey-level filters
  const surveyWhere: any = {
    ...getScopeFilters(user)
  }
  const isAdminNps = user.role === 'Admin'
  if (touchpoint !== 'all') surveyWhere.touchpoint = touchpoint
  if (isAdminNps && department !== 'all') surveyWhere.department = department
  if (branch !== 'all') {
    if (surveyWhere.branch) {
      const allowed = surveyWhere.branch.in
      if (allowed.includes(branch)) {
        surveyWhere.branch = branch
      } else {
        surveyWhere.branch = 'UNAUTHORIZED_BRANCH_ACCESS'
      }
    } else {
      surveyWhere.branch = branch
    }
  }

  // Response-level where — only scored responses count toward the distribution
  const where: any = {
    submittedAt: { gte: since },
    npsScore: { not: null },
  }
  if (Object.keys(surveyWhere).length > 0) where.survey = surveyWhere

  if (npsCategory !== 'all') {
    if (npsCategory === 'promoter')  where.npsScore = { gte: 9, lte: 10 }
    if (npsCategory === 'passive')   where.npsScore = { gte: 7, lte: 8 }
    if (npsCategory === 'detractor') where.npsScore = { gte: 0, lte: 6 }
  }

  // Group every scored response by its exact NPS score (0-10).
  const grouped = await prisma.response.groupBy({
    by: ['npsScore'],
    where,
    _count: { _all: true },
  })

  // Build a complete 0-10 bucket array (fill gaps with 0).
  const buckets: { score: number; count: number; category: 'detractor' | 'passive' | 'promoter' }[] = []
  for (let score = 0; score <= 10; score++) {
    const row = grouped.find((g) => g.npsScore === score)
    const count = row?._count._all ?? 0
    buckets.push({
      score,
      count,
      category: score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor',
    })
  }

  const promoters = buckets.filter((b) => b.category === 'promoter').reduce((a, b) => a + b.count, 0)
  const passives = buckets.filter((b) => b.category === 'passive').reduce((a, b) => a + b.count, 0)
  const detractors = buckets.filter((b) => b.category === 'detractor').reduce((a, b) => a + b.count, 0)
  const total = promoters + passives + detractors

  const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0

  return NextResponse.json({
    data: {
      buckets,
      total,
      promoters,
      passives,
      detractors,
      promoterPct: total > 0 ? Math.round((promoters / total) * 100) : 0,
      passivePct: total > 0 ? Math.round((passives / total) * 100) : 0,
      detractorPct: total > 0 ? Math.round((detractors / total) * 100) : 0,
      nps,
    },
    period,
  })
}
