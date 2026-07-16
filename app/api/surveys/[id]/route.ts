import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { UpdateSurveySchema } from '@/lib/validation'
import {
  buildPublicSurveyUrl,
  deriveLifecycleStatus,
  computeRemainingMs,
} from '@/lib/survey-url'
import {
  generateSurveyUrlBundle,
  generateQrCodeDataUrl,
} from '@/lib/survey-qr'
import { recordSurveyAudit } from '@/lib/audit'
import { notify } from '@/lib/notify'

// NOTE: `buildRequestOrigin(req)` was removed — survey URLs now use the
// centralized getAppBaseUrl() helper from lib/app-url.ts (resolved inside
// buildPublicSurveyUrl / generateSurveyUrlBundle). This ensures every
// generated URL works from any device on the network.

// GET /api/surveys/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^SRV-/, '')) || parseInt(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid survey ID' }, { status: 400 })
  }

  const survey = await prisma.survey.findUnique({
    where: { id: numericId },
    include: {
      questions: { include: { options: true }, orderBy: { displayOrder: 'asc' } },
      createdBy: {
        select: {
          id: true, name: true, email: true, employeeId: true,
          department: { select: { name: true } },
          role: { select: { name: true } },
        },
      },
      lastModifiedBy: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true, channel: true } },
      _count: { select: { responses: true } },
    },
  })
  if (!survey) return NextResponse.json({ error: 'Survey not found' }, { status: 404 })

  // ── Department & Branch visibility control ─────────────────────────────
  const isAdmin = user.role === 'Admin'
  if (!isAdmin) {
    const allowedDepts = [user.department, ...(user.visibleDepartments ?? [])].filter(Boolean) as string[]
    if (survey.department && !allowedDepts.includes(survey.department)) {
      return NextResponse.json({ error: 'Forbidden — No visibility access to this department' }, { status: 403 })
    }
  }

  const npsAgg = await prisma.response.aggregate({
    where: { surveyId: numericId, npsScore: { not: null } },
    _count: { npsScore: true },
    _avg: { npsScore: true },
  })
  const lastResponse = await prisma.response.findFirst({
    where: { surveyId: numericId },
    orderBy: { submittedAt: 'desc' },
    select: { submittedAt: true },
  })

  const derivedLifecycle = deriveLifecycleStatus(
    survey.lifecycleStatus,
    survey.activationDate,
    survey.expirationDate,
    survey.closedAt,
  )
  const remainingMs = computeRemainingMs(survey.expirationDate)

  return NextResponse.json({
    data: {
      id: `SRV-${String(survey.id).padStart(4, '0')}`,
      numericId: survey.id,
      title: survey.title,
      description: survey.description,
      touchpoint: survey.touchpoint,
      branch: survey.branch || 'All Branches',
      department: survey.department || null,
      category: survey.category,
      status: survey.status.toLowerCase(),
      lifecycleStatus: derivedLifecycle,
      visibility: survey.visibility.toLowerCase(),
      isTemplate: survey.isTemplate,
      isAnonymous: survey.isAnonymous,
      requireContactInfo: survey.requireContactInfo,
      version: survey.version,
      questionCount: survey.questions.length,
      responseCount: survey._count.responses,
      npsScore: npsAgg._avg.npsScore ? Math.round(npsAgg._avg.npsScore) : null,
      npsResponseCount: npsAgg._count.npsScore,
      lastResponseAt: lastResponse?.submittedAt.toISOString() ?? null,
      // ── Ownership ──
      createdById: survey.createdBy.id,
      createdByName: survey.createdBy.name,
      createdByEmail: survey.createdBy.email,
      createdByEmployeeId: survey.createdBy.employeeId,
      createdByDepartment: survey.createdBy.department?.name ?? null,
      createdByRole: survey.createdBy.role?.name ?? null,
      lastModifiedById: survey.lastModifiedBy?.id ?? null,
      lastModifiedByName: survey.lastModifiedBy?.name ?? null,
      // ── URL / QR ──
      slug: survey.slug,
      publicUrl: survey.publicUrl,
      qrCode: survey.qrCode,
      surveyCode: survey.surveyCode,
      // ── Availability ──
      activationDate: survey.activationDate?.toISOString() ?? null,
      expirationDate: survey.expirationDate?.toISOString() ?? null,
      closedAt: survey.closedAt?.toISOString() ?? null,
      remainingMs,
      // ── Campaign ──
      campaign: survey.campaign
        ? { id: survey.campaign.id, name: survey.campaign.name, channel: survey.campaign.channel }
        : null,
      // ── Timestamps ──
      createdAt: survey.createdAt.toISOString(),
      updatedAt: survey.updatedAt.toISOString(),
      expiryDate: survey.expiryDate?.toISOString() ?? null,
      questions: survey.questions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        required: q.required,
        displayOrder: q.displayOrder,
        options: q.options.map(o => ({ id: o.id, value: o.value })),
      })),
    },
  })
}

// PUT /api/surveys/:id — update survey fields (and optionally lifecycle status)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^SRV-/, '')) || parseInt(id)

  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid survey ID' }, { status: 400 })

  const body = await req.json()
  const parsed = UpdateSurveySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  // Fetch existing survey to check ownership and status changes
  const existingSurvey = await prisma.survey.findUnique({
    where: { id: numericId },
    select: { id: true, title: true, createdById: true, status: true, department: true, branch: true },
  })

  if (!existingSurvey) {
    return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
  }

  // ── Department & Branch action access control ──────────────────────────
  const isAdminPut = user.role === 'Admin'
  if (!isAdminPut) {
    const allowedDepts = [user.department, ...(user.accessDepartments ?? [])].filter(Boolean) as string[]
    if (existingSurvey.department && !allowedDepts.includes(existingSurvey.department)) {
      return NextResponse.json({ error: 'Forbidden — No action access to this department' }, { status: 403 })
    }
  }

  const {
    questions,
    expiryDate,
    expirationDate,
    activationDate,
    status,
    lifecycleStatus,
    publish,
    availabilityMode,
    expiresInDays,
    distributionChannel,
    ...updateData
  } = parsed.data

  // Non-admins can only change department/branch to values in their allowed action scopes
  let finalDept = existingSurvey.department
  let finalBranch = existingSurvey.branch

  if (isAdminPut) {
    finalDept = updateData.department !== undefined ? updateData.department : existingSurvey.department
    finalBranch = updateData.branch !== undefined ? updateData.branch : existingSurvey.branch
  } else {
    if (updateData.department !== undefined) {
      const allowedDepts = [user.department, ...(user.accessDepartments ?? [])].filter(Boolean) as string[]
      if (updateData.department === null || allowedDepts.includes(updateData.department)) {
        finalDept = updateData.department
      }
    }
    if (updateData.branch !== undefined) {
      const allowedBranches = [user.branch, ...(user.accessBranches ?? [])].filter(Boolean) as string[]
      if (updateData.branch === null || allowedBranches.includes(updateData.branch)) {
        finalBranch = updateData.branch
      }
    }
  }

  // Handle status changes (publish, archive)
  const { department: _dept, branch: _branch, ...safeUpdateData } = updateData as any
  const data: any = { 
    ...safeUpdateData, 
    department: finalDept,
    branch: finalBranch,
    lastModifiedById: user.id 
  }
  if (expiryDate) data.expiryDate = new Date(expiryDate)
  if (expirationDate) data.expirationDate = new Date(expirationDate)
  if (activationDate) data.activationDate = new Date(activationDate)
  if (status) {
    data.status = status.toUpperCase()
    if (status === 'published' || status === 'active') data.status = 'PUBLISHED'
    if (status === 'archived') data.status = 'ARCHIVED'
  }
  if (lifecycleStatus) data.lifecycleStatus = lifecycleStatus

  // If questions are provided, replace them
  if (questions) {
    await prisma.question.deleteMany({ where: { surveyId: numericId } })
    if (questions.length > 0) {
      data.questions = {
        create: questions.map((q, i) => ({
          question: q.question,
          type: q.type,
          required: q.required,
          displayOrder: q.displayOrder ?? i,
          options: q.options?.length ? { create: q.options.map(o => ({ value: o.value })) } : undefined,
        })),
      }
    }
  }

  const updated = await prisma.survey.update({
    where: { id: numericId },
    data,
    include: { questions: { include: { options: true } } },
  })

  // Notify creator if a collaborator changed the status
  if (existingSurvey.createdById !== user.id && existingSurvey.status !== updated.status) {
    try {
      await prisma.notification.create({
        data: {
          title: 'Survey Status Changed',
          message: `Your survey "${updated.title}" status was changed to ${updated.status} by ${user.name}.`,
          category: 'system',
          link: `/dashboard/surveys`,
          userId: existingSurvey.createdById,
        }
      })
    } catch { /* non-fatal */ }
  }

  await recordSurveyAudit(updated.id, 'SURVEY_EDITED', {
    actorId: user.id,
    details: `Survey "${updated.title}" edited`,
  })
  await recordSurveyAudit(updated.id, 'LAST_MODIFIED', {
    actorId: user.id,
    details: `Last modified by ${user.name}`,
  })

  await prisma.activityLog.create({
    data: { action: 'SURVEY_UPDATED', entity: 'Survey', entityId: numericId, userId: user.id },
  })

  return NextResponse.json({ data: { id: updated.id, title: updated.title, status: updated.status } })
}

// DELETE /api/surveys/:id
// Query param: ?force=true to hard-delete even if the survey has responses
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^SRV-/, '')) || parseInt(id)

  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid survey ID' }, { status: 400 })

  // Check if survey exists
  const survey = await prisma.survey.findUnique({ where: { id: numericId }, select: { id: true, title: true, department: true } })
  if (!survey) return NextResponse.json({ error: 'Survey not found' }, { status: 404 })

  // ── Department & Branch action access control ──────────────────────────
  const isAdminDel = user.role === 'Admin'
  if (!isAdminDel) {
    const allowedDepts = [user.department, ...(user.accessDepartments ?? [])].filter(Boolean) as string[]
    if (survey.department && !allowedDepts.includes(survey.department)) {
      return NextResponse.json({ error: 'Forbidden — No action access to this department' }, { status: 403 })
    }
  }

  const force = req.nextUrl.searchParams.get('force') === 'true'

  // Check if survey has responses
  const responseCount = await prisma.response.count({ where: { surveyId: numericId } })

  if (responseCount > 0 && !force) {
    // Archive instead of delete (preserves response data)
    await prisma.survey.update({
      where: { id: numericId },
      data: { status: 'ARCHIVED', lifecycleStatus: 'ARCHIVED', lastModifiedById: user.id },
    })
    await recordSurveyAudit(numericId, 'SURVEY_ARCHIVED', {
      actorId: user.id,
      details: `Survey archived (has ${responseCount} responses)`,
    })
    return NextResponse.json({ success: true, message: 'Survey archived (has responses)', archived: true })
  }

  // Hard delete: the schema's onDelete: Cascade will automatically remove:
  //   Question → Option, Question → Answer
  //   Response → Answer
  //   SurveyAuditLog
  // But we also explicitly delete in a transaction for safety (double protection)
  await prisma.$transaction([
    prisma.answer.deleteMany({ where: { question: { surveyId: numericId } } }),
    prisma.answer.deleteMany({ where: { response: { surveyId: numericId } } }),
    prisma.option.deleteMany({ where: { question: { surveyId: numericId } } }),
    prisma.response.deleteMany({ where: { surveyId: numericId } }),
    prisma.question.deleteMany({ where: { surveyId: numericId } }),
    prisma.surveyAuditLog.deleteMany({ where: { surveyId: numericId } }),
    prisma.survey.delete({ where: { id: numericId } }),
  ])
  await prisma.activityLog.create({
    data: { action: 'SURVEY_DELETED', entity: 'Survey', entityId: numericId, userId: user.id },
  })

  return NextResponse.json({ success: true, message: 'Survey deleted permanently' })
}

// ──────────────────────────────────────────────────────────────────────────
// PATCH /api/surveys/:id — lifecycle transitions (publish / activate /
// deactivate / reactivate / close / archive / extend / regenerate-qr).
// Action is specified via `?action=` query param. Body shape varies per action.
// ──────────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^SRV-/, '')) || parseInt(id)
  const action = req.nextUrl.searchParams.get('action') || ''

  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid survey ID' }, { status: 400 })

  const survey = await prisma.survey.findUnique({
    where: { id: numericId },
    select: { id: true, title: true, slug: true, publicUrl: true, qrCode: true, surveyCode: true,
              lifecycleStatus: true, activationDate: true, expirationDate: true, closedAt: true, department: true },
  })
  if (!survey) return NextResponse.json({ error: 'Survey not found' }, { status: 404 })

  // ── Department & Branch action access control ──────────────────────────
  const isAdminPatch = user.role === 'Admin'
  if (!isAdminPatch) {
    const allowedDepts = [user.department, ...(user.accessDepartments ?? [])].filter(Boolean) as string[]
    if (survey.department && !allowedDepts.includes(survey.department)) {
      return NextResponse.json({ error: 'Forbidden — No action access to this department' }, { status: 403 })
    }
  }

  const body = await req.json().catch(() => ({}))

  switch (action) {
    case 'publish': {
      // Generate URL/QR + transition to ACTIVE (or SCHEDULED if activationDate is in the future)
      const availabilityMode = body.availabilityMode || 'always'
      const now = new Date()
      const activation = body.activationDate ? new Date(body.activationDate) : now
      let expiration: Date | null = null
      if (availabilityMode === 'expires' && body.expiresInDays) {
        expiration = new Date(activation.getTime() + body.expiresInDays * 86400000)
      } else if (availabilityMode === 'custom' && body.expirationDate) {
        expiration = new Date(body.expirationDate)
      } else if (body.expirationDate) {
        expiration = new Date(body.expirationDate)
      }
      const willBeScheduled = activation.getTime() > now.getTime()
      const lifecycle = willBeScheduled ? 'SCHEDULED' : 'ACTIVE'

      const regenerateUrl = body.regenerateUrl || !survey.slug
      const regenerateQr  = body.regenerateQr  || !survey.qrCode

      let slug = survey.slug
      let publicUrl = survey.publicUrl
      let qrCode = survey.qrCode
      let surveyCode = survey.surveyCode

      if (regenerateUrl || !slug) {
        const bundle = await generateSurveyUrlBundle(survey.title)
        slug = bundle.slug
        publicUrl = bundle.publicUrl
        surveyCode = bundle.surveyCode
        qrCode = bundle.qrCode // bundle always includes a fresh QR
      } else if (regenerateQr) {
        qrCode = await generateQrCodeDataUrl(publicUrl || buildPublicSurveyUrl(slug!))
      }

      const updated = await prisma.survey.update({
        where: { id: numericId },
        data: {
          status: 'PUBLISHED',
          lifecycleStatus: lifecycle,
          activationDate: activation,
          expirationDate: expiration,
          expiryDate: expiration,
          slug, publicUrl, qrCode, surveyCode,
          closedAt: null,
          lastModifiedById: user.id,
        },
      })

      await recordSurveyAudit(numericId, 'SURVEY_PUBLISHED', {
        actorId: user.id, details: `Survey published (lifecycle=${lifecycle})`,
        metadata: { availabilityMode, expiresInDays: body.expiresInDays, distributionChannel: body.distributionChannel },
      })
      if (regenerateUrl || !survey.slug) {
        await recordSurveyAudit(numericId, 'URL_GENERATED', { actorId: user.id, details: `URL: ${publicUrl}` })
        await recordSurveyAudit(numericId, 'QR_GENERATED',  { actorId: user.id, details: `QR (${surveyCode})` })
      } else if (regenerateQr) {
        await recordSurveyAudit(numericId, 'QR_REGENERATED', { actorId: user.id, details: `QR regenerated for ${surveyCode}` })
      }

      // ── Notify the survey owner that the survey was published ─────────
      try {
        await notify({
          userId: user.id,
          title: 'Survey Published',
          message: `"${survey.title}" is now live${publicUrl ? ` at ${publicUrl}` : ''}.`,
          category: 'survey',
          link: `/dashboard/surveys/${numericId}/published`,
        })
      } catch { /* non-fatal */ }

      return NextResponse.json({
        data: {
          id: updated.id, lifecycleStatus: updated.lifecycleStatus,
          slug: updated.slug, publicUrl: updated.publicUrl, surveyCode: updated.surveyCode,
          activationDate: updated.activationDate?.toISOString() ?? null,
          expirationDate: updated.expirationDate?.toISOString() ?? null,
          hasQrCode: Boolean(updated.qrCode),
        },
      })
    }

    case 'activate': {
      const updated = await prisma.survey.update({
        where: { id: numericId },
        data: { lifecycleStatus: 'ACTIVE', status: 'PUBLISHED', closedAt: null, lastModifiedById: user.id },
      })
      await recordSurveyAudit(numericId, 'SURVEY_ACTIVATED', { actorId: user.id, details: `Survey activated by ${user.name}` })
      return NextResponse.json({ data: { id: updated.id, lifecycleStatus: updated.lifecycleStatus } })
    }

    case 'deactivate': {
      const updated = await prisma.survey.update({
        where: { id: numericId },
        data: { lifecycleStatus: 'CLOSED', closedAt: new Date(), lastModifiedById: user.id },
      })
      await recordSurveyAudit(numericId, 'SURVEY_DEACTIVATED', { actorId: user.id, details: `Survey deactivated by ${user.name}` })
      return NextResponse.json({ data: { id: updated.id, lifecycleStatus: updated.lifecycleStatus } })
    }

    case 'reactivate': {
      const updated = await prisma.survey.update({
        where: { id: numericId },
        data: { lifecycleStatus: 'ACTIVE', closedAt: null, lastModifiedById: user.id },
      })
      await recordSurveyAudit(numericId, 'SURVEY_REACTIVATED', { actorId: user.id, details: `Survey reactivated by ${user.name}` })
      return NextResponse.json({ data: { id: updated.id, lifecycleStatus: updated.lifecycleStatus } })
    }

    case 'close': {
      const updated = await prisma.survey.update({
        where: { id: numericId },
        data: { lifecycleStatus: 'CLOSED', closedAt: new Date(), lastModifiedById: user.id },
      })
      await recordSurveyAudit(numericId, 'SURVEY_CLOSED', { actorId: user.id })
      try {
        await notify({
          userId: user.id,
          title: 'Survey Closed',
          message: `"${survey.title}" was closed and is no longer accepting responses.`,
          category: 'survey',
          link: `/dashboard/surveys/${numericId}`,
        })
      } catch { /* non-fatal */ }
      return NextResponse.json({ data: { id: updated.id, lifecycleStatus: updated.lifecycleStatus } })
    }

    case 'archive': {
      const updated = await prisma.survey.update({
        where: { id: numericId },
        data: { lifecycleStatus: 'ARCHIVED', status: 'ARCHIVED', lastModifiedById: user.id },
      })
      await recordSurveyAudit(numericId, 'SURVEY_ARCHIVED', { actorId: user.id })
      try {
        await notify({
          userId: user.id,
          title: 'Survey Archived',
          message: `"${survey.title}" was archived.`,
          category: 'survey',
          link: `/dashboard/surveys/${numericId}`,
        })
      } catch { /* non-fatal */ }
      return NextResponse.json({ data: { id: updated.id, lifecycleStatus: updated.lifecycleStatus } })
    }

    case 'unarchive': {
      const updated = await prisma.survey.update({
        where: { id: numericId },
        data: { lifecycleStatus: 'ACTIVE', status: 'PUBLISHED', lastModifiedById: user.id },
      })
      await recordSurveyAudit(numericId, 'SURVEY_UNARCHIVED', { actorId: user.id })
      try {
        await notify({
          userId: user.id,
          title: 'Survey Unarchived',
          message: `"${survey.title}" was unarchived and is now active.`,
          category: 'survey',
          link: `/dashboard/surveys/${numericId}`,
        })
      } catch { /* non-fatal */ }
      return NextResponse.json({ data: { id: updated.id, lifecycleStatus: updated.lifecycleStatus } })
    }

    case 'extend': {
      // body: { addDays?: number, newExpirationDate?: string }
      const currentExp = survey.expirationDate ?? new Date()
      let newExp: Date
      if (body.newExpirationDate) {
        newExp = new Date(body.newExpirationDate)
      } else if (body.addDays) {
        newExp = new Date(currentExp.getTime() + body.addDays * 86400000)
      } else {
        return NextResponse.json({ error: 'Provide addDays or newExpirationDate' }, { status: 400 })
      }
      const updated = await prisma.survey.update({
        where: { id: numericId },
        data: { expirationDate: newExp, expiryDate: newExp, lastModifiedById: user.id,
                // Reactivate if previously expired
                lifecycleStatus: survey.lifecycleStatus === 'EXPIRED' ? 'ACTIVE' : undefined },
      })
      await recordSurveyAudit(numericId, 'EXPIRATION_EXTENDED', {
        actorId: user.id,
        details: `Expiration extended to ${newExp.toISOString()}`,
        metadata: { addDays: body.addDays, newExpirationDate: body.newExpirationDate },
      })
      return NextResponse.json({
        data: { id: updated.id, expirationDate: updated.expirationDate?.toISOString() },
      })
    }

    case 'regenerate-qr': {
      if (!survey.publicUrl && !survey.slug) {
        return NextResponse.json({ error: 'Survey must be published first' }, { status: 400 })
      }
      const url = survey.publicUrl || buildPublicSurveyUrl(survey.slug!)
      const qrCode = await generateQrCodeDataUrl(url)
      const updated = await prisma.survey.update({
        where: { id: numericId },
        data: { qrCode, lastModifiedById: user.id },
      })
      await recordSurveyAudit(numericId, 'QR_REGENERATED', {
        actorId: user.id, details: `QR regenerated (${survey.surveyCode})`,
      })
      return NextResponse.json({ data: { id: updated.id, hasQrCode: true } })
    }

    case 'share': {
      // body: { channel: 'EMAIL' | 'SMS' | 'WHATSAPP', recipient?: string }
      const channel = body.channel || 'DIRECT_LINK'
      await recordSurveyAudit(numericId, 'URL_SHARED', {
        actorId: user.id,
        details: `URL shared via ${channel}${body.recipient ? ` to ${body.recipient}` : ''}`,
        metadata: { channel, recipient: body.recipient },
      })
      return NextResponse.json({ success: true })
    }

    case 'copy-url': {
      // ── Copy Survey URL action ──
      // Generates the public survey URL using the centralized base URL helper
      // (lib/app-url.ts → NEXT_PUBLIC_APP_URL with LAN IP auto-detection).
      // Records a SURVEY_URL_COPIED audit log entry with the survey ID, title,
      // slug, and public URL so admins can track who copied which URL and when.
      //
      // Returns the generated URL so the client can copy it to the clipboard.
      const url = survey.publicUrl || buildPublicSurveyUrl(survey.slug!)

      await recordSurveyAudit(numericId, 'SURVEY_URL_COPIED', {
        actorId: user.id,
        details: `Survey URL copied: ${url}`,
        metadata: {
          surveyId: numericId,
          surveyTitle: survey.title,
          surveySlug: survey.slug,
          publicUrl: url,
        },
      })

      return NextResponse.json({ success: true, data: { url } })
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }
}
