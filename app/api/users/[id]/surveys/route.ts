import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { parsePagination } from '@/lib/validation'
import { deriveLifecycleStatus, computeRemainingMs } from '@/lib/survey-url'
import { extractSlugFromInput } from '@/lib/survey-search'

/**
 * GET /api/users/[id]/surveys
 *
 * Admin-only endpoint: returns surveys created by a specific user.
 * Used by the Admin User Management → expandable user row.
 *
 * Search supports:
 *   - Full public survey URL → slug extracted automatically
 *   - Survey slug / survey code / numeric ID / title / touchpoint
 *   - Campaign name (via Survey → Campaign relation)
 *   - Lifecycle status (active / draft / expired / closed / archived / scheduled)
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const userId = parseInt(id)

  // Only the user themselves or an Admin can view this
  if (user.id !== userId && user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const params2 = parsePagination(req.nextUrl.searchParams)

  const where: any = { createdById: userId }
  if (params2.search) {
    const term = params2.search

    // If the input is a URL, extract the slug and search by it exactly.
    const slug = extractSlugFromInput(term)

    if (slug) {
      // URL input — match by exact slug only (slugs are unique)
      where.slug = slug
    } else {
      // Non-URL input — broad search across survey fields
      where.OR = [
        { title:      { contains: term } },
        { surveyCode: { contains: term } },
        { slug:       { contains: term } },
        { touchpoint: { contains: term } },
        { campaign:   { name: { contains: term } } },
      ]

      // Numeric ID match
      if (/^\d+$/.test(term.trim())) {
        where.OR.push({ id: { equals: parseInt(term.trim()) } })
      }

      // Lifecycle status match (case-insensitive)
      const lcTerm = term.trim().toLowerCase()
      const validStatuses = ['draft', 'scheduled', 'active', 'expired', 'closed', 'archived']
      if (validStatuses.includes(lcTerm)) {
        where.OR.push({ lifecycleStatus: { equals: lcTerm.toUpperCase() } })
      }
    }
  }

  const [surveys, total] = await Promise.all([
    prisma.survey.findMany({
      where,
      include: {
        _count: { select: { responses: true, questions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params2.page - 1) * params2.pageSize,
      take: params2.pageSize,
    }),
    prisma.survey.count({ where }),
  ])

  const surveyIds = surveys.map(s => s.id)
  const npsAgg = await prisma.response.groupBy({
    by: ['surveyId'],
    where: { surveyId: { in: surveyIds }, npsScore: { not: null } },
    _avg: { npsScore: true },
    _count: { npsScore: true },
  })

  const data = surveys.map(s => {
    const agg = npsAgg.find(a => a.surveyId === s.id)
    const derived = deriveLifecycleStatus(
      s.lifecycleStatus, s.activationDate, s.expirationDate, s.closedAt,
    )
    return {
      id: `SRV-${String(s.id).padStart(4, '0')}`,
      numericId: s.id,
      title: s.title,
      status: s.status.toLowerCase(),
      lifecycleStatus: derived,
      publicUrl: s.publicUrl,
      slug: s.slug,
      surveyCode: s.surveyCode,
      createdAt: s.createdAt.toISOString(),
      expirationDate: s.expirationDate?.toISOString() ?? null,
      remainingMs: computeRemainingMs(s.expirationDate),
      responseCount: s._count.responses,
      questionCount: s._count.questions,
      npsScore: agg?._avg.npsScore ? Math.round(agg._avg.npsScore) : null,
      npsResponseCount: agg?._count.npsScore ?? 0,
    }
  })

  return NextResponse.json({
    data,
    pagination: {
      page: params2.page, pageSize: params2.pageSize, total,
      totalPages: Math.ceil(total / params2.pageSize),
    },
  })
}
