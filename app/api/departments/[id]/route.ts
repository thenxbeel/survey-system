import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/departments/:id — single department with branch + user count
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id)
  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid department ID' }, { status: 400 })

  const dept = await prisma.department.findUnique({
    where: { id: numericId },
    include: { branch: true, _count: { select: { users: true } } },
  })
  if (!dept) return NextResponse.json({ error: 'Department not found' }, { status: 404 })

  return NextResponse.json({
    data: {
      id: dept.id,
      name: dept.name,
      description: dept.description,
      branchId: dept.branchId,
      branch: dept.branch?.name ?? null,
      userCount: dept._count.users,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/departments/:id — update name/description/branchId (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden — only admins can manage departments' }, { status: 403 })
  }

  const { id } = await params
  const numericId = parseInt(id)
  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid department ID' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const { name, description, branchId } = body as {
    name?: string; description?: string; branchId?: number | null
  }

  const existing = await prisma.department.findUnique({ where: { id: numericId } })
  if (!existing) return NextResponse.json({ error: 'Department not found' }, { status: 404 })

  // Validate name uniqueness if changing
  if (name && name.trim() !== existing.name) {
    const dupe = await prisma.department.findUnique({ where: { name: name.trim() } })
    if (dupe) {
      return NextResponse.json({ error: `A department named "${name.trim()}" already exists` }, { status: 409 })
    }
  }

  // Validate branchId if provided (null is allowed — department can be branchless)
  if (branchId != null) {
    const branch = await prisma.branch.findUnique({ where: { id: Number(branchId) } })
    if (!branch) {
      return NextResponse.json({ error: `Branch with ID ${branchId} not found` }, { status: 400 })
    }
  }

  const updated = await prisma.department.update({
    where: { id: numericId },
    data: {
      ...(name != null && { name: name.trim() }),
      ...(description != null && { description: description.trim() || null }),
      ...(branchId !== undefined && { branchId: branchId == null ? null : Number(branchId) }),
    },
    include: { branch: true, _count: { select: { users: true } } },
  })

  // Audit log
  try {
    await prisma.activityLog.create({
      data: {
        action: 'DEPARTMENT_UPDATED',
        entity: 'Department',
        entityId: updated.id,
        details: `Updated department "${updated.name}"`,
        userId: user.id,
      },
    })
  } catch { /* non-fatal */ }

  return NextResponse.json({
    data: {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      branchId: updated.branchId,
      branch: updated.branch?.name ?? null,
      userCount: updated._count.users,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/departments/:id — delete a department
//
// Business rule: a department can only be deleted if it has NO dependent
// records (no Users). If dependents exist, return 409 with a meaningful
// message listing the counts.
//
// The Prisma schema enforces this at the DB level via `onDelete: Restrict`
// on User.departmentId — so even Prisma Studio respects this rule. The API
// layer performs an explicit pre-check so we can return a user-friendly
// error message instead of a raw Prisma P2003.
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden — only admins can delete departments' }, { status: 403 })
  }

  const { id } = await params
  const numericId = parseInt(id)
  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid department ID' }, { status: 400 })

  const dept = await prisma.department.findUnique({
    where: { id: numericId },
    include: { _count: { select: { users: true } } },
  })
  if (!dept) return NextResponse.json({ error: 'Department not found' }, { status: 404 })

  // ── Dependency check ──
  if (dept._count.users > 0) {
    return NextResponse.json(
      {
        error: `Department cannot be deleted because it contains ${dept._count.users} user${dept._count.users === 1 ? '' : 's'}.`,
        code: 'DEPARTMENT_HAS_DEPENDENTS',
        counts: {
          users: dept._count.users,
        },
      },
      { status: 409 }
    )
  }

  // ── Safe to delete — use a transaction so audit log + delete are atomic ──
  try {
    await prisma.$transaction(async (tx) => {
      await tx.department.delete({ where: { id: numericId } })
      try {
        await tx.activityLog.create({
          data: {
            action: 'DEPARTMENT_DELETED',
            entity: 'Department',
            entityId: numericId,
            details: `Deleted department "${dept.name}"`,
            userId: user.id,
          },
        })
      } catch { /* non-fatal — audit log failure should not roll back the delete */ }
    })
  } catch (err: any) {
    if (err?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Department cannot be deleted because it contains related records. Please remove them first.', code: 'DEPARTMENT_HAS_DEPENDENTS' },
        { status: 409 }
      )
    }
    throw err
  }

  return NextResponse.json({ success: true, message: `Department "${dept.name}" deleted successfully` })
}
