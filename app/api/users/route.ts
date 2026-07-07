import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, requireRole } from '@/lib/auth/session'
import { CreateUserSchema, parsePagination } from '@/lib/validation'
import { hashPassword } from '@/lib/auth'
import { extractSlugFromInput } from '@/lib/survey-search'

// GET /api/users — list with pagination, search, filtering
//
// Search supports:
//   - Employee name / email / employee ID (existing behaviour)
//   - Full public survey URL → slug extracted → survey owner found
//   - Survey slug / survey code / survey ID / survey title / touchpoint
//   - Campaign name (via Survey → Campaign relation)
//   - Lifecycle status (active / draft / expired / closed / archived / scheduled)
//   - Department name (via User → Department relation)
//   - Branch name (via User → Branch relation)
//   - Role name (via User → Role relation)
//   - User isActive status ("active" / "inactive")
//
// When the search term matches any survey-related field, ALL users linked to
// that survey are included in the result set:
//   - Survey creator (Survey.createdById)
//   - Survey last modifier (Survey.lastModifiedById)
//   - Campaign owner (Campaign.ownerId, via Survey.campaignId)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = parsePagination(req.nextUrl.searchParams)
  const roleId     = req.nextUrl.searchParams.get('roleId')
  const branchId   = req.nextUrl.searchParams.get('branchId')
  const departmentId = req.nextUrl.searchParams.get('departmentId')
  const isActive   = req.nextUrl.searchParams.get('isActive')

  const where: any = {}

  if (params.search) {
    const term = params.search

    // ── Direct user-field matches (existing behaviour) ──
    const userConditions: any[] = [
      { name:       { contains: term } },
      { email:      { contains: term } },
      { employeeId: { contains: term } },
      // Department name match (via relation)
      { department: { name: { contains: term } } },
      // Branch name match (via relation)
      { branch:     { name: { contains: term } } },
      // Role name match (via relation)
      { role:       { name: { contains: term } } },
    ]

    // ── Status match: "active" / "inactive" ──
    const lcTerm = term.trim().toLowerCase()
    if (lcTerm === 'active') {
      userConditions.push({ isActive: true })
    } else if (lcTerm === 'inactive' || lcTerm === 'suspended' || lcTerm === 'disabled') {
      userConditions.push({ isActive: false })
    }

    // ── Survey-related matches → find ALL user IDs linked to matching surveys ──
    // If the term is a URL, extract the slug first so we search by the
    // actual slug value rather than the full URL string.
    const slug = extractSlugFromInput(term)

    // Build survey where-clause for every survey-related field
    const surveyWhere: any = { OR: [] }
    if (slug) {
      // Input was a URL — search ONLY by the extracted slug (exact match
      // since slugs are unique). This avoids false positives from matching
      // the raw URL against title/touchpoint etc.
      surveyWhere.OR.push({ slug: { equals: slug } })
    } else {
      // Non-URL input — search broadly across survey fields
      surveyWhere.OR.push({ slug:        { contains: term } })
      surveyWhere.OR.push({ surveyCode:  { contains: term } })
      surveyWhere.OR.push({ title:       { contains: term } })
      surveyWhere.OR.push({ touchpoint:  { contains: term } })

      // Numeric ID match (only if the term is a pure number)
      if (/^\d+$/.test(term.trim())) {
        surveyWhere.OR.push({ id: { equals: parseInt(term.trim()) } })
      }

      // Lifecycle status match (case-insensitive)
      const validStatuses = ['draft', 'scheduled', 'active', 'expired', 'closed', 'archived']
      if (validStatuses.includes(lcTerm)) {
        surveyWhere.OR.push({ lifecycleStatus: { equals: lcTerm.toUpperCase() } })
      }

      // Campaign name match (via relation)
      surveyWhere.OR.push({ campaign: { name: { contains: term } } })
    }

    // Find surveys matching the survey-related conditions and collect ALL
    // linked user IDs: creator + last modifier + campaign owner.
    let linkedUserIds: number[] = []
    try {
      const matchingSurveys = await prisma.survey.findMany({
        where: surveyWhere,
        select: {
          createdById: true,
          lastModifiedById: true,
          campaign: { select: { ownerId: true } },
        },
      })
      const idSet = new Set<number>()
      for (const s of matchingSurveys) {
        if (s.createdById) idSet.add(s.createdById)
        if (s.lastModifiedById) idSet.add(s.lastModifiedById)
        if (s.campaign?.ownerId) idSet.add(s.campaign.ownerId)
      }
      linkedUserIds = Array.from(idSet)
    } catch {
      // Non-fatal — fall back to user-only search
    }

    // Combine: match users by direct fields OR by being linked to a matching survey
    if (linkedUserIds.length > 0) {
      userConditions.push({ id: { in: linkedUserIds } })
    }
    where.OR = userConditions
  }
  if (roleId)       where.roleId     = parseInt(roleId)
  if (branchId)     where.branchId   = parseInt(branchId)
  if (departmentId) where.departmentId = parseInt(departmentId)
  if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'

  const orderBy: any = {}
  if (params.sort) orderBy[params.sort] = params.sortDir
  else orderBy.createdAt = 'desc'

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        role: true, department: true, branch: true,
        _count: { select: { surveys: true } },
      },
      orderBy,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.user.count({ where }),
  ])

  // Compute per-user survey lifecycle counts in one batched query.
  // Lifecycle is derived (so a SCHEDULED survey past its activationDate is
  // treated as ACTIVE), but for the admin table we approximate by using the
  // raw lifecycleStatus field — close enough for at-a-glance stats, and the
  // exact derivation is shown when the row is expanded.
  const userIds = users.map(u => u.id)
  const surveyCounts = await prisma.survey.groupBy({
    by: ['createdById', 'lifecycleStatus'],
    where: { createdById: { in: userIds } },
    _count: { _all: true },
  })
  const surveyCountMap = new Map<number, { total: number; active: number; draft: number; expired: number; scheduled: number; closed: number; archived: number }>()
  for (const u of users) {
    surveyCountMap.set(u.id, { total: 0, active: 0, draft: 0, expired: 0, scheduled: 0, closed: 0, archived: 0 })
  }
  for (const row of surveyCounts) {
    const entry = surveyCountMap.get(row.createdById)
    if (!entry) continue
    entry.total += row._count._all
    const status = row.lifecycleStatus.toLowerCase()
    if (status === 'active') entry.active += row._count._all
    else if (status === 'draft') entry.draft += row._count._all
    else if (status === 'expired') entry.expired += row._count._all
    else if (status === 'scheduled') entry.scheduled += row._count._all
    else if (status === 'closed') entry.closed += row._count._all
    else if (status === 'archived') entry.archived += row._count._all
    else if (status === 'active') entry.active += row._count._all
  }

  return NextResponse.json({
    data: users.map(u => {
      const counts = surveyCountMap.get(u.id) ?? { total: 0, active: 0, draft: 0, expired: 0, scheduled: 0, closed: 0, archived: 0 }
      const allowedPages = u.role.name === 'Admin'
        ? ['dashboard', 'surveys', 'survey-builder', 'responses', 'analytics', 'assignments', 'reports', 'users', 'branches', 'employee-surveys', 'audit-log', 'settings']
        : (u.role.allowedPages ? JSON.parse(u.role.allowedPages) : [])

      return {
        id: u.id, employeeId: u.employeeId, name: u.name, email: u.email,
        phone: u.phone, isActive: u.isActive, lastLogin: u.lastLogin, createdAt: u.createdAt,
        role: u.role.name, roleId: u.roleId,
        roleAllowedPages: allowedPages,
        department: u.department?.name ?? null, departmentId: u.departmentId,
        branch: u.branch?.name ?? null, branchId: u.branchId,
        // ── Survey counts (new) ──
        surveyCounts: counts,
      }
    }),
    pagination: {
      page: params.page, pageSize: params.pageSize, total,
      totalPages: Math.ceil(total / params.pageSize),
    },
  })
}

// POST /api/users — create (Admin only)
export async function POST(req: NextRequest) {
  const user = await requireRole(req, 'Admin')
  if (!user) return NextResponse.json({ error: 'Forbidden — Admin access required' }, { status: 403 })

  const body = await req.json()
  const parsed = CreateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: parsed.data.email }, { employeeId: parsed.data.employeeId }] },
  })
  if (existing) {
    return NextResponse.json({ error: 'Email or Employee ID already exists' }, { status: 409 })
  }

  const hashedPassword = await hashPassword(parsed.data.password)
  const created = await prisma.user.create({
    data: {
      ...parsed.data,
      password: hashedPassword,
    },
    include: { role: true, department: true, branch: true },
  })

  await prisma.activityLog.create({
    data: { action: 'USER_CREATED', entity: 'User', entityId: created.id, details: `Created user ${created.email}`, userId: user.id },
  })

  return NextResponse.json({
    data: {
      id: created.id, employeeId: created.employeeId, name: created.name, email: created.email,
      role: created.role.name, department: created.department?.name ?? null, branch: created.branch?.name ?? null,
    },
  }, { status: 201 })
}
