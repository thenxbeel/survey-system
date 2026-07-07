import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * GET /api/me/preferences
 *
 * Returns the persisted UI preferences for the current user, falling back to
 * defaults when nothing has been stored yet. The shape mirrors the
 * PreferencesPayload interface used by the SettingsStore.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const u = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferences: true },
  })

  // preferences is stored as Json?; cast to the expected shape.
  const prefs = (u?.preferences ?? null) as Record<string, unknown> | null

  return NextResponse.json({
    data: {
      theme:     (prefs?.theme as string)     ?? null,
      accent:    (prefs?.accent as string)    ?? null,
      density:   (prefs?.density as string)   ?? null,
      fontSize:  (prefs?.fontSize as string)  ?? null,
      typography:(prefs?.typography as string)?? null,
    },
  })
}

/**
 * PUT /api/me/preferences
 *
 * Persists the current UI preferences for the user. Accepts a partial payload
 * of { theme, accent, density, fontSize, typography } and merges it with the
 * existing stored JSON — callers do not need to send every key on every write.
 *
 * Validation is intentionally permissive (unknown keys are ignored, invalid
 * enum values are silently dropped) so the UI store can write through without
 * a separate schema definition.
 */
const ALLOWED_KEYS = ['theme', 'accent', 'density', 'fontSize', 'typography'] as const
type PrefKey = typeof ALLOWED_KEYS[number]

// `accent` is a free-form hex string; the others are enums.
const VALID_ENUMS: Record<Exclude<PrefKey, 'accent'>, readonly string[]> = {
  theme:      ['light', 'dark', 'system'],
  density:    ['comfortable', 'compact', 'spacious'],
  fontSize:   ['small', 'medium', 'large'],
  typography: ['inter', 'system', 'serif'],
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as Record<string, unknown>

  // Read the existing JSON so we can merge (callers may send partial updates)
  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferences: true },
  })
  const current = (existing?.preferences ?? {}) as Record<string, unknown>

  // Merge: only allow known keys with valid enum values; accent is a free-form
  // hex string so we just sanity-check it matches a hex pattern.
  const next: Record<string, unknown> = { ...current }
  for (const key of ALLOWED_KEYS) {
    const value = body[key]
    if (value == null) continue
    if (typeof value !== 'string') continue
    if (key === 'accent') {
      if (/^#[0-9a-f]{6}$/i.test(value)) next[key] = value
      continue
    }
    if (VALID_ENUMS[key].includes(value)) next[key] = value
  }

  // Prisma's Json? field accepts a plain JSON-serializable object.
  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: next as any },
  })

  return NextResponse.json({ success: true, data: next })
}
