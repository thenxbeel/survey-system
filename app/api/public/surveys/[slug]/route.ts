import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deriveLifecycleStatus } from '@/lib/survey-url'

/**
 * GET /api/public/surveys/[slug]
 *
 * Public endpoint — NO AUTH REQUIRED. Returns a sanitized survey payload
 * suitable for rendering the customer-facing survey page.
 *
 * Never exposes:
 *   - Internal notes / audit logs / analytics
 *   - Employee information (name, email, employeeId)
 *   - Other customers' responses
 *
 * Returns:
 *   - 200 OK: { data: { title, description, questions, ... } }
 *   - 404: Survey not found / not published
 *   - 410: Survey expired / closed / archived — client shows the
 *          "no longer accepting responses" message
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const survey = await prisma.survey.findUnique({
    where: { slug },
    include: {
      questions: {
        include: { options: true },
        orderBy: { displayOrder: 'asc' },
      },
      campaign: { select: { id: true, name: true, channel: true } },
    },
  })

  if (!survey) {
    return NextResponse.json(
      { error: 'Survey not found', code: 'NOT_FOUND' },
      { status: 404 },
    )
  }

  // ── Enforce Private Visibility ──
  if (survey.visibility === 'PRIVATE') {
    const { getCurrentUser } = await import('@/lib/auth/session')
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json(
        { error: 'This survey is private and requires you to be logged in.', code: 'UNAUTHORIZED' },
        { status: 401 },
      )
    }
  }

  // Derive the effective lifecycle (auto-expire if past expirationDate)
  const lifecycleStatus = deriveLifecycleStatus(
    survey.lifecycleStatus,
    survey.activationDate,
    survey.expirationDate,
    survey.closedAt,
  )

  // Auto-persist EXPIRED transition so the next request is fast and the
  // admin UI reflects the change. We only persist if the survey was
  // previously ACTIVE and the derived status is now EXPIRED.
  if (lifecycleStatus === 'EXPIRED' && survey.lifecycleStatus === 'ACTIVE') {
    await prisma.survey.update({
      where: { id: survey.id },
      data: { lifecycleStatus: 'EXPIRED' },
    }).catch(() => { /* ignore — derivation handles it anyway */ })
  }

  // If the survey is still a DRAFT or SCHEDULED, treat it as not-yet-available
  // to the public.
  if (lifecycleStatus === 'DRAFT' || lifecycleStatus === 'SCHEDULED' || lifecycleStatus === 'ARCHIVED') {
    return NextResponse.json(
      { error: 'This survey is not yet accepting responses.', code: 'NOT_AVAILABLE' },
      { status: 410 },
    )
  }

  if (lifecycleStatus === 'EXPIRED' || lifecycleStatus === 'CLOSED') {
    return NextResponse.json(
      {
        error: 'This survey is no longer accepting responses. Thank you for your interest.',
        code: 'CLOSED',
        data: {
          title: survey.title,
          lifecycleStatus,
          closedMessage: 'This survey is no longer accepting responses. Thank you for your interest.',
        },
      },
      { status: 410 },
    )
  }

  // [DEBUG] TODO: Remove after confirming production behavior
  console.log('[DEBUG] PUBLIC SURVEY SETTINGS:', {
    slug: survey.slug,
    title: survey.title,
    isAnonymous: survey.isAnonymous,
    requireContactInfo: survey.requireContactInfo,
  })

  return NextResponse.json({
    data: {
      // ── Public identity ──
      slug: survey.slug,
      surveyCode: survey.surveyCode,
      title: survey.title,
      description: survey.description,
      // ── Branding hint (used by the public page header) ──
      touchpoint: survey.touchpoint,
      category: survey.category,
      requireContactInfo: survey.requireContactInfo,
      // ── Behavior ──
      isAnonymous: survey.isAnonymous,
      // ── Availability (for the customer-side countdown) ──
      activationDate: survey.activationDate?.toISOString() ?? null,
      expirationDate: survey.expirationDate?.toISOString() ?? null,
      lifecycleStatus,
      // ── Campaign (so the customer side can log the channel) ──
      campaign: survey.campaign
        ? { id: survey.campaign.id, name: survey.campaign.name, channel: survey.campaign.channel }
        : null,
      // ── Questions — the only structured data the customer needs ──
      questions: survey.questions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        required: q.required,
        displayOrder: q.displayOrder,
        options: q.options.map(o => ({ id: o.id, value: o.value })),
      })),
      // ── Estimated completion time (1 min per 3 questions, min 1) ──
      estimatedMinutes: Math.max(1, Math.ceil(survey.questions.length / 3)),
    },
  })
}
