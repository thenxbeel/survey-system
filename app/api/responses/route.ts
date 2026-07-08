import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { CreateResponseSchema, parsePagination } from '@/lib/validation'
import { extractSlugFromInput } from '@/lib/survey-search'

// GET /api/responses — list with pagination, search, filtering
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = parsePagination(req.nextUrl.searchParams)
  const surveyId    = req.nextUrl.searchParams.get('surveyId')
  const touchpoint  = req.nextUrl.searchParams.get('touchpoint')
  const npsCategory = req.nextUrl.searchParams.get('npsCategory')
  const status      = req.nextUrl.searchParams.get('status')
  const channel     = req.nextUrl.searchParams.get('channel')
  const campaignId  = req.nextUrl.searchParams.get('campaignId')
  const createdBy   = req.nextUrl.searchParams.get('createdBy')
  const scoreMin    = req.nextUrl.searchParams.get('scoreMin')
  const scoreMax    = req.nextUrl.searchParams.get('scoreMax')
  const dateFrom    = req.nextUrl.searchParams.get('dateFrom')
  const dateTo      = req.nextUrl.searchParams.get('dateTo')
  const branch      = req.nextUrl.searchParams.get('branch')
  const department  = req.nextUrl.searchParams.get('department')
  const assignedToId = req.nextUrl.searchParams.get('assignedToId')

  const where: any = {}
  if (params.search) {
    const s = params.search.trim()
    const sLower = s.toLowerCase()

    // ── URL detection ──
    // If the user pasted a full public survey URL (e.g.
    // http://172.30.1.136:3000/survey/hola-amigo-6efdlw), extract the slug
    // and search by it exactly. This avoids false positives from matching
    // the raw URL against respondent names / feedback text.
    const slugFromUrl = extractSlugFromInput(s)

    if (slugFromUrl) {
      // URL input — match responses whose survey has the exact slug.
      // Slugs are unique, so this returns ONLY responses for that survey.
      where.survey = { slug: slugFromUrl }
    } else {
      // Non-URL input — broad search across response + survey fields.
      // Try to parse a numeric survey ID from the search query.
      // Supports: "SRV-0001", "SRV0001", "0001", "1", "srv-1"
      const surveyIdMatch = s.replace(/^SRV-?/i, '').replace(/^srv/i, '')
      const parsedSurveyId = parseInt(surveyIdMatch)
      const isValidSurveyId = !isNaN(parsedSurveyId) && parsedSurveyId > 0

      // Try to parse a numeric response ID
      const responseIdMatch = s.replace(/^RSP-?/i, '').replace(/^rsp/i, '')
      const parsedResponseId = parseInt(responseIdMatch)
      const isValidResponseId = !isNaN(parsedResponseId) && parsedResponseId > 0

      const orConditions: any[] = [
        { respondentName:  { contains: s } },
        { respondentEmail: { contains: s } },
        { feedback:        { contains: s } },
        // Search by survey title (relational)
        { survey: { title: { contains: s } } },
        // Search by survey code (relational)
        { survey: { surveyCode: { contains: s } } },
        // Search by survey slug (relational)
        { survey: { slug: { contains: s } } },
        // Search by survey touchpoint (relational)
        { survey: { touchpoint: { contains: s } } },
        // Search by campaign name (via survey → campaign)
        { survey: { campaign: { name: { contains: s } } } },
        // Search by survey owner name (relational)
        { survey: { createdBy: { name: { contains: s } } } },
      ]

      // Add numeric ID searches if the query looks like an ID
      if (isValidSurveyId) {
        orConditions.push({ surveyId: parsedSurveyId })
      }
      if (isValidResponseId) {
        orConditions.push({ id: parsedResponseId })
      }

      // Lifecycle status match (case-insensitive) — e.g. "active", "draft"
      const validStatuses = ['draft', 'scheduled', 'active', 'expired', 'closed', 'archived']
      if (validStatuses.includes(sLower)) {
        orConditions.push({ survey: { lifecycleStatus: sLower.toUpperCase() } })
      }

      where.OR = orConditions
    }
  }
  if (surveyId) where.surveyId = parseInt(surveyId.replace(/^SRV-/, '') || surveyId)
  if (status && status !== 'all') where.status = status
  if (channel && channel !== 'all') where.distributionChannel = channel.toUpperCase()
  if (campaignId) where.campaignId = parseInt(campaignId)
  if (createdBy) where.survey = { createdById: parseInt(createdBy) }
  if (scoreMin) where.npsScore = { ...where.npsScore, gte: parseInt(scoreMin) }
  if (scoreMax) where.npsScore = { ...where.npsScore, lte: parseInt(scoreMax) }
  if (dateFrom) where.submittedAt = { ...where.submittedAt, gte: new Date(dateFrom) }
  if (dateTo)   where.submittedAt = { ...where.submittedAt, lte: new Date(dateTo + 'T23:59:59') }

  if (npsCategory && npsCategory !== 'all') {
    if (npsCategory === 'promoter')  where.npsScore = { gte: 9,  lte: 10 }
    if (npsCategory === 'passive')   where.npsScore = { gte: 7,  lte: 8  }
    if (npsCategory === 'detractor') where.npsScore = { gte: 0,  lte: 6  }
  }

  if (assignedToId) {
    if (assignedToId === 'unassigned') {
      where.assignedToId = null
    } else if (assignedToId === 'assigned') {
      where.assignedToId = { not: null }
    } else {
      where.assignedToId = parseInt(assignedToId)
    }
  }

  // Build survey filter — touchpoint, branch, and department all filter
  // through the Survey's relations (Survey.touchpoint, Survey.createdBy.branch,
  // Survey.createdBy.department)
  const surveyWhere: any = {}
  if (touchpoint && touchpoint.toLowerCase() !== 'all') {
    surveyWhere.touchpoint = touchpoint
  }
  if (branch && branch.toLowerCase() !== 'all' && branch !== 'All Branches') {
    surveyWhere.branch = branch
  }
  if (department && department.toLowerCase() !== 'all' && department !== 'All Departments') {
    surveyWhere.department = department
  }
  if (Object.keys(surveyWhere).length > 0) {
    where.survey = { ...where.survey, ...surveyWhere }
  }

  const orderBy: any = { submittedAt: 'desc' }
  if (params.sort === 'npsScore') orderBy.npsScore = params.sortDir

  const [responses, total] = await Promise.all([
    prisma.response.findMany({
      where,
      include: {
        survey: {
          select: {
            id: true, title: true, touchpoint: true, slug: true, publicUrl: true,
            surveyCode: true,
            branch: true,
            createdBy: { select: { id: true, name: true, employeeId: true, department: { select: { name: true } } } },
          },
        },
        campaign: { select: { id: true, name: true, channel: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.response.count({ where }),
  ])

  const data = responses.map(r => {
    const score = r.npsScore
    const category = score != null ? (score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor') : null
    return {
      id: `RSP-${String(r.id).padStart(5, '0')}`,
      numericId: r.id,
      respondentName: r.respondentName ?? 'Anonymous',
      respondentEmail: r.respondentEmail ?? '',
      respondentPhone: r.respondentPhone ?? '',
      surveyId: r.surveyId,
      surveyTitle: r.survey.title,
      surveyUrl: r.survey.publicUrl ?? null,
      surveySlug: r.survey.slug ?? null,
      surveyCode: r.survey.surveyCode ?? null,
      touchpoint: r.survey.touchpoint,
      surveyBranch: r.survey.branch ?? '—',
      // ── Ownership ──
      createdById: r.survey.createdBy?.id ?? null,
      createdByName: r.survey.createdBy?.name ?? null,
      createdByEmployeeId: r.survey.createdBy?.employeeId ?? null,
      createdByDepartment: r.survey.createdBy?.department?.name ?? null,
      // ── Campaign / Channel ──
      campaign: r.campaign ? { id: r.campaign.id, name: r.campaign.name, channel: r.campaign.channel } : null,
      distributionChannel: r.distributionChannel?.toLowerCase() ?? 'web',
      channel: r.channel ?? r.distributionChannel?.toLowerCase() ?? 'web',
      // ── Scores ──
      npsScore: r.npsScore,
      npsCategory: category,
      csatScore: r.csatScore,
      cesScore: r.cesScore,
      feedback: r.feedback,
      status: r.status,
      assignedToId: r.assignedToId,
      assignedToName: r.assignedTo?.name ?? null,
      assignedAt: r.assignedAt,
      // ── Device info ──
      deviceType: r.deviceType,
      browser: r.browser,
      operatingSystem: r.operatingSystem,
      ipAddress: r.ipAddress,
      country: r.country,
      city: r.city,
      // ── Timestamps ──
      submittedAt: r.submittedAt.toISOString(),
      submissionDate: r.submittedAt.toISOString().split('T')[0],
      submissionTime: r.submittedAt.toISOString().split('T')[1]?.slice(0, 8),
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

// POST /api/responses — internal response creation (authenticated)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateResponseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { answers, distributionChannel, campaignId, ...responseData } = parsed.data

  // Auto-resolve campaign from survey if not specified
  let resolvedCampaignId = campaignId ?? null
  if (!resolvedCampaignId) {
    const survey = await prisma.survey.findUnique({
      where: { id: responseData.surveyId },
      select: { campaignId: true },
    })
    if (survey?.campaignId) resolvedCampaignId = survey.campaignId
  }

  // Per the refactor business rule: create ONE Response record only.
  // No Customer record is created. Optional respondent info is stored
  // directly on the Response row.
  const created = await prisma.response.create({
    data: {
      surveyId: responseData.surveyId,
      respondentName:  responseData.customerName  ?? null,
      respondentEmail: responseData.customerEmail || null,
      respondentPhone: responseData.customerPhone ?? null,
      npsScore: responseData.npsScore ?? null,
      csatScore: responseData.csatScore ?? null,
      cesScore: responseData.cesScore ?? null,
      feedback: responseData.feedback ?? null,
      status: 'new',
      submittedAt: new Date(),
      distributionChannel: (distributionChannel as any) ?? 'WEB',
      campaignId: resolvedCampaignId,
      answers: answers?.length ? {
        create: answers.map(a => ({ answer: a.answer, questionId: a.questionId })),
      } : undefined,
    },
  })

  return NextResponse.json({ data: { id: created.id } }, { status: 201 })
}
