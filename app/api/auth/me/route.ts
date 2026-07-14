import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

const COOKIE_NAME = 'token'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json(
        { success: false, authenticated: false, message: 'No token provided.' },
        { status: 401 }
      )
    }

    let payload: { id: number; employeeId: string; email: string; role: string }
    try {
      payload = verifyToken(token) as typeof payload
    } catch {
      return NextResponse.json(
        { success: false, authenticated: false, message: 'Invalid or expired token.' },
        { status: 401 }
      )
    }

    // Fetch the latest user record so the client always sees current info
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { role: true, department: true, branch: true },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, authenticated: false, message: 'User not found or inactive.' },
        { status: 401 }
      )
    }

    const allowedPages = user.role.name === 'Admin'
      ? ['dashboard', 'surveys', 'survey-builder', 'responses', 'analytics', 'assignments', 'reports', 'users', 'branches', 'employee-surveys', 'audit-log', 'settings']
      : (user.allowedPages 
          ? JSON.parse(user.allowedPages) 
          : (user.role.allowedPages ? JSON.parse(user.role.allowedPages) : []))

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        department: user.department?.name,
        departmentId: user.departmentId,
        branch: user.branch?.name,
        branchId: user.branchId,
        createdAt: user.createdAt.toISOString(),
        allowedPages,
        visibleBranches: user.visibleBranches ? JSON.parse(user.visibleBranches) : null,
        visibleDepartments: user.visibleDepartments ? JSON.parse(user.visibleDepartments) : null,
      },
    })
  } catch (error) {
    console.error('[AUTH ME ERROR]', error)
    return NextResponse.json(
      { success: false, authenticated: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
