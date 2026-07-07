import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, hashPassword } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth/session'

// POST /api/auth/change-password
// Allows the currently authenticated user to change their own password.
// Verifies the current password before accepting the new one.
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { currentPassword, newPassword, confirmPassword } = body as {
      currentPassword?: string
      newPassword?: string
      confirmPassword?: string
    }

    // ── Basic presence validation ─────────────────────────────────────────
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password, new password, and confirmation are required.' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'New password and confirmation do not match.' },
        { status: 400 }
      )
    }

    // ── Password policy ───────────────────────────────────────────────────
    // Min 8 chars, at least one letter and one number. Mirrors common enterprise policy
    // without breaking the existing seed users (whose passwords already satisfy this).
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters long.' },
        { status: 400 }
      )
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, message: 'New password must contain at least one letter and one number.' },
        { status: 400 }
      )
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from the current password.' },
        { status: 400 }
      )
    }

    // ── Fetch stored hash & verify current password ───────────────────────
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, password: true, isActive: true },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'User not found or inactive.' },
        { status: 401 }
      )
    }

    const currentPasswordValid = await verifyPassword(currentPassword, user.password)
    if (!currentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect.' },
        { status: 400 }
      )
    }

    // ── Persist the new hash ──────────────────────────────────────────────
    const hashed = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    })

    // Best-effort audit entry — only if the table exists in the current schema.
    try {
      await prisma.activityLog.create({
        data: {
          action: 'PASSWORD_CHANGED',
          entity: 'User',
          entityId: user.id,
          userId: user.id,
        },
      })
    } catch {
      // ActivityLog may not exist in some deployments — ignore silently.
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    })
  } catch (error) {
    console.error('[AUTH CHANGE-PASSWORD ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
