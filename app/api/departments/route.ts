import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// GET /api/departments — list all departments with branch + user count
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const where: any = {}
  if (user.role !== 'Admin') {
    const allowedDepts = user.visibleDepartments && user.visibleDepartments.length > 0
      ? user.visibleDepartments
      : (user.department ? [user.department] : [])
    if (allowedDepts.length > 0) {
      where.name = { in: allowedDepts }
    } else {
      return NextResponse.json({ data: [] })
    }
  }

  const departments = await prisma.department.findMany({
    where,
    include: { branch: true, _count: { select: { users: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({
    data: departments.map(d => ({
      id: d.id, name: d.name, description: d.description,
      branchId: d.branchId, branch: d.branch?.name ?? null, userCount: d._count.users,
    })),
  })
}

// POST /api/departments — create a new department (Admin only)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden — only admins can manage departments' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { name, description, branchId } = body as {
    name?: string; description?: string; branchId?: number
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Department name is required' }, { status: 400 })
  }

  // Prevent duplicate names
  const existing = await prisma.department.findUnique({ where: { name: name.trim() } })
  if (existing) {
    return NextResponse.json({ error: `A department named "${name.trim()}" already exists` }, { status: 409 })
  }

  // Validate branchId if provided
  if (branchId != null) {
    const branch = await prisma.branch.findUnique({ where: { id: Number(branchId) } })
    if (!branch) {
      return NextResponse.json({ error: `Branch with ID ${branchId} not found` }, { status: 400 })
    }
  }

  const created = await prisma.department.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      branchId: branchId != null ? Number(branchId) : null,
    },
    include: { branch: true },
  })

  // Audit log
  try {
    await prisma.activityLog.create({
      data: {
        action: 'DEPARTMENT_CREATED',
        entity: 'Department',
        entityId: created.id,
        details: `Created department "${created.name}"`,
        userId: user.id,
      },
    })
  } catch { /* non-fatal */ }

  return NextResponse.json({
    data: {
      id: created.id,
      name: created.name,
      description: created.description,
      branchId: created.branchId,
      branch: created.branch?.name ?? null,
      userCount: 0,
    },
  }, { status: 201 })
}
