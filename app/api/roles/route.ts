import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, requireRole } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const roles = await prisma.role.findMany({ include: { users: { select: { id: true } } } })
  return NextResponse.json({
    data: roles.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      allowedPages: r.allowedPages,
      userCount: r.users.length
    })),
  })
}

export async function POST(req: NextRequest) {
  const user = await requireRole(req, 'Admin')
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { name, description, allowedPages } = body
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
    }

    const allowedPagesStr = Array.isArray(allowedPages) 
      ? JSON.stringify(allowedPages) 
      : (typeof allowedPages === 'string' ? allowedPages : null)

    const role = await prisma.role.upsert({
      where: { name: name.trim() },
      create: {
        name: name.trim(),
        description: description || null,
        allowedPages: allowedPagesStr,
      },
      update: {
        description: description || null,
        allowedPages: allowedPagesStr,
      }
    })

    return NextResponse.json({ data: role }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
