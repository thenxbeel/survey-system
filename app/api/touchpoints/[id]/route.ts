import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { ensureTouchpoint } from '@/lib/prisma-guard'

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/touchpoints/:id — single touchpoint
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const Touchpoint = ensureTouchpoint()

    const { id } = await params
    const numericId = parseInt(id)
    if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid touchpoint ID' }, { status: 400 })

    const tp = await Touchpoint.findUnique({ where: { id: numericId } })
    if (!tp) return NextResponse.json({ error: 'Touchpoint not found' }, { status: 404 })

    const surveyCount = await prisma.survey.count({ where: { touchpoint: tp.name } })

    return NextResponse.json({
      data: {
        id: tp.id,
        name: tp.name,
        description: tp.description,
        surveyCount,
        createdAt: tp.createdAt.toISOString(),
        updatedAt: tp.updatedAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('[GET /api/touchpoints/:id]', err)
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/touchpoints/:id — update name/description (Admin only)
//
// When the name changes, every Survey that uses the old name is updated to
// the new name (in a transaction) so surveys stay consistent.
// ─────────────────────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden — only admins can manage touchpoints' }, { status: 403 })
  }

  try {
    const Touchpoint = ensureTouchpoint()

    const { id } = await params
    const numericId = parseInt(id)
    if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid touchpoint ID' }, { status: 400 })

    const body = await req.json().catch(() => ({}))
    const { name, description } = body as { name?: string; description?: string }

    const existing = await Touchpoint.findUnique({ where: { id: numericId } })
    if (!existing) return NextResponse.json({ error: 'Touchpoint not found' }, { status: 404 })

    const trimmedName = name?.trim()
    // Validate name uniqueness if changing
    if (trimmedName && trimmedName !== existing.name) {
      const dupe = await Touchpoint.findUnique({ where: { name: trimmedName } })
      if (dupe) {
        return NextResponse.json({ error: `A touchpoint named "${trimmedName}" already exists` }, { status: 409 })
      }
    }

    const oldName = existing.name
    const newName = trimmedName ?? existing.name

    // Transaction: update the touchpoint + rename every Survey.touchpoint that
    // used the old name so surveys stay consistent.
    const updated = await prisma.$transaction(async (tx) => {
      const tp = await tx.touchpoint.update({
        where: { id: numericId },
        data: {
          ...(trimmedName && { name: trimmedName }),
          ...(description != null && { description: description.trim() || null }),
        },
      })
      // If the name changed, update all surveys using the old name
      if (newName !== oldName) {
        await tx.survey.updateMany({
          where: { touchpoint: oldName },
          data: { touchpoint: newName },
        })
      }
      return tp
    })

    // Audit log
    try {
      await prisma.activityLog.create({
        data: {
          action: 'TOUCHPOINT_UPDATED',
          entity: 'Touchpoint',
          entityId: updated.id,
          details: `Updated touchpoint "${updated.name}"${newName !== oldName ? ` (renamed from "${oldName}")` : ''}`,
          userId: user.id,
        },
      })
    } catch { /* non-fatal */ }

    const surveyCount = await prisma.survey.count({ where: { touchpoint: updated.name } })

    return NextResponse.json({
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        surveyCount,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('[PUT /api/touchpoints/:id]', err)
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/touchpoints/:id — alias for PUT (partial update)
//
// Some clients use PATCH instead of PUT for partial updates. This handler
// accepts the same body shape as PUT and performs the same logic. Both
// `name` and `description` are optional; only provided fields are updated.
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Delegate to PUT — same logic, same validation, same response shape.
  return PUT(req, { params })
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/touchpoints/:id — delete a touchpoint
//
// Business rule: a touchpoint can only be deleted if NO surveys use it.
// If surveys reference it, return 409 with a meaningful message.
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden — only admins can delete touchpoints' }, { status: 403 })
  }

  try {
    const Touchpoint = ensureTouchpoint()

    const { id } = await params
    const numericId = parseInt(id)
    if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid touchpoint ID' }, { status: 400 })

    const tp = await Touchpoint.findUnique({ where: { id: numericId } })
    if (!tp) return NextResponse.json({ error: 'Touchpoint not found' }, { status: 404 })

    // ── Dependency check: count surveys using this touchpoint name ──
    const surveyCount = await prisma.survey.count({ where: { touchpoint: tp.name } })
    if (surveyCount > 0) {
      return NextResponse.json(
        {
          error: `This touchpoint cannot be deleted because it is currently in use by ${surveyCount} survey${surveyCount === 1 ? '' : 's'}.`,
          code: 'TOUCHPOINT_IN_USE',
          counts: { surveys: surveyCount },
        },
        { status: 409 }
      )
    }

    // ── Safe to delete — use a transaction so audit log + delete are atomic ──
    try {
      await prisma.$transaction(async (tx) => {
        await tx.touchpoint.delete({ where: { id: numericId } })
        try {
          await tx.activityLog.create({
            data: {
              action: 'TOUCHPOINT_DELETED',
              entity: 'Touchpoint',
              entityId: numericId,
              details: `Deleted touchpoint "${tp.name}"`,
              userId: user.id,
            },
          })
        } catch { /* non-fatal */ }
      })
    } catch (err: any) {
      if (err?.code === 'P2003') {
        return NextResponse.json(
          { error: 'This touchpoint cannot be deleted because it is currently in use.', code: 'TOUCHPOINT_IN_USE' },
          { status: 409 }
        )
      }
      throw err
    }

    return NextResponse.json({ success: true, message: `Touchpoint "${tp.name}" deleted successfully` })
  } catch (err) {
    console.error('[DELETE /api/touchpoints/:id]', err)
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
