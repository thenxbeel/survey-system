import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// GET /api/responses/:id — full detail with survey info, answers, device info
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^RSP-/, '')) || parseInt(id)

  const r = await prisma.response.findUnique({
    where: { id: numericId },
    include: {
      survey: {
        include: {
          questions: { include: { options: true }, orderBy: { displayOrder: 'asc' } },
          createdBy: { select: { id: true, name: true, email: true, employeeId: true, department: { select: { name: true } }, role: { select: { name: true } } } },
          campaign: { select: { id: true, name: true, channel: true } },
        },
      },
      campaign: { select: { id: true, name: true, channel: true } },
      answers: { include: { question: true } },
    },
  })
  if (!r) return NextResponse.json({ error: 'Response not found' }, { status: 404 })

  // ── Department access control ──────────────────────────────────────────
  const isAdminRespDetail = user.role === 'Admin'
  if (!isAdminRespDetail && r.survey.department && r.survey.department !== user.department) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const score = r.npsScore
  const category = score != null ? (score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor') : null

  return NextResponse.json({
    data: {
      id: `RSP-${String(r.id).padStart(5, '0')}`,
      numericId: r.id,

      // ── Survey Information ──
      surveyInfo: {
        surveyName: r.survey.title,
        surveyUrl: r.survey.publicUrl ?? null,
        surveySlug: r.survey.slug ?? null,
        surveyCode: r.survey.surveyCode ?? null,
        surveyId: `SRV-${String(r.survey.id).padStart(4, '0')}`,
        surveyNumericId: r.survey.id,
        campaignName: r.campaign?.name ?? r.survey.campaign?.name ?? null,
        campaignId: r.campaignId ?? r.survey.campaignId ?? null,
        distributionChannel: r.distributionChannel?.toLowerCase() ?? 'web',
        createdDate: r.survey.createdAt.toISOString(),
        submittedDate: r.submittedAt.toISOString(),
        surveyStatus: r.survey.lifecycleStatus.toLowerCase(),
        touchpoint: r.survey.touchpoint,
      },

      // ── Response Information ──
      responseInfo: {
        responseId: `RSP-${String(r.id).padStart(5, '0')}`,
        npsScore: r.npsScore,
        npsCategory: category,
        csatScore: r.csatScore,
        cesScore: r.cesScore,
        feedback: r.feedback,
        submissionTimestamp: r.submittedAt.toISOString(),
        submissionDate: r.submittedAt.toISOString().split('T')[0],
        submissionTime: r.submittedAt.toISOString().split('T')[1]?.slice(0, 8),
        device: r.deviceType,
        browser: r.browser,
        operatingSystem: r.operatingSystem,
        ipAddress: r.ipAddress,
        country: r.country,
        city: r.city,
      },

      // ── Optional respondent info (stored on the response only) ──
      respondentName: r.respondentName ?? 'Anonymous',
      respondentEmail: r.respondentEmail ?? '',
      respondentPhone: r.respondentPhone ?? '',

      // ── Owner (employee who created the survey) ──
      owner: r.survey.createdBy ? {
        id: r.survey.createdBy.id,
        name: r.survey.createdBy.name,
        email: r.survey.createdBy.email,
        employeeId: r.survey.createdBy.employeeId,
        department: r.survey.createdBy.department?.name ?? null,
        role: r.survey.createdBy.role?.name ?? null,
      } : null,

      // ── Status ──
      status: r.status,
      channel: r.channel ?? r.distributionChannel?.toLowerCase() ?? 'web',

      // ── Answers ──
      answers: r.answers.map(a => ({
        questionId: a.questionId,
        question: a.question.question,
        type: a.question.type,
        answer: a.answer,
      })),
    },
  })
}

// DELETE /api/responses/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id.replace(/^RSP-/, '')) || parseInt(id)

  await prisma.response.delete({ where: { id: numericId } })
  return NextResponse.json({ success: true, message: 'Response deleted' })
}
