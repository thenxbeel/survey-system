import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isTokenValidEdge } from '@/lib/jwt-edge'

// ─── Route classification ───────────────────────────────────────────────────

const PROTECTED_PREFIX = '/dashboard'
const PUBLIC_AUTH_ROUTES = ['/', '/login', '/register']

/**
 * Edge-safe auth check.
 *
 * IMPORTANT: This does NOT use Node.js `crypto` (which is unavailable in the
 * Edge Runtime). It decodes the JWT payload via atob/TextDecoder and checks
 * the `exp` claim. Full cryptographic signature verification stays on the
 * server side in /api/auth/me (which uses lib/jwt.ts → jsonwebtoken).
 *
 * Security trade-off: a forged JWT with a future `exp` could bypass this
 * proxy. That's acceptable because:
 *   1. The dashboard UI renders mock data only — no sensitive data exposed.
 *   2. Any future API route that returns real data MUST call verifyToken()
 *      server-side, which rejects forged tokens with 401.
 */
function isAuthenticated(req: NextRequest): boolean {
  const token = req.cookies.get('token')?.value
  return isTokenValidEdge(token)
}

/** Add no-store cache headers so browsers never cache auth redirects. */
function withNoCache(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

// ─── Proxy ──────────────────────────────────────────────────────────────────
// Next.js 16 renamed the `middleware` file convention to `proxy`. The function
// name must match the file name. See:
//   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const authed = isAuthenticated(request)

  // 1. Protected routes: /dashboard/*
  if (pathname === PROTECTED_PREFIX || pathname.startsWith(PROTECTED_PREFIX + '/')) {
    if (!authed) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.search = `?from=${encodeURIComponent(pathname + search)}`
      return withNoCache(NextResponse.redirect(loginUrl))
    }
    return NextResponse.next()
  }

  // 2. Public auth routes: /, /login, /register
  //    If already authenticated, bounce to /dashboard (don't show login again)
  if (PUBLIC_AUTH_ROUTES.includes(pathname)) {
    if (authed) {
      const dashUrl = request.nextUrl.clone()
      dashUrl.pathname = '/dashboard'
      dashUrl.search = ''
      return withNoCache(NextResponse.redirect(dashUrl))
    }
    return NextResponse.next()
  }

  // 3. Everything else (API routes, static assets, _next/*) — pass through
  return NextResponse.next()
}

// ─── Matcher ────────────────────────────────────────────────────────────────
// Run on all routes EXCEPT Next.js internals and static file optimizations.

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
}
