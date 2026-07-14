import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getScopeFilters } from '@/lib/auth/session'

/**
 * GET /api/analytics/departments
 *
 * Live per-department performance.
 *
 * A department owns Users → those Users own Surveys → those Surveys own Responses.
 * Department-level metrics aggregate every Response whose survey was created by a
 * user in that department.
 *
 * Supports the same filter query params as /api/analytics/overview.
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
  const isAdminDepts = user.role === 'Admin'
  if (touchpoint !== 'all') surveyWhere.touchpoint = touchpoint
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

  // Response-level where
  const where: any = { submittedAt: { gte: since } }
  if (Object.keys(surveyWhere).length > 0) where.survey = surveyWhere

  if (npsCategory !== 'all') {
    if (npsCategory === 'promoter')  where.npsScore = { gte: 9, lte: 10 }
    if (npsCategory === 'passive')   where.npsScore = { gte: 7, lte: 8 }
    if (npsCategory === 'detractor') where.npsScore = { gte: 0, lte: 6 }
  }

  // Group by Department — non-admins only see their own department (or visible departments)
  const allowedDepts = !isAdminDepts && user.visibleDepartments && user.visibleDepartments.length > 0
    ? user.visibleDepartments
    : (user.department ? [user.department] : [])

  const deptNameFilter = isAdminDepts
    ? (department !== 'all' ? { name: department } : undefined)
    : (allowedDepts.length > 0 ? { name: { in: allowedDepts } } : { name: '__none__' })

  const departments = await prisma.department.findMany({
    where: deptNameFilter,
    include: {
      users: {
        include: {
          surveys: {
            include: {
              responses: {
                where,
                select: { npsScore: true, csatScore: true },
              },
            },
          },
        },
      },
    },
  })

  const data = departments.map((d) => {
    const responses = d.users.flatMap((u) => u.surveys.flatMap((s) => s.responses))
    const npsScores = responses.map((r) => r.npsScore).filter((s): s is number => s !== null)
    const csatScores = responses.map((r) => r.csatScore).filter((s): s is number => s !== null)

    const promoters = npsScores.filter((s) => s >= 9).length
    const detractors = npsScores.filter((s) => s <= 6).length
    const passives = npsScores.filter((s) => s >= 7 && s <= 8).length

    return {
      departmentId: d.id,
      departmentName: d.name,
      branch: null,
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
    .filter((d) => d.responseCount > 0)
    .sort((a, b) => b.responseCount - a.responseCount)

  return NextResponse.json({ data, period })
}
