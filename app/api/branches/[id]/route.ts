import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/branches/:id — single branch with dependency counts
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const numericId = parseInt(id)
  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid branch ID' }, { status: 400 })

  const branch = await prisma.branch.findUnique({
    where: { id: numericId },
    include: { _count: { select: { users: true, departments: true } } },
  })
  if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })

  return NextResponse.json({
    data: {
      id: branch.id,
      name: branch.name,
      location: branch.location,
      userCount: branch._count.users,
      departmentCount: branch._count.departments,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/branches/:id — update name/location (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden — only admins can manage branches' }, { status: 403 })
  }

  const { id } = await params
  const numericId = parseInt(id)
  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid branch ID' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const { name, location } = body as { name?: string; location?: string }

  const existing = await prisma.branch.findUnique({ where: { id: numericId } })
  if (!existing) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })

  // Validate name uniqueness if changing
  if (name && name.trim() !== existing.name) {
    const dupe = await prisma.branch.findUnique({ where: { name: name.trim() } })
    if (dupe) {
      return NextResponse.json({ error: `A branch named "${name.trim()}" already exists` }, { status: 409 })
    }
  }

  const updated = await prisma.branch.update({
    where: { id: numericId },
    data: {
      ...(name != null && { name: name.trim() }),
      ...(location != null && { location: location.trim() || null }),
    },
    include: { _count: { select: { users: true, departments: true } } },
  })

  // Audit log
  try {
    await prisma.activityLog.create({
      data: {
        action: 'BRANCH_UPDATED',
        entity: 'Branch',
        entityId: updated.id,
        details: `Updated branch "${updated.name}"`,
        userId: user.id,
      },
    })
  } catch { /* non-fatal */ }

  return NextResponse.json({
    data: {
      id: updated.id,
      name: updated.name,
      location: updated.location,
      userCount: updated._count.users,
      departmentCount: updated._count.departments,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/branches/:id — delete a branch
//
// Business rule: a branch can only be deleted if it has NO dependent records
// (no Departments, no Users). If dependents exist, return 409 with a
// meaningful message listing the counts.
//
// The Prisma schema enforces this at the DB level via `onDelete: Restrict`
// on Department.branchId and User.branchId — so even Prisma Studio respects
// this rule. The API layer performs an explicit pre-check so we can return
// a user-friendly error message instead of a raw Prisma P2003.
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden — only admins can delete branches' }, { status: 403 })
  }

  const { id } = await params
  const numericId = parseInt(id)
  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid branch ID' }, { status: 400 })

  const branch = await prisma.branch.findUnique({
    where: { id: numericId },
    include: { _count: { select: { users: true, departments: true } } },
  })
  if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })

  // ── Dependency check ──
  const deps: string[] = []
  if (branch._count.departments > 0) {
    deps.push(`${branch._count.departments} department${branch._count.departments === 1 ? '' : 's'}`)
  }
  if (branch._count.users > 0) {
    deps.push(`${branch._count.users} user${branch._count.users === 1 ? '' : 's'}`)
  }

  if (deps.length > 0) {
    return NextResponse.json(
      {
        error: `Branch cannot be deleted because it contains related records: ${deps.join(', ')}.`,
        code: 'BRANCH_HAS_DEPENDENTS',
        counts: {
          departments: branch._count.departments,
          users: branch._count.users,
        },
      },
      { status: 409 }
    )
  }

  // ── Safe to delete — use a transaction so audit log + delete are atomic ──
  try {
    await prisma.$transaction(async (tx) => {
      await tx.branch.delete({ where: { id: numericId } })
      try {
        await tx.activityLog.create({
          data: {
            action: 'BRANCH_DELETED',
            entity: 'Branch',
            entityId: numericId,
            details: `Deleted branch "${branch.name}"`,
            userId: user.id,
          },
        })
      } catch { /* non-fatal — audit log failure should not roll back the delete */ }
    })
  } catch (err: any) {
    // P2003 = foreign-key constraint violation (a dependent appeared between
    // our pre-check and the delete — a race condition). Return the same 409.
    if (err?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Branch cannot be deleted because it contains related records. Please remove them first.', code: 'BRANCH_HAS_DEPENDENTS' },
        { status: 409 }
      )
    }
    throw err
  }

  return NextResponse.json({ success: true, message: `Branch "${branch.name}" deleted successfully` })
}
