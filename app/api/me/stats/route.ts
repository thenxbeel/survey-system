import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { deriveLifecycleStatus } from '@/lib/survey-url'

/**
 * GET /api/me/stats
 *
 * Live Profile statistics for the currently authenticated user.
 * Used by:
 *   - Settings → Profile → "Profile Activity" card
 *   - Dashboard → Profile page → stat cards (Active, Drafts, Expired, etc.)
 *
 * Returns live counts computed from Prisma — no caching, no mock data.
 * Every value reflects the current database state for the logged-in user.
 *
 * Lifecycle derivation: a survey stored as ACTIVE but whose expirationDate
 * has passed is counted as EXPIRED (via deriveLifecycleStatus). This ensures
 * the Expired count is accurate even without a cron job to flip the status.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Fetch all surveys created by the user (needed for lifecycle derivation) ──
  // We fetch all surveys (not paginated) because the stats must reflect the
  // TOTAL counts, not just the current page. The lifecycle status is derived
  // at read-time so expired surveys are correctly counted even if the DB
  // still has them as ACTIVE.
  const allSurveys = await prisma.survey.findMany({
    where: { createdById: user.id },
    select: {
      id: true,
      lifecycleStatus: true,
      activationDate: true,
      expirationDate: true,
      closedAt: true,
      status: true,
    },
  })

  // ── Derive the effective lifecycle status for each survey ──
  type DerivedStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'closed' | 'archived'
  const derivedCounts: Record<DerivedStatus, number> = {
    draft: 0, scheduled: 0, active: 0, expired: 0, closed: 0, archived: 0,
  }
  for (const s of allSurveys) {
    const derived = deriveLifecycleStatus(
      s.lifecycleStatus as any,
      s.activationDate,
      s.expirationDate,
      s.closedAt,
    ).toLowerCase() as DerivedStatus
    derivedCounts[derived]++
  }

  const surveysManaged = allSurveys.length
  const active = derivedCounts.active
  const draft = derivedCounts.draft
  const expired = derivedCounts.expired
  const scheduled = derivedCounts.scheduled
  const closed = derivedCounts.closed
  const archived = derivedCounts.archived
  // "Published" = all surveys whose status is PUBLISHED (regardless of lifecycle)
  const published = allSurveys.filter(s => s.status === 'PUBLISHED').length

  // ── Run the remaining counts in parallel ──
  const surveyIds = allSurveys.map(s => s.id)

  const [
    casesHandled,
    npsAgg,
    totalResponses,
    teamMembers,
  ] = await Promise.all([
    // Responses on the user's surveys that have been triaged
    // (any status other than the default 'new' counts as "handled")
    prisma.response.count({
      where: {
        surveyId: { in: surveyIds },
        status: { not: 'new' },
      },
    }),

    // Average NPS across all scored responses on the user's surveys
    prisma.response.aggregate({
      where: {
        surveyId: { in: surveyIds },
        npsScore: { not: null },
      },
      _avg: { npsScore: true },
      _count: { npsScore: true },
    }),

    // Total responses across all the user's surveys
    prisma.response.count({
      where: { surveyId: { in: surveyIds } },
    }),

    // Users in the same department (if the user belongs to one)
    user.departmentId
      ? prisma.user.count({
          where: {
            departmentId: user.departmentId,
            isActive: true,
          },
        })
      : Promise.resolve(0),
  ])

  const averageNps = npsAgg._avg.npsScore != null
    ? Math.round(npsAgg._avg.npsScore * 10) / 10
    : null

  return NextResponse.json({
    data: {
      surveysManaged,
      active,
      draft,
      expired,
      scheduled,
      closed,
      archived,
      published,
      totalResponses,
      casesHandled,
      averageNps,
      npsResponseCount: npsAgg._count.npsScore,
      teamMembers,
    },
  })
}
