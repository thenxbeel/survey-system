// lib/prisma-guard.ts
//
// Runtime guard for Prisma model delegates. Gives a clear, actionable error
// message when a model is missing from the generated Prisma Client (which
// happens when `npx prisma generate` wasn't run after a schema change).
//
// Usage:
//   import { ensureTouchpoint } from '@/lib/prisma-guard'
//   const Touchpoint = ensureTouchpoint()  // throws with a helpful message if missing

import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@prisma/client'

/**
 * Ensure the Touchpoint model delegate exists on the Prisma Client.
 * If it doesn't, throw an Error with installation instructions. The caller
 * should catch this and return a 500 with the same message so the frontend
 * sees a clear error instead of a cryptic "Cannot read properties of
 * undefined".
 *
 * Returns the typed `prisma.touchpoint` delegate so TypeScript infers the
 * correct return types for findMany / findUnique / create / update / delete.
 */
export function ensureTouchpoint() {
  const delegate = (prisma as unknown as { touchpoint?: PrismaClient['touchpoint'] }).touchpoint
  if (!delegate || typeof delegate.findMany !== 'function') {
    throw new PrismaModelMissingError('touchpoint')
  }
  return delegate
}

/**
 * Generic version — use when you need to check a different model.
 * Returns `unknown` so the caller must cast. Prefer the specific helpers
 * (like ensureTouchpoint) when possible.
 */
export function ensureModel(modelName: string): unknown {
  const delegate = (prisma as unknown as Record<string, unknown>)[modelName]
  if (!delegate || typeof (delegate as any)?.findMany !== 'function') {
    throw new PrismaModelMissingError(modelName)
  }
  return delegate
}

export class PrismaModelMissingError extends Error {
  constructor(modelName: string) {
    super(
      `Prisma model "${modelName}" is not available on the Prisma Client. ` +
      `This usually means the Prisma Client was not regenerated after the ` +
      `schema was updated. Run: npx prisma generate  (and ensure the ` +
      `"${modelName}" model exists in prisma/schema.prisma).`
    )
    this.name = 'PrismaModelMissingError'
  }
}
