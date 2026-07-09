import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { generateToken } from '@/lib/jwt'

const COOKIE_NAME = 'token'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days (matches JWT expiry)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { identifier, password } = body

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Email/Employee ID and Password are required.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { employeeId: identifier }],
      },
      include: { role: true, department: true, branch: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials.' },
        { status: 401 }
      )
    }

    const passwordValid = await verifyPassword(password, user.password)
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials.' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Your account has been deactivated. Please contact an administrator.' },
        { status: 403 }
      )
    }

    const token = generateToken({
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role.name,
    })

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    const userPayload = {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role.name,
      department: user.department?.name,
      branch: user.branch?.name,
    }

    const response = NextResponse.json(
      { success: true, message: 'Login successful.', token, user: userPayload },
      { status: 200 }
    )

    // ─── Set httpOnly cookie so middleware can verify auth on protected routes ──
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE_SECONDS,
    })

    return response
  } catch (error) {
    console.error('[AUTH LOGIN ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
