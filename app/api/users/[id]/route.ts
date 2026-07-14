import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, requireRole } from '@/lib/auth/session'
import { UpdateUserSchema } from '@/lib/validation'
import { hashPassword } from '@/lib/auth'

// GET /api/users/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const u = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    include: { role: true, department: true, branch: true },
  })
  if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({
    data: {
      id: u.id, employeeId: u.employeeId, name: u.name, email: u.email,
      phone: u.phone, isActive: u.isActive, lastLogin: u.lastLogin,
      createdAt: u.createdAt, updatedAt: u.updatedAt,
      role: u.role.name, roleId: u.roleId,
      department: u.department?.name ?? null, departmentId: u.departmentId,
      branch: u.branch?.name ?? null, branchId: u.branchId,
    },
  })
}

// PUT /api/users/:id — update (Admin only, or self for profile)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(req)
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const targetId = parseInt(id)

  // Self can update own profile; only Admin can update others or change roles
  const isSelf = currentUser.id === targetId
  const isAdmin = currentUser.role === 'Admin'
  const isManagerOrAdmin = currentUser.role === 'Admin' || currentUser.role === 'Manager'
  if (!isSelf && !isManagerOrAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  // Password reset
  if (body.password) {
    if (!isAdmin) return NextResponse.json({ error: 'Only admins can reset passwords' }, { status: 403 })
    const hashed = await hashPassword(body.password)
    await prisma.user.update({ where: { id: targetId }, data: { password: hashed } })
    await prisma.activityLog.create({
      data: { action: 'PROFILE_UPDATED', entity: 'User', entityId: targetId, userId: currentUser.id },
    })

    return NextResponse.json({ success: true, message: 'Password reset' })
  }

  const parsed = UpdateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  // Only admin/manager can change role/isActive
  if (!isManagerOrAdmin) {
    delete (parsed.data as any).roleId
    delete (parsed.data as any).isActive
  }

  try {
    const updateData: any = { ...parsed.data }
    delete updateData.roleName
    delete updateData.departmentName

    // Convert allowedPages string[] to JSON string
    if (parsed.data.allowedPages !== undefined) {
      if (parsed.data.allowedPages === null) {
        updateData.allowedPages = null
      } else {
        updateData.allowedPages = JSON.stringify(parsed.data.allowedPages)
      }
    }

    // Convert visibleBranches string[] to JSON string
    if (parsed.data.visibleBranches !== undefined) {
      if (parsed.data.visibleBranches === null) {
        updateData.visibleBranches = null
      } else {
        updateData.visibleBranches = JSON.stringify(parsed.data.visibleBranches)
      }
    }

    // Convert visibleDepartments string[] to JSON string
    if (parsed.data.visibleDepartments !== undefined) {
      if (parsed.data.visibleDepartments === null) {
        updateData.visibleDepartments = null
      } else {
        updateData.visibleDepartments = JSON.stringify(parsed.data.visibleDepartments)
      }
    }

    // Resolve roleName to roleId
    if (parsed.data.roleName && isManagerOrAdmin) {
      const roleRecord = await prisma.role.findFirst({ where: { name: parsed.data.roleName } })
      if (roleRecord) {
        updateData.roleId = roleRecord.id
      }
    }

    // Resolve departmentName to departmentId
    if (parsed.data.departmentName && isManagerOrAdmin) {
      if (parsed.data.departmentName === 'None') {
        updateData.departmentId = null
      } else {
        const deptRecord = await prisma.department.findFirst({ where: { name: parsed.data.departmentName } })
        if (deptRecord) {
          updateData.departmentId = deptRecord.id
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      include: { role: true, department: true, branch: true },
    })

    await prisma.activityLog.create({
      data: { action: 'PROFILE_UPDATED', entity: 'User', entityId: targetId, userId: currentUser.id },
    })

    return NextResponse.json({
      data: {
        id: updated.id, employeeId: updated.employeeId, name: updated.name, email: updated.email,
        phone: updated.phone, isActive: updated.isActive,
        role: updated.role.name, roleId: updated.roleId,
        department: updated.department?.name ?? null, branch: updated.branch?.name ?? null,
        visibleBranches: updated.visibleBranches ? JSON.parse(updated.visibleBranches) : null,
        visibleDepartments: updated.visibleDepartments ? JSON.parse(updated.visibleDepartments) : null,
      },
    })
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Email or Employee ID already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// PATCH /api/users/:id — alias for PUT (partial update)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PUT(req, { params })
}

// DELETE /api/users/:id — hard delete (Admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireRole(req, 'Admin')
  if (!currentUser) return NextResponse.json({ error: 'Forbidden — Admin access required' }, { status: 403 })

  const { id } = await params
  const targetId = parseInt(id)

  if (currentUser.id === targetId) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  try {
    // Delete related notifications and activity logs first to avoid FK constraints
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId: targetId } }),
      prisma.activityLog.deleteMany({ where: { userId: targetId } }),
      prisma.savedReport.deleteMany({ where: { createdById: targetId } }),
      prisma.scheduledReport.deleteMany({ where: { createdById: targetId } }),
      prisma.user.delete({ where: { id: targetId } })
    ])
    
    // Log the deletion using the admin's ID
    await prisma.activityLog.create({
      data: { action: 'ACCOUNT_DEACTIVATED', entity: 'User', entityId: targetId, userId: currentUser.id },
    })
    
    return NextResponse.json({ success: true, message: 'User deleted' })
  } catch (err: any) {
    console.error('Delete User Error:', err)
    if (err.code === 'P2003') { // Foreign key constraint
      return NextResponse.json({ error: 'Cannot delete user because they have associated surveys or records. Suspend them instead.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
