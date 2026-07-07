import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * GET /api/analytics/branches
 *
 * Live per-branch performance grouped from the Branch table.
 *
 * Each branch owns Users → those Users own Surveys → those Surveys own Responses.
 * So a branch's metrics are the aggregate of every Response whose survey was
 * created by a user belonging to that branch.
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

  // Filters that live on the Survey relation
  const surveyWhere: any = {}
  if (touchpoint !== 'all') surveyWhere.touchpoint = touchpoint
  if (department !== 'all') surveyWhere.department = department

  // Response-level where (date + survey filters)
  const where: any = { submittedAt: { gte: since } }
  if (Object.keys(surveyWhere).length > 0) where.survey = surveyWhere

  if (npsCategory !== 'all') {
    if (npsCategory === 'promoter')  where.npsScore = { gte: 9, lte: 10 }
    if (npsCategory === 'passive')   where.npsScore = { gte: 7, lte: 8 }
    if (npsCategory === 'detractor') where.npsScore = { gte: 0, lte: 6 }
  }

  // Load every Branch with its users → surveys → filtered responses.
  const branches = await prisma.branch.findMany({
    where: branch !== 'all' ? { name: branch } : undefined,
    include: {
      users: {
        include: {
          surveys: {
            include: {
              responses: {
                where,
                select: { npsScore: true, csatScore: true, submittedAt: true },
              },
            },
          },
        },
      },
    },
  })

  const data = branches.map((b) => {
    const responses = b.users.flatMap((u) => u.surveys.flatMap((s) => s.responses))
    const npsScores = responses.map((r) => r.npsScore).filter((s): s is number => s !== null)
    const csatScores = responses.map((r) => r.csatScore).filter((s): s is number => s !== null)

    const promoters = npsScores.filter((s) => s >= 9).length
    const detractors = npsScores.filter((s) => s <= 6).length
    const passives = npsScores.filter((s) => s >= 7 && s <= 8).length

    return {
      branchId: b.id,
      branchName: b.name,
      location: b.location ?? null,
      responseCount: responses.length,
      npsResponseCount: npsScores.length,
      promoters,
      passives,
      detractors,
      nps: npsScores.length > 0 ? Math.round(((promoters - detractors) / npsScores.length) * 100) : null,
      avgNps: npsScores.length > 0 ? Math.round(npsScores.reduce((a, c) => a + c, 0) / npsScores.length) : null,
      csat: csatScores.length > 0
        ? Math.round((csatScores.reduce((a, c) => a + c, 0) / csatScores.length / 5) * 100)
        : null,
    }
  })
    .filter((b) => b.responseCount > 0)
    .sort((a, b) => b.responseCount - a.responseCount)

  return NextResponse.json({ data, period })
}
