import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * GET /api/analytics/overview
 *
 * Executive KPIs computed from Response records only.
 *
 * After the Customer & Follow-up refactor, this endpoint no longer queries
 * the Customer or FollowUp tables. All metrics are derived from:
 *   - Response  (NPS, CSAT, CES, channel, campaign, device)
 *   - Survey    (lifecycle, ownership)
 *   - Campaign  (aggregated response metrics)
 *   - User      (employee performance via Survey ownership)
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const period     = req.nextUrl.searchParams.get('period') ?? '30d'
  const branch     = req.nextUrl.searchParams.get('branch') ?? 'all'
  const department = req.nextUrl.searchParams.get('department') ?? 'all'
  const touchpoint = req.nextUrl.searchParams.get('touchpoint') ?? 'all'
  const npsCategory = req.nextUrl.searchParams.get('npsCategory') ?? 'all'

  // Compute date range
  const now = new Date()
  let since = new Date()
  switch (period) {
    case '7d':  since.setDate(now.getDate() - 7); break
    case '30d': since.setDate(now.getDate() - 30); break
    case '90d': since.setDate(now.getDate() - 90); break
    case '1y':  since.setFullYear(now.getFullYear() - 1); break
    case 'qtr': since.setMonth(Math.floor(now.getMonth() / 3) * 3, 1); since.setHours(0,0,0,0); break
    case 'ytd': since = new Date(now.getFullYear(), 0, 1); break
    case 'all': since = new Date(0); break
  }

  const surveyWhere: any = {}
  
  // Apply filters
  if (touchpoint !== 'all') {
    surveyWhere.touchpoint = touchpoint
  }
  if (department !== 'all') {
    surveyWhere.department = department
  }
  if (branch !== 'all') {
    surveyWhere.branch = branch
  }

  const where: any = { submittedAt: { gte: since } }
  if (Object.keys(surveyWhere).length > 0) {
    where.survey = surveyWhere
  }

  if (npsCategory !== 'all') {
    if (npsCategory === 'promoter')  where.npsScore = { gte: 9, lte: 10 }
    if (npsCategory === 'passive')   where.npsScore = { gte: 7, lte: 8 }
    if (npsCategory === 'detractor') where.npsScore = { gte: 0, lte: 6 }
  }

  // ─── Aggregate metrics from Response records ──────────────────────
  const [
    totalResponses,
    npsScores,
    csatScores,
    cesScores,
    totalSurveys,
    publishedSurveys,
  ] = await Promise.all([
    prisma.response.count({ where }),
    prisma.response.findMany({ where: { ...where, npsScore: { not: null } }, select: { npsScore: true } }),
    prisma.response.findMany({ where: { ...where, csatScore: { not: null } }, select: { csatScore: true } }),
    prisma.response.findMany({ where: { ...where, cesScore: { not: null } }, select: { cesScore: true } }),
    prisma.survey.count({ where: surveyWhere }),
    prisma.survey.count({ where: { ...surveyWhere, status: 'PUBLISHED' } }),
  ])

  // ─── NPS Calculation ──────────────────────────────────────────────
  const promoters = npsScores.filter(r => (r.npsScore ?? 0) >= 9).length
  const passives  = npsScores.filter(r => (r.npsScore ?? 0) >= 7 && (r.npsScore ?? 0) <= 8).length
  const detractors = npsScores.filter(r => (r.npsScore ?? 0) <= 6).length
  const npsScore = npsScores.length > 0
    ? Math.round(((promoters - detractors) / npsScores.length) * 100)
    : 0

  // ─── CSAT (1-5 scale → percentage) ────────────────────────────────
  const avgCsat = csatScores.length > 0
    ? Math.round((csatScores.reduce((a, b) => a + (b.csatScore ?? 0), 0) / csatScores.length / 5) * 100)
    : 0

  // ─── CES (Customer Effort Score, 1-5 scale) ───────────────────────
  const avgCes = cesScores.length > 0
    ? Math.round((cesScores.reduce((a, b) => a + (b.cesScore ?? 0), 0) / cesScores.length) * 10) / 10
    : 0

  // ─── Response Rate ──────────────────────────────────────────────────
  const responseRate = totalResponses > 0 ? 100 : 0

  // ─── Campaign / channel / employee / lifecycle performance ────────
  const [campaignPerf, channelPerf, employeePerf, surveyLifecycle, activeSurveys, surveyPerf, branchPerf] = await Promise.all([
    // Campaign performance
    prisma.campaign.findMany({
      include: {
        _count: { select: { responses: { where }, surveys: true } },
        responses: { where: { ...where, npsScore: { not: null } }, select: { npsScore: true } },
      },
    }).then(cs => cs.map(c => {
      const scores = c.responses.map(r => r.npsScore!).filter((s): s is number => s !== null)
      const promoters = scores.filter(s => s >= 9).length
      const detractors = scores.filter(s => s <= 6).length
      const nps = scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : 0
      return {
        campaignId: c.id,
        campaignName: c.name,
        channel: c.channel.toLowerCase(),
        surveyCount: c._count.surveys,
        responseCount: c._count.responses,
        avgNps: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
        nps,
        isActive: c.isActive,
      }
    })),

    // Distribution channel performance
    prisma.response.groupBy({
      by: ['distributionChannel'],
      where,
      _count: { _all: true, npsScore: true },
      _avg: { npsScore: true },
    }).then(chs => chs.map(ch => ({
      channel: ch.distributionChannel.toLowerCase(),
      responseCount: ch._count._all,
      npsResponseCount: ch._count.npsScore,
      avgNps: ch._avg.npsScore ? Math.round(ch._avg.npsScore) : null,
    }))),

    // Employee performance (group by survey.createdById)
    prisma.user.findMany({
      include: {
        surveys: {
          include: {
            responses: {
              where,
              select: { npsScore: true },
            },
          },
        },
        department: { select: { name: true } },
      },
    }).then(us => us.map(u => {
      const scores = u.surveys.flatMap(s => s.responses.map(r => r.npsScore).filter((s): s is number => s !== null))
      const promoters = scores.filter(s => s >= 9).length
      const detractors = scores.filter(s => s <= 6).length
      const nps = scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : 0
      return {
        employeeId: u.id,
        employeeName: u.name,
        email: u.email,
        department: u.department?.name ?? null,
        surveyCount: u.surveys.length,
        responseCount: scores.length,
        avgNps: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
        nps,
      }
    }).filter(e => e.responseCount > 0).sort((a, b) => b.responseCount - a.responseCount)),

    // Survey lifecycle distribution
    prisma.survey.groupBy({
      by: ['lifecycleStatus'],
      where: surveyWhere,
      _count: { _all: true },
    }).then(ls => ls.map(l => ({
      status: l.lifecycleStatus.toLowerCase(),
      count: l._count._all,
    }))),

    // Active surveys with remaining time
    prisma.survey.findMany({
      where: {
        ...surveyWhere,
        lifecycleStatus: 'ACTIVE',
        expirationDate: { not: null },
      },
      select: {
        id: true, title: true, expirationDate: true,
        _count: { select: { responses: { where } } },
      },
      orderBy: { expirationDate: 'asc' },
      take: 10,
    }).then(ss => ss.map(s => ({
      surveyId: s.id,
      title: s.title,
      expirationDate: s.expirationDate!.toISOString(),
      remainingMs: s.expirationDate!.getTime() - Date.now(),
      responseCount: s._count.responses,
    }))),

    // Per-survey performance (top 10 by response count)
    prisma.survey.findMany({
      where: { responses: { some: where } },
      select: {
        id: true, title: true, touchpoint: true,
        _count: { select: { responses: { where } } },
        responses: { where: { ...where, npsScore: { not: null } }, select: { npsScore: true } },
      },
    }).then(ss => ss.map(s => {
      const scores = s.responses.map(r => r.npsScore!).filter((v): v is number => v !== null)
      const promoters = scores.filter(v => v >= 9).length
      const detractors = scores.filter(v => v <= 6).length
      return {
        surveyId: s.id,
        title: s.title,
        touchpoint: s.touchpoint,
        responseCount: s._count.responses,
        avgNps: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
        nps: scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : 0,
      }
    }).sort((a, b) => b.responseCount - a.responseCount).slice(0, 10)),

    // Branch performance (group by survey -> createdBy -> branch)
    prisma.branch.findMany({
      include: {
        users: {
          include: {
            surveys: {
              include: {
                responses: {
                  where,
                  select: { npsScore: true },
                },
              },
            },
          },
        },
      },
    }).then(bs => bs.map(b => {
      const scores = b.users.flatMap(u =>
        u.surveys.flatMap(s =>
          s.responses.map(r => r.npsScore).filter((v): v is number => v !== null)
        )
      )
      const promoters = scores.filter(v => v >= 9).length
      const detractors = scores.filter(v => v <= 6).length
      const nps = scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : 0
      return {
        branchId: b.id,
        branchName: b.name,
        responseCount: scores.length,
        nps,
      }
    }).filter(b => b.responseCount > 0).sort((a, b) => b.responseCount - a.responseCount)),
  ])

  return NextResponse.json({
    data: {
      kpis: {
        totalResponses,
        npsScore,
        csatScore: avgCsat,
        cesScore: avgCes,
        responseRate,
        totalSurveys,
        publishedSurveys,
        activeSurveys: surveyLifecycle.find(s => s.status === 'active')?.count ?? 0,
        expiredSurveys: surveyLifecycle.find(s => s.status === 'expired')?.count ?? 0,
        draftSurveys: surveyLifecycle.find(s => s.status === 'draft')?.count ?? 0,
        scheduledSurveys: surveyLifecycle.find(s => s.status === 'scheduled')?.count ?? 0,
        closedSurveys: surveyLifecycle.find(s => s.status === 'closed')?.count ?? 0,
        archivedSurveys: surveyLifecycle.find(s => s.status === 'archived')?.count ?? 0,
        totalCampaigns: campaignPerf.length,
      },
      npsBreakdown: {
        promoters,
        passives,
        detractors,
        promoterPct: npsScores.length > 0 ? Math.round((promoters / npsScores.length) * 100) : 0,
        passivePct: npsScores.length > 0 ? Math.round((passives / npsScores.length) * 100) : 0,
        detractorPct: npsScores.length > 0 ? Math.round((detractors / npsScores.length) * 100) : 0,
      },
      campaignPerformance: campaignPerf,
      channelPerformance: channelPerf,
      employeePerformance: employeePerf,
      surveyPerformance: surveyPerf,
      branchPerf: branchPerf,
      branchPerformance: branchPerf,
      surveyLifecycle,
      activeSurveys,
      period,
    },
  })
}
