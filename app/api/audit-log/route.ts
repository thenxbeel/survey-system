import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { parsePagination } from '@/lib/validation'
import { AUDIT_ACTION_LABELS } from '@/lib/audit'
import { extractSlugFromInput } from '@/lib/survey-search'

/**
 * GET /api/audit-log
 *
 * Global survey audit log — visible only to authenticated employees/admins.
 *
 * Query params:
 *   - surveyId: filter to a specific survey
 *   - action:   filter to a specific action (e.g. "SURVEY_PUBLISHED")
 *   - actorId:  filter to a specific user
 *   - dateFrom, dateTo
 *   - search:   free-text search — supports full survey URLs (auto-extracts
 *               slug), survey slug/code/title/ID, action labels, and details
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = parsePagination(req.nextUrl.searchParams)
  const surveyId = req.nextUrl.searchParams.get('surveyId')
  const action   = req.nextUrl.searchParams.get('action')
  const actorId  = req.nextUrl.searchParams.get('actorId')
  const dateFrom = req.nextUrl.searchParams.get('dateFrom')
  const dateTo   = req.nextUrl.searchParams.get('dateTo')

  const where: any = {}
  if (surveyId) {
    const parsedId = parseInt(surveyId)
    if (!isNaN(parsedId) && /^\d+$/.test(surveyId)) {
      where.surveyId = parsedId
    } else {
      where.survey = {
        OR: [
          { surveyCode: surveyId },
          { slug: surveyId }
        ]
      }
    }
  }
  if (action && action !== 'all') where.action = action.toUpperCase()
  if (actorId) where.actorId = parseInt(actorId)
  if (dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) }
  if (dateTo)   where.createdAt = { ...where.createdAt, lte: new Date(dateTo + 'T23:59:59') }

  if (params.search) {
    const term = params.search.trim()

    // ── URL detection ──
    // If the user pasted a full public survey URL, extract the slug and
    // match audit logs whose survey has that exact slug.
    const slugFromUrl = extractSlugFromInput(term)

    if (slugFromUrl) {
      // URL input — match logs whose survey has the exact slug.
      // Also match the raw URL string against details (in case the URL was
      // logged in the details field when it was generated / shared).
      where.OR = [
        { survey: { slug: slugFromUrl } },
        { details: { contains: slugFromUrl } },
      ]
    } else {
      // Non-URL input — broad search across details + survey fields + action.
      // Try to parse a numeric survey ID from the search query.
      const parsedSurveyId = parseInt(term.replace(/^SRV-?/i, ''))
      const isValidSurveyId = !isNaN(parsedSurveyId) && parsedSurveyId > 0 && /^\d+$/.test(term.trim().replace(/^SRV-?/i, ''))

      const orConditions: any[] = [
        { details: { contains: term } },
        { survey: { title:      { contains: term } } },
        { survey: { surveyCode: { contains: term } } },
        { survey: { slug:       { contains: term } } },
        // Search by actor name (relational)
        { actor: { name:  { contains: term } } },
        { actor: { email: { contains: term } } },
      ]

      // Numeric survey ID match
      if (isValidSurveyId) {
        orConditions.push({ surveyId: parsedSurveyId })
      }

      // Action match (case-insensitive) — e.g. "SURVEY_PUBLISHED" or "published"
      const upperTerm = term.toUpperCase()
      const validActions = Object.keys(AUDIT_ACTION_LABELS)
      if (validActions.includes(upperTerm)) {
        orConditions.push({ action: upperTerm })
      }
      // Also match action labels (case-insensitive) — e.g. "Survey Published"
      const lowerTerm = term.toLowerCase()
      for (const [actionValue, actionLabel] of Object.entries(AUDIT_ACTION_LABELS)) {
        if (actionLabel.toLowerCase().includes(lowerTerm)) {
          orConditions.push({ action: actionValue })
        }
      }

      where.OR = orConditions
    }
  }

  const [logs, total] = await Promise.all([
    prisma.surveyAuditLog.findMany({
      where,
      include: {
        survey: { select: { id: true, title: true, slug: true } },
        actor:  { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.surveyAuditLog.count({ where }),
  ])

  const data = logs.map(log => ({
    id: log.id,
    surveyId: log.surveyId,
    surveyTitle: log.survey?.title ?? null,
    surveySlug: log.survey?.slug ?? null,
    action: log.action,
    actionLabel: AUDIT_ACTION_LABELS[log.action] ?? log.action,
    details: log.details,
    metadata: log.metadata ? safeJsonParse(log.metadata) : null,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    actor: log.actor ? { id: log.actor.id, name: log.actor.name, email: log.actor.email } : null,
    createdAt: log.createdAt.toISOString(),
  }))

  return NextResponse.json({
    data,
    pagination: {
      page: params.page, pageSize: params.pageSize, total,
      totalPages: Math.ceil(total / params.pageSize),
    },
    actions: Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => ({ value, label })),
  })
}

function safeJsonParse(s: string): unknown {
  try { return JSON.parse(s) } catch { return s }
}
