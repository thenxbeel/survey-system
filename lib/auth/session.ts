// lib/auth/session.ts

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

const COOKIE_NAME = 'token'

export interface AuthUser {
  id: number
  employeeId: string
  name: string
  email: string
  role: string
  roleId: number
  department: string | null
  branch: string | null
  departmentId: number | null
  branchId: number | null
  isActive: boolean
  allowedPages?: string | null
  visibleBranches?: string[] | null
  visibleDepartments?: string[] | null
}

export async function getCurrentUser(
  req: NextRequest
): Promise<AuthUser | null> {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token) as {
      id: number
      employeeId: string
      email: string
      role: string
    }

    if (!payload?.id) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
      include: {
        role: true,
        department: true,
        branch: true,
      },
    })

    if (!user) {
      return null
    }

    if (!user.isActive) {
      return null
    }

    return {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role.name,
      roleId: user.roleId,
      department: user.department?.name ?? null,
      branch: user.branch?.name ?? null,
      departmentId: user.departmentId,
      branchId: user.branchId,
      isActive: user.isActive,
      allowedPages: user.allowedPages ? user.allowedPages : user.role.allowedPages,
      visibleBranches: user.visibleBranches ? JSON.parse(user.visibleBranches) : null,
      visibleDepartments: user.visibleDepartments ? JSON.parse(user.visibleDepartments) : null,
    }
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

const ROLE_HIERARCHY: Record<string, number> = {
  Viewer: 0,
  Manager: 1,
  Admin: 2,
}

export async function requireRole(
  req: NextRequest,
  minRole: 'Viewer' | 'Manager' | 'Admin',
): Promise<AuthUser | null> {
  const user = await getCurrentUser(req)

  if (!user) {
    return null
  }

  const userLevel = ROLE_HIERARCHY[user.role] ?? -1
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 99

  if (userLevel < requiredLevel) {
    return null
  }

  return user
}

export function hasPermission(
  user: AuthUser,
  permission: 'read' | 'create' | 'update' | 'delete' | 'manage_users',
): boolean {
  const level = ROLE_HIERARCHY[user.role] ?? -1

  switch (permission) {
    case 'read':
      return level >= 0
    case 'create':
      return level >= 1
    case 'update':
      return level >= 1
    case 'delete':
      return level >= 1
    case 'manage_users':
      return level >= 2
    default:
      return false
  }
}

export function getScopeFilters(user: AuthUser) {
  const isAdmin = user.role === 'Admin'
  const filters: any = {}

  if (!isAdmin) {
    // Department filtering:
    // If customized (visibleDepartments), filter by those + 'All Departments'.
    // Otherwise fallback to their primary department + 'All Departments'.
    if (user.visibleDepartments && user.visibleDepartments.length > 0) {
      filters.department = { in: [...user.visibleDepartments, 'All Departments'] }
    } else if (user.department) {
      filters.department = { in: [user.department, 'All Departments'] }
    } else {
      filters.department = 'All Departments'
    }

    // Branch filtering:
    // Only apply if visibleBranches is customized (non-empty).
    // If not customized, they can see all branches (backward-compatible).
    if (user.visibleBranches && user.visibleBranches.length > 0) {
      filters.branch = { in: [...user.visibleBranches, 'All Branches'] }
    }
  }

  return filters
}
