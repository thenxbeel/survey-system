import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getScopeFilters } from '@/lib/auth/session'
import { CreateSurveySchema, parsePagination } from '@/lib/validation'
import { deriveLifecycleStatus, computeRemainingMs } from '@/lib/survey-url'
import { generateSurveyUrlBundle } from '@/lib/survey-qr'
import { recordSurveyAudit } from '@/lib/audit'
import { notify } from '@/lib/notify'

// NOTE: `buildRequestOrigin(req)` was removed — survey URLs now use the
// centralized getAppBaseUrl() helper from lib/app-url.ts which resolves
// NEXT_PUBLIC_APP_URL → auto-detected LAN IP → localhost fallback. This
// ensures every generated URL works from any device on the network.

// GET /api/surveys — list with pagination, search, filtering
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = parsePagination(req.nextUrl.searchParams)
  const status     = req.nextUrl.searchParams.get('status')
  const touchpoint = req.nextUrl.searchParams.get('touchpoint')
  const branch     = req.nextUrl.searchParams.get('branch')
  const createdBy  = req.nextUrl.searchParams.get('createdBy') // user id filter (admin)
  const lifecycle  = req.nextUrl.searchParams.get('lifecycle') // new lifecycle filter
  const campaignId = req.nextUrl.searchParams.get('campaignId')

  const isAdmin = user.role === 'Admin'

  const where: any = {
    ...getScopeFilters(user)
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { description: { contains: params.search } },
      { surveyCode: { contains: params.search } },
      { slug: { contains: params.search } },
    ]
  }
  if (status && status !== 'all') where.status = status.toUpperCase()
  if (lifecycle && lifecycle !== 'all') where.lifecycleStatus = lifecycle.toUpperCase()
  if (touchpoint && touchpoint !== 'all') where.touchpoint = touchpoint
  if (branch && branch !== 'all' && branch !== 'All Branches') {
    if (where.branch) {
      const allowed = where.branch.in
      if (allowed.includes(branch)) {
        where.branch = branch
      } else {
        where.branch = 'UNAUTHORIZED_BRANCH_ACCESS'
      }
    } else {
      where.branch = branch
    }
  }
  if (campaignId) where.campaignId = parseInt(campaignId)
  // Admin-only filter: filter by specific user
  if (isAdmin && createdBy) where.createdById = parseInt(createdBy)

  const orderBy: any = {}
  if (params.sort === 'title') orderBy.title = params.sortDir
  else if (params.sort === 'responseCount') orderBy.responses = { _count: params.sortDir }
  else orderBy.updatedAt = 'desc'

  const [surveys, total] = await Promise.all([
    prisma.survey.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true, employeeId: true, department: { select: { name: true } }, role: { select: { name: true } } } },
        lastModifiedBy: { select: { id: true, name: true } },
        campaign: { select: { id: true, name: true, channel: true } },
        _count: { select: { responses: true, questions: true } },
      },
      orderBy,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.survey.count({ where }),
  ])

  // Compute NPS + response rate for each survey
  const surveyIds = surveys.map(s => s.id)
  const responsesAgg = await prisma.response.groupBy({
    by: ['surveyId'],
    where: { surveyId: { in: surveyIds }, npsScore: { not: null } },
    _count: { npsScore: true },
    _avg:   { npsScore: true },
  })
  const lastResponseBySurvey = await prisma.response.groupBy({
    by: ['surveyId'],
    where: { surveyId: { in: surveyIds } },
    _max: { submittedAt: true },
  })

  const data = surveys.map(s => {
    const responseCount = s._count.responses
    const questionCount = s._count.questions
    const npsAgg = responsesAgg.find(a => a.surveyId === s.id)
    const lastResp = lastResponseBySurvey.find(r => r.surveyId === s.id)
    const derivedLifecycle = deriveLifecycleStatus(
      s.lifecycleStatus,
      s.activationDate,
      s.expirationDate,
      s.closedAt,
    )
    const remainingMs = computeRemainingMs(s.expirationDate)
    return {
      id: `SRV-${String(s.id).padStart(4, '0')}`,
      numericId: s.id,
      title: s.title,
      description: s.description ?? '',
      touchpoint: s.touchpoint,
      category: s.category,
      status: s.status.toLowerCase(),
      lifecycleStatus: derivedLifecycle,
      visibility: s.visibility.toLowerCase(),
      isAnonymous: s.isAnonymous,
      requireContactInfo: s.requireContactInfo,
      branch: s.branch || 'All Branches',
      department: s.department || null,
      questionCount,
      responseCount,
      responseRate: responseCount > 0 ? Math.round(((npsAgg?._count.npsScore ?? 0) / responseCount) * 100) : 0,
      npsScore: npsAgg?._avg.npsScore ? Math.round(npsAgg._avg.npsScore) : null,
      npsResponseCount: npsAgg?._count.npsScore ?? 0,
      // ── Ownership ──
      createdById: s.createdBy.id,
      createdByName: s.createdBy.name,
      createdByEmail: s.createdBy.email,
      createdByEmployeeId: s.createdBy.employeeId,
      createdByDepartment: s.createdBy.department?.name ?? null,
      createdByRole: s.createdBy.role?.name ?? null,
      lastModifiedById: s.lastModifiedBy?.id ?? null,
      lastModifiedByName: s.lastModifiedBy?.name ?? null,
      // ── URL / QR ──
      slug: s.slug,
      publicUrl: s.publicUrl,
      qrCode: s.qrCode,
      surveyCode: s.surveyCode,
      // ── Availability ──
      activationDate: s.activationDate?.toISOString() ?? null,
      expirationDate: s.expirationDate?.toISOString() ?? null,
      closedAt: s.closedAt?.toISOString() ?? null,
      remainingMs,
      // ── Campaign ──
      campaign: s.campaign ? { id: s.campaign.id, name: s.campaign.name, channel: s.campaign.channel } : null,
      // ── Last response ──
      lastResponseAt: lastResp?._max.submittedAt?.toISOString() ?? null,
      // ── Timestamps ──
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      expiryDate: s.expiryDate?.toISOString() ?? null,
    }
  })

  return NextResponse.json({
    data,
    pagination: {
      page: params.page, pageSize: params.pageSize, total,
      totalPages: Math.ceil(total / params.pageSize),
    },
  })
}

// POST /api/surveys — create
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateSurveySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const {
    questions, expiryDate, publish,
    isAnonymous, campaignId, activationDate, expirationDate,
    availabilityMode, expiresInDays, distributionChannel,
    ...surveyData
  } = parsed.data

  // Compute availability dates from the requested mode
  const now = new Date()
  let computedActivation: Date | null = null
  let computedExpiration: Date | null = null

  if (publish) {
    computedActivation = activationDate ? new Date(activationDate) : now
    if (availabilityMode === 'expires' && expiresInDays) {
      computedExpiration = new Date(computedActivation.getTime() + expiresInDays * 86400000)
    } else if (availabilityMode === 'custom' && expirationDate) {
      computedExpiration = new Date(expirationDate)
    } else if (availabilityMode === 'always') {
      computedExpiration = null
    } else if (expirationDate) {
      computedExpiration = new Date(expirationDate)
    }

    // If a future activationDate was set, lifecycle = SCHEDULED
    if (activationDate && new Date(activationDate).getTime() > now.getTime()) {
      // leave lifecycle as SCHEDULED
    }
  }

  const lifecycleStatus = publish
    ? (computedActivation && computedActivation.getTime() > now.getTime() ? 'SCHEDULED' : 'ACTIVE')
    : 'DRAFT'

  // Generate URL/QR bundle on publish
  let urlBundle: { slug: string; surveyCode: string; publicUrl: string; qrCode: string } | null = null
  if (publish) {
    urlBundle = await generateSurveyUrlBundle(surveyData.title)
  }

  // [DEBUG] TODO: Remove after confirming production behavior
  console.log('[DEBUG] CREATING SURVEY - identity settings:', {
    isAnonymous,
    requireContactInfo: surveyData.requireContactInfo,
    title: surveyData.title,
  })

  const created = await prisma.survey.create({
    data: {
      ...surveyData,
      // Admins can specify the department and branch. Non-admins are locked to their own.
      department: user.role === 'Admin' ? (surveyData.department ?? user.department ?? null) : (user.department ?? null),
      branch: user.role === 'Admin' ? (surveyData.branch ?? user.branch ?? null) : (user.branch ?? null),
      status: publish ? 'PUBLISHED' : 'DRAFT',
      lifecycleStatus,
      visibility: surveyData.visibility as any,
      isAnonymous,
      requireContactInfo: surveyData.requireContactInfo ?? false,
      campaignId: campaignId ?? null,
      activationDate: computedActivation,
      expirationDate: computedExpiration,
      expiryDate: expiryDate ? new Date(expiryDate) : computedExpiration,
      createdById: user.id,
      lastModifiedById: user.id,
      slug: urlBundle?.slug ?? null,
      surveyCode: urlBundle?.surveyCode ?? null,
      publicUrl: urlBundle?.publicUrl ?? null,
      qrCode: urlBundle?.qrCode ?? null,
      questions: questions?.length ? {
        create: questions.map((q, i) => ({
          question: q.question,
          type: q.type,
          required: q.required,
          displayOrder: q.displayOrder ?? i,
          options: q.options?.length ? { create: q.options.map(o => ({ value: o.value })) } : undefined,
        })),
      } : undefined,
    },
    include: { questions: { include: { options: true } } },
  })

  // [DEBUG] TODO: Remove after confirming production behavior
  console.log('[DEBUG] CREATED SURVEY SETTINGS:', {
    id: created.id,
    title: created.title,
    isAnonymous: created.isAnonymous,
    requireContactInfo: created.requireContactInfo,
  })

  // Audit log
  await recordSurveyAudit(created.id, 'SURVEY_CREATED', {
    actorId: user.id,
    details: `Created survey "${created.title}"`,
    userAgent: req.headers.get('user-agent') ?? null,
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
  })

  if (publish) {
    await recordSurveyAudit(created.id, 'SURVEY_PUBLISHED', {
      actorId: user.id,
      details: `Survey published with lifecycle ${lifecycleStatus}`,
      metadata: { availabilityMode, expiresInDays, distributionChannel },
    })
    if (urlBundle) {
      await recordSurveyAudit(created.id, 'URL_GENERATED', {
        actorId: user.id,
        details: `Public URL generated: ${urlBundle.publicUrl}`,
      })
      await recordSurveyAudit(created.id, 'QR_GENERATED', {
        actorId: user.id,
        details: `QR code generated (${urlBundle.surveyCode})`,
      })
    }
  }

  // Also record in the legacy ActivityLog table for backwards compat with the
  // existing dashboard activity feed.
  await prisma.activityLog.create({
    data: { action: 'SURVEY_CREATED', entity: 'Survey', entityId: created.id, details: `Created survey "${created.title}"`, userId: user.id },
  })

  // ── Push a user-facing notification for the survey owner ─────────────────
  // Best-effort: a notification failure must not break survey creation.
  try {
    if (publish) {
      await notify({
        userId: user.id,
        title: 'Survey Published',
        message: `"${created.title}" is now live${created.publicUrl ? ` at ${created.publicUrl}` : ''}.`,
        category: 'survey',
        link: created.slug ? `/dashboard/surveys/${created.id}/published` : '/dashboard/surveys',
      })
    } else {
      await notify({
        userId: user.id,
        title: 'Survey Created',
        message: `Draft survey "${created.title}" was saved.`,
        category: 'survey',
        link: '/dashboard/surveys',
      })
    }
  } catch { /* non-fatal */ }

  return NextResponse.json({
    data: {
      id: created.id,
      title: created.title,
      status: created.status,
      lifecycleStatus: created.lifecycleStatus,
      slug: created.slug,
      publicUrl: created.publicUrl,
      surveyCode: created.surveyCode,
      qrCode: created.qrCode ? true : false, // boolean flag for client
    },
  }, { status: 201 })
}
