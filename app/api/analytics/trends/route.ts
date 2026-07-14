import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getScopeFilters } from '@/lib/auth/session'

// GET /api/analytics/trends — monthly NPS + response volume trends
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const period      = req.nextUrl.searchParams.get('period') ?? 'monthly'
  const branch      = req.nextUrl.searchParams.get('branch') ?? 'all'
  const department  = req.nextUrl.searchParams.get('department') ?? 'all'
  const touchpoint  = req.nextUrl.searchParams.get('touchpoint') ?? 'all'
  const npsCategory = req.nextUrl.searchParams.get('npsCategory') ?? 'all'


  const surveyWhere: any = {
    ...getScopeFilters(user)
  }

  // ── Department access control ──────────────────────────────────────────
  const isAdminTrends = user.role === 'Admin'

  // Apply filters
  if (touchpoint !== 'all') {
    surveyWhere.touchpoint = touchpoint
  }
  if (isAdminTrends && department !== 'all') {
    surveyWhere.department = department
  }
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

  const where: any = {}
  if (Object.keys(surveyWhere).length > 0) {
    where.survey = surveyWhere
  }

  if (npsCategory !== 'all') {
    if (npsCategory === 'promoter')  where.npsScore = { gte: 9, lte: 10 }
    if (npsCategory === 'passive')   where.npsScore = { gte: 7, lte: 8 }
    if (npsCategory === 'detractor') where.npsScore = { gte: 0, lte: 6 }
  }

  const range = req.nextUrl.searchParams.get('range') ?? '1y'

  // Determine timeframe
  const now = new Date()
  let since = new Date()
  switch (range) {
    case '7d':  since.setDate(now.getDate() - 7); break
    case '30d': since.setDate(now.getDate() - 30); break
    case '90d': since.setDate(now.getDate() - 90); break
    case '1y':  since.setFullYear(now.getFullYear() - 1); break
    case 'qtr': since.setMonth(Math.floor(now.getMonth() / 3) * 3, 1); since.setHours(0,0,0,0); break
    case 'ytd': since = new Date(now.getFullYear(), 0, 1); break
    case 'all': since = new Date(0); break
  }

  const responses = await prisma.response.findMany({
    where: { ...where, submittedAt: { gte: since } },
    select: { npsScore: true, csatScore: true, submittedAt: true },
    orderBy: { submittedAt: 'asc' },
  })

  const groupMap = new Map<string, { responses: number; completions: number; npsScores: number[]; csatScores: number[]; sortKey: string }>()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  function getPeriodKey(d: Date) {
    let key = ''
    let sortKey = d.toISOString()

    if (period === 'weekly') {
      const firstDayOfYear = new Date(d.getFullYear(), 0, 1)
      const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
      key = `Week ${weekNum}, ${d.getFullYear()}`
      sortKey = `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`
    } else if (period === 'quarterly') {
      const q = Math.floor(d.getMonth() / 3) + 1
      key = `Q${q} ${d.getFullYear()}`
      sortKey = `${d.getFullYear()}-Q${q}`
    } else if (period === 'daily') {
      key = `${monthNames[d.getMonth()]} ${d.getDate()}`
      sortKey = d.toISOString().split('T')[0]
    } else {
      key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
      sortKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    }
    return { key, sortKey }
  }

  // Pre-fill groupMap with all periods between `since` and `now` to ensure chart draws empty periods
  let curr = new Date(since.getTime())
  while (curr <= now) {
    const { key, sortKey } = getPeriodKey(curr)
    if (!groupMap.has(key)) {
      groupMap.set(key, { responses: 0, completions: 0, npsScores: [], csatScores: [], sortKey })
    }
    if (period === 'weekly') {
      curr.setDate(curr.getDate() + 7)
    } else if (period === 'quarterly') {
      curr.setMonth(curr.getMonth() + 3)
    } else if (period === 'daily') {
      curr.setDate(curr.getDate() + 1)
    } else {
      curr.setMonth(curr.getMonth() + 1)
    }
  }
  const { key: nowKey, sortKey: nowSortKey } = getPeriodKey(now)
  if (!groupMap.has(nowKey)) {
    groupMap.set(nowKey, { responses: 0, completions: 0, npsScores: [], csatScores: [], sortKey: nowSortKey })
  }

  responses.forEach(r => {
    const d = new Date(r.submittedAt)
    const { key, sortKey } = getPeriodKey(d)
    const entry = groupMap.get(key) ?? { responses: 0, completions: 0, npsScores: [], csatScores: [], sortKey }
    entry.responses++
    if (r.npsScore !== null) entry.completions++
    if (r.npsScore !== null) entry.npsScores.push(r.npsScore)
    if (r.csatScore !== null) entry.csatScores.push(r.csatScore)
    groupMap.set(key, entry)
  })

  // Build sorted trend data
  const trendData = Array.from(groupMap.entries())
    .sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey))
    .map(([dateKey, data]) => {
    const promoters = data.npsScores.filter(s => s >= 9).length
    const detractors = data.npsScores.filter(s => s <= 6).length
    const nps = data.npsScores.length > 0
      ? Math.round(((promoters - detractors) / data.npsScores.length) * 100)
      : null
    const csat = data.csatScores.length > 0
      ? Math.round((data.csatScores.reduce((a, b) => a + b, 0) / data.csatScores.length / 5) * 100)
      : null
    return {
      date: dateKey,
      responses: data.responses,
      completions: data.completions,
      npsScore: nps,
      csatScore: csat,
    }
  })

  // Remove trailing periods with no responses (current in-progress month
  // and any future pre-filled buckets that have no data yet)
  let trimmed = trendData
  while (trimmed.length > 0 && trimmed[trimmed.length - 1].responses === 0 && trimmed[trimmed.length - 1].npsScore === null) {
    trimmed = trimmed.slice(0, -1)
  }

  return NextResponse.json({ data: trimmed })
}
