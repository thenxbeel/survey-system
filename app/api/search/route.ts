import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * GET /api/search?q=<query>&limit=<n>
 *
 * Global search across Surveys, Responses, Users, and Campaigns.
 *
 * Supports searching by:
 *   - Name, title, description (case-insensitive contains)
 *   - ID codes (SRV-1004, SRV1004, RSP-00061, RSP00061, EMP001, CMP-xxx)
 *   - Email, employee ID
 *   - Touchpoint, campaign code
 *
 * The query is normalized: dashes are stripped so "SRV1004" matches "SRV-1004".
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawQ = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '8'), 50)

  if (!rawQ) {
    return NextResponse.json({ data: { surveys: [], responses: [], users: [], campaigns: [], totalResults: 0 } })
  }

  // Normalize: lowercase for case-insensitive matching, strip dashes for ID matching
  const q = rawQ.toLowerCase()
  const qNoDash = rawQ.replace(/[-\s]/g, '').toLowerCase()

  // Build OR conditions for each entity type
  // For surveys: match title, description, surveyCode, slug, touchpoint, and ID
  const surveyOr = [
    { title: { contains: q } },
    { description: { contains: q } },
    { touchpoint: { contains: q } },
    { surveyCode: { contains: q } },
    { slug: { contains: q } },
  ]
  // Also try matching by numeric ID (e.g., "1004" or "SRV1004" → id=1004)
  const numericId = parseInt(rawQ.replace(/^SRV-?/i, '').replace(/^SRV/i, ''))
  if (!isNaN(numericId) && numericId > 0) {
    surveyOr.push({ id: numericId } as any)
  }

  const responseOr = [
    { respondentName: { contains: q } },
    { respondentEmail: { contains: q } },
    { feedback: { contains: q } },
  ]
  const responseNumericId = parseInt(rawQ.replace(/^RSP-?/i, '').replace(/^RSP/i, ''))
  if (!isNaN(responseNumericId) && responseNumericId > 0) {
    responseOr.push({ id: responseNumericId } as any)
  }

  const userOr = [
    { name: { contains: q } },
    { email: { contains: q } },
    { employeeId: { contains: q } },
  ]

  const campaignOr = [
    { name: { contains: q } },
    { code: { contains: q } },
    { description: { contains: q } },
  ]

  const isAdminSearch = user.role === 'Admin'
  const deptFilter = !isAdminSearch && user.department ? { department: user.department } : {}

  const [surveys, responses, users, campaigns] = await Promise.all([
    prisma.survey.findMany({
      where: { ...deptFilter, OR: surveyOr },
      select: {
        id: true, title: true, touchpoint: true, status: true, lifecycleStatus: true,
        surveyCode: true, slug: true, createdAt: true,
        createdBy: { select: { name: true } },
        _count: { select: { responses: true } },
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),

    prisma.response.findMany({
      where: { OR: responseOr, ...(deptFilter.department ? { survey: { department: deptFilter.department } } : {}) },
      select: {
        id: true, respondentName: true, respondentEmail: true,
        npsScore: true, submittedAt: true, status: true,
        survey: { select: { id: true, title: true } },
      },
      take: limit,
      orderBy: { submittedAt: 'desc' },
    }),

    prisma.user.findMany({
      where: { OR: userOr },
      select: {
        id: true, name: true, email: true, employeeId: true, isActive: true,
        role: { select: { name: true } },
        department: { select: { name: true } },
      },
      take: limit,
    }),

    prisma.campaign.findMany({
      where: { OR: campaignOr },
      select: {
        id: true, name: true, code: true, channel: true, isActive: true,
        _count: { select: { responses: true, surveys: true } },
      },
      take: limit,
    }),
  ])

  return NextResponse.json({
    data: {
      surveys: surveys.map(s => ({
        type: 'survey' as const,
        id: `SRV-${String(s.id).padStart(4, '0')}`,
        numericId: s.id,
        title: s.title,
        subtitle: s.touchpoint,
        status: s.lifecycleStatus.toLowerCase(),
        surveyCode: s.surveyCode,
        slug: s.slug,
        createdAt: s.createdAt.toISOString(),
        createdBy: s.createdBy.name,
        responseCount: s._count.responses,
        href: `/dashboard/surveys/${s.id}/published`,
      })),
      responses: responses.map(r => ({
        type: 'response' as const,
        id: `RSP-${String(r.id).padStart(5, '0')}`,
        numericId: r.id,
        title: r.respondentName || 'Anonymous',
        subtitle: r.survey.title,
        npsScore: r.npsScore,
        npsCategory: r.npsScore !== null ? (r.npsScore >= 9 ? 'promoter' : r.npsScore >= 7 ? 'passive' : 'detractor') : null,
        submittedAt: r.submittedAt.toISOString(),
        status: r.status,
        href: `/dashboard/surveys/${r.survey.id}/responses/${r.id}`,
      })),
      users: users.map(u => ({
        type: 'user' as const,
        id: `EMP-${String(u.id).padStart(3, '0')}`,
        numericId: u.id,
        title: u.name,
        subtitle: u.email,
        employeeId: u.employeeId,
        role: u.role.name,
        department: u.department?.name ?? null,
        isActive: u.isActive,
        href: `/dashboard/users`,
      })),
      campaigns: campaigns.map(c => ({
        type: 'campaign' as const,
        id: c.code,
        numericId: c.id,
        title: c.name,
        subtitle: c.code,
        channel: c.channel.toLowerCase(),
        isActive: c.isActive,
        responseCount: c._count.responses,
        surveyCount: c._count.surveys,
        href: `/dashboard/campaigns`,
      })),
      totalResults: surveys.length + responses.length + users.length + campaigns.length,
    },
  })
}
