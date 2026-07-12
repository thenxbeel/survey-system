import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PublicResponseSchema } from '@/lib/validation'
import { extractClientInfo } from '@/lib/client-info'
import { deriveLifecycleStatus } from '@/lib/survey-url'
import { recordSurveyAudit } from '@/lib/audit'
import { notify } from '@/lib/notify'

/**
 * POST /api/public/surveys/[slug]/responses
 *
 * Public endpoint — NO AUTH REQUIRED. Submits a survey response.
 *
 * BUSINESS RULE (refactor):
 *   This endpoint creates ONE Response record per submission. It does NOT
 *   create or update any Customer record, and it does NOT create any
 *   Follow-up. Optional respondent info (name, email, phone) is stored
 *   directly on the Response row.
 *
 * Behavior:
 *   1. Look up the survey by slug. Reject if not found / expired / closed.
 *   2. Capture device type, browser, OS, IP, geo from request headers.
 *   3. Create ONE Response record with all provided info.
 *   4. Record a RESPONSE_RECEIVED audit log entry.
 *
 * Returns:
 *   - 201: { data: { responseId, thankYouMessage } }
 *   - 404: Survey not found
 *   - 410: Survey closed/expired
 *   - 400: Validation failed
 *   - 409: Duplicate submission (same email + survey within 5 min)
 */

function npsCategory(score: number | null | undefined): 'promoter' | 'passive' | 'detractor' | null {
  if (score === null || score === undefined) return null
  if (score >= 9) return 'promoter'
  if (score >= 7) return 'passive'
  return 'detractor'
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const survey = await prisma.survey.findUnique({
    where: { slug },
    include: {
      questions: true,
      campaign: true,
      createdBy: { select: { id: true, name: true } },
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

  const lifecycleStatus = deriveLifecycleStatus(
    survey.lifecycleStatus,
    survey.activationDate,
    survey.expirationDate,
    survey.closedAt,
  )

  if (lifecycleStatus !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'This survey is no longer accepting responses. Thank you for your interest.', code: 'CLOSED' },
      { status: 410 },
    )
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = PublicResponseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const data = parsed.data
  const clientInfo = extractClientInfo(req)

  // ── Optional respondent info (stored on the Response row only) ──
  // Per the refactor business rule: NO customer record is ever created.
  const respondentName  = data.customerName  ?? null
  const respondentEmail = data.customerEmail || null
  const respondentPhone = data.customerPhone ?? null

  // ── Duplicate-submission guard ──
  // Reject if the same email submitted this survey in the last 5 minutes.
  // Anonymous submissions (no email) are not deduplicated.
  if (respondentEmail) {
    const dup = await prisma.response.findFirst({
      where: {
        surveyId: survey.id,
        respondentEmail,
        submittedAt: { gt: new Date(Date.now() - 5 * 60 * 1000) },
      },
    })
    if (dup) {
      return NextResponse.json(
        { error: 'You have already submitted a response. Thank you for your feedback!', code: 'DUPLICATE' },
        { status: 409 },
      )
    }
  }

  // ── Resolve distribution channel ──
  const distributionChannel = data.distributionChannel || survey.campaign?.channel || 'WEB'

  // ── Create ONE Response record ──
  const created = await prisma.response.create({
    data: {
      surveyId: survey.id,
      respondentName,
      respondentEmail,
      respondentPhone,
      npsScore: data.npsScore ?? null,
      csatScore: data.csatScore ?? null,
      cesScore: data.cesScore ?? null,
      feedback: data.feedback ?? null,
      submittedAt: new Date(),
      channel: distributionChannel,
      distributionChannel: distributionChannel as any,
      campaignId: survey.campaignId,
      deviceType: clientInfo.deviceType,
      browser: clientInfo.browser,
      operatingSystem: clientInfo.operatingSystem,
      ipAddress: clientInfo.ipAddress,
      country: clientInfo.country,
      city: clientInfo.city,
      status: 'new',
      answers: data.answers?.length
        ? {
            create: data.answers.map(a => ({
              answer: a.answer,
              questionId: a.questionId,
            })),
          }
        : undefined,
    },
  })

  // ── Audit log ──
  await recordSurveyAudit(survey.id, 'RESPONSE_RECEIVED', {
    actorId: null,
    details: `Response ${created.id} received${respondentName ? ` from ${respondentName}` : ' (anonymous)'}`,
    metadata: {
      responseId: created.id,
      npsScore: created.npsScore,
      channel: distributionChannel,
      deviceType: clientInfo.deviceType,
      browser: clientInfo.browser,
    },
    ipAddress: clientInfo.ipAddress,
    userAgent: req.headers.get('user-agent'),
  })
  await recordSurveyAudit(survey.id, 'LAST_RESPONSE', {
    actorId: null,
    details: `Last response received at ${created.submittedAt.toISOString()}`,
  })

  // ── Notify the survey owner that a new response was received ──────────
  // Best-effort: a notification failure must not break response submission.
  try {
    const totalResponses = await prisma.response.count({ where: { surveyId: survey.id } })
    const isDetractor = created.npsScore !== null && created.npsScore <= 6
    const isMilestone = [10, 50, 100, 500, 1000].includes(totalResponses)
    
    const npsLabel = created.npsScore != null
      ? ` (NPS ${created.npsScore})`
      : ''
      
    if (isDetractor) {
      await notify({
        userId: survey.createdById,
        title: '⚠️ Urgent Feedback Alert',
        message: `"${survey.title}" received a critical detractor score${npsLabel}.${respondentName ? ` From ${respondentName}.` : ''}`,
        category: 'alert',
        link: `/dashboard/responses`,
      })
    } else if (isMilestone) {
      await notify({
        userId: survey.createdById,
        title: '🎉 Survey Milestone Reached!',
        message: `Congratulations! "${survey.title}" just hit ${totalResponses} total responses!`,
        category: 'system',
        link: `/dashboard/responses`,
      })
    } else {
      // Standard notification
      await notify({
        userId: survey.createdById,
        title: 'New Survey Response',
        message: `"${survey.title}" received a new response${npsLabel}.${respondentName ? ` From ${respondentName}.` : ''}`,
        category: 'response',
        link: `/dashboard/responses`,
      })
    }
  } catch { /* non-fatal */ }

  return NextResponse.json({
    data: {
      responseId: created.id,
      npsCategory: npsCategory(created.npsScore),
      thankYouMessage: 'Thank you for your feedback! Your input helps us improve.',
    },
  }, { status: 201 })
}
