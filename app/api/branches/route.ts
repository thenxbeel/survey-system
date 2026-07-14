import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// GET /api/branches — list all branches with user/department counts
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const where: any = {}
  if (user.role !== 'Admin') {
    const allowedBranches = user.visibleBranches && user.visibleBranches.length > 0
      ? user.visibleBranches
      : (user.branch ? [user.branch] : [])
    if (allowedBranches.length > 0) {
      where.name = { in: allowedBranches }
    } else {
      return NextResponse.json({ data: [] })
    }
  }

  const branches = await prisma.branch.findMany({
    where,
    include: { _count: { select: { users: true, departments: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({
    data: branches.map(b => ({
      id: b.id,
      name: b.name,
      location: b.location,
      userCount: b._count.users,
      departmentCount: b._count.departments,
    })),
  })
}

// POST /api/branches — create a new branch (Admin only)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden — only admins can manage branches' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { name, location } = body as { name?: string; location?: string }

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Branch name is required' }, { status: 400 })
  }

  // Prevent duplicate names (the @unique constraint would also catch this,
  // but we return a friendlier message)
  const existing = await prisma.branch.findUnique({ where: { name: name.trim() } })
  if (existing) {
    return NextResponse.json({ error: `A branch named "${name.trim()}" already exists` }, { status: 409 })
  }

  const created = await prisma.branch.create({
    data: {
      name: name.trim(),
      location: location?.trim() || null,
    },
  })

  // Audit log
  try {
    await prisma.activityLog.create({
      data: {
        action: 'BRANCH_CREATED',
        entity: 'Branch',
        entityId: created.id,
        details: `Created branch "${created.name}"`,
        userId: user.id,
      },
    })
  } catch { /* non-fatal */ }

  return NextResponse.json({
    data: {
      id: created.id,
      name: created.name,
      location: created.location,
      userCount: 0,
      departmentCount: 0,
    },
  }, { status: 201 })
}
