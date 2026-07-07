import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { ensureTouchpoint } from '@/lib/prisma-guard'

// GET /api/touchpoints — list all touchpoints with survey usage counts
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Guard: ensures prisma.touchpoint exists (throws clear error if not)
    const Touchpoint = ensureTouchpoint()

    const touchpoints = await Touchpoint.findMany({
      orderBy: { name: 'asc' },
    })

    // Survey.touchpoint is a free-text String (not a FK), so we compute usage
    // counts via a separate groupBy query.
    const surveyCounts = await prisma.survey.groupBy({
      by: ['touchpoint'],
      _count: { _all: true },
    })
    const countMap = new Map<string, number>(
      surveyCounts.map(s => [s.touchpoint, s._count._all])
    )

    return NextResponse.json({
      data: touchpoints.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        surveyCount: countMap.get(t.name) ?? 0,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    })
  } catch (err) {
    console.error('[GET /api/touchpoints]', err)
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/touchpoints — create a new touchpoint (Admin only)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden — only admins can manage touchpoints' }, { status: 403 })
  }

  try {
    const Touchpoint = ensureTouchpoint()

    const body = await req.json().catch(() => ({}))
    const { name, description } = body as { name?: string; description?: string }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Touchpoint name is required' }, { status: 400 })
    }

    const trimmedName = name.trim()
    const existing = await Touchpoint.findUnique({ where: { name: trimmedName } })
    if (existing) {
      return NextResponse.json({ error: `A touchpoint named "${trimmedName}" already exists` }, { status: 409 })
    }

    const created = await Touchpoint.create({
      data: {
        name: trimmedName,
        description: description?.trim() || null,
      },
    })

    // Audit log
    try {
      await prisma.activityLog.create({
        data: {
          action: 'TOUCHPOINT_CREATED',
          entity: 'Touchpoint',
          entityId: created.id,
          details: `Created touchpoint "${created.name}"`,
          userId: user.id,
        },
      })
    } catch { /* non-fatal */ }

    return NextResponse.json({
      data: {
        id: created.id,
        name: created.name,
        description: created.description,
        surveyCount: 0,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/touchpoints]', err)
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
