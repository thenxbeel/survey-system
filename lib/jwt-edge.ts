// ───────────────────────────────────────────────────────────────────────────
// lib/jwt-edge.ts
// Edge-runtime-safe JWT utilities for use in middleware/proxy.
//
// PROBLEM: lib/jwt.ts uses the `jsonwebtoken` package, which depends on
// Node.js `crypto`. Next.js middleware runs in the Edge Runtime, where
// Node.js `crypto` is unavailable — calling verifyToken() there throws:
//   "The edge runtime does not support Node.js 'crypto' module."
//
// SOLUTION: This module decodes the JWT payload using only Edge-compatible
// APIs (atob, TextDecoder) and checks the `exp` claim. It does NOT
// cryptographically verify the signature — that stays in lib/jwt.ts
// (verifyToken) and is performed by /api/auth/me and other server routes.
//
// Security model:
//   • Middleware = UX layer: redirects unauthed users to /login.
//     A crafted fake JWT could bypass middleware, but the dashboard UI
//     shows mock data only — no sensitive data is exposed.
//   • Server routes (/api/auth/me, /api/auth/login, future API routes)
//     use the full verifyToken() from lib/jwt.ts (jsonwebtoken + crypto)
//     and reject forged tokens with 401.
// ───────────────────────────────────────────────────────────────────────────

export interface EdgeJwtPayload {
  id?: number
  employeeId?: string
  email?: string
  role?: string
  exp?: number   // Unix seconds
  iat?: number   // Unix seconds
  [key: string]: unknown
}

/**
 * Base64url → UTF-8 string. Uses atob (Edge-compatible).
 */
function base64UrlDecode(input: string): string {
  // Convert base64url alphabet to base64
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  // Pad with '=' to length multiple of 4
  while (base64.length % 4 !== 0) base64 += '='
  // atob returns a binary string; decode as UTF-8 to support non-ASCII payloads
  const binary = atob(base64)
  // Convert binary string to UTF-8
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder('utf-8').decode(bytes)
}

/**
 * Decode a JWT payload WITHOUT verifying its signature.
 * Returns null if:
 *   - the token is malformed (not 3 dot-separated parts)
 *   - the payload is not valid JSON
 *   - the `exp` claim is present and in the past
 *
 * This function is safe to call from middleware (Edge Runtime).
 * It does NOT use Node.js crypto and does NOT verify the signature.
 */
export function decodeTokenSafe(token: string): EdgeJwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payloadJson = base64UrlDecode(parts[1])
    const payload = JSON.parse(payloadJson) as EdgeJwtPayload

    // Expiry check — `exp` is in seconds since epoch
    if (typeof payload.exp === 'number') {
      const nowSec = Math.floor(Date.now() / 1000)
      if (payload.exp < nowSec) return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Edge-safe auth check used by middleware.
 * Returns true iff the `token` cookie is present AND decodes AND has not expired.
 * Does NOT verify the signature — see file header for security model.
 */
export function isTokenValidEdge(token: string | undefined): boolean {
  if (!token) return false
  return decodeTokenSafe(token) !== null
}
