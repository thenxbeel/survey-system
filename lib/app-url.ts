// lib/app-url.ts
//
// Centralized application base URL helper.
//
// This is the ONE source of truth for absolute URLs in the application.
// Every module that builds an absolute URL (survey public URLs, share links,
// QR codes, notification links, email links, exports, reports) MUST import
// from here instead of hardcoding `localhost`, `127.0.0.1`, or reconstructing
// the origin from request headers.
//
// ── Resolution order (highest priority first) ──────────────────────────────
//   1. process.env.NEXT_PUBLIC_APP_URL  (recommended — set in .env)
//   2. process.env.VERCEL_URL           (auto-set on Vercel deployments)
//   3. Auto-detected LAN IP via os.networkInterfaces() (server-only)
//      e.g. http://21.0.14.67:3000
//   4. http://localhost:3000            (last-resort fallback for SSR-only)
//
// ── Why request headers are NOT used ──────────────────────────────────────
// The previous implementation built the base URL from `req.headers.get('host')`,
// which produced DIFFERENT URLs depending on how the user reached the server:
//   - User on the dev machine   → host=localhost:3000   → URL=http://localhost:3000/...
//   - User on the LAN via phone → host=21.0.14.67:3000  → URL=http://21.0.14.67:3000/...
// That meant a survey published from the dev machine generated a `localhost`
// URL that phones could not open. Centralizing on a single env-var + auto-detected
// LAN IP fixes this: every generated URL works from any device on the network.
//
// ── Client / server compatibility ─────────────────────────────────────────
// This file is safe to import from BOTH client components and server routes.
// On the client, `os.networkInterfaces()` is not available — we fall back to
// `window.location.origin` (which reflects however the user accessed the app)
// when NEXT_PUBLIC_APP_URL is not set. On the server, we use the full
// resolution chain above.

import { networkInterfaces } from 'os'

let _cachedServerBaseUrl: string | null = null

/**
 * Detect the current machine's primary LAN IPv4 address by scanning its
 * network interfaces. Returns the first non-internal, non-loopback IPv4
 * address found, or null if none is available.
 *
 * Server-only — returns null when called from a browser (no `os` module).
 */
function detectLanIp(): string | null {
  try {
    const ifaces = networkInterfaces()
    // Prefer non-internal IPv4 addresses. Sort so that common LAN ranges
    // (192.168.x.x, 10.x.x.x, 172.16-31.x.x) are picked first.
    const candidates: string[] = []
    for (const name of Object.keys(ifaces)) {
      for (const iface of ifaces[name] ?? []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          candidates.push(iface.address)
        }
      }
    }
    if (candidates.length === 0) return null
    // Prefer private LAN ranges over public IPs (e.g. cloud VM external IPs).
    const privateIp = candidates.find(ip =>
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
    )
    return privateIp ?? candidates[0]
  } catch {
    return null
  }
}

/**
 * Get the centralized application base URL (no trailing slash).
 *
 * Resolution order:
 *   1. process.env.NEXT_PUBLIC_APP_URL (recommended — set in .env)
 *   2. process.env.VERCEL_URL (auto-set on Vercel)
 *   3. Auto-detected LAN IP via os.networkInterfaces()
 *   4. http://localhost:3000 (last-resort fallback)
 *
 * The result is cached after the first call so repeated lookups are cheap.
 *
 * Server-safe. On the client, prefer `getAppBaseUrlClient()` which falls
 * back to `window.location.origin` when NEXT_PUBLIC_APP_URL is unset.
 */
export function getAppBaseUrl(): string {
  // Cache only on the server (the env-detection result is stable for the
  // process lifetime). On the client we always re-evaluate because
  // `window.location.origin` could change between sessions.
  if (typeof window === 'undefined' && _cachedServerBaseUrl) {
    return _cachedServerBaseUrl
  }

  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL

  if (fromEnv) {
    const cleaned = fromEnv.replace(/\/+$/, '')
    if (typeof window === 'undefined') _cachedServerBaseUrl = cleaned
    return cleaned
  }

  // Auto-detect LAN IP — only works server-side (uses `os`).
  if (typeof window === 'undefined') {
    const lanIp = detectLanIp()
    if (lanIp) {
      const port = process.env.PORT || '3000'
      const url = `http://${lanIp}:${port}`
      _cachedServerBaseUrl = url
      return url
    }
  }

  return 'http://localhost:3000'
}

/**
 * Build an absolute URL by joining the app base URL with a path.
 *
 * Example:
 *   buildAppUrl('/survey/abc123')
 *     → 'http://21.0.14.67:3000/survey/abc123'
 *
 *   buildAppUrl('survey/abc123')   // leading slash optional
 *     → 'http://21.0.14.67:3000/survey/abc123'
 *
 *   buildAppUrl()                  // no path → base URL only
 *     → 'http://21.0.14.67:3000'
 */
export function buildAppUrl(path: string = ''): string {
  const base = getAppBaseUrl()
  if (!path) return base
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

/**
 * Client-side helper: get the app base URL.
 *
 * On the client, `process.env.NEXT_PUBLIC_APP_URL` is inlined at build time
 * by Next.js, so it's available. If it's not set, fall back to
 * `window.location.origin` (which reflects however the user accessed the app
 * — including the LAN IP if they used it).
 *
 * MUST only be called from inside a `useEffect`, event handler, or other
 * browser-only context (i.e. when `window` is defined). Calling during SSR
 * will fall through to `getAppBaseUrl()` which uses the server-side resolution
 * chain.
 */
export function getAppBaseUrlClient(): string {
  if (typeof window !== 'undefined') {
    // If NEXT_PUBLIC_APP_URL is set, prefer it for cross-device consistency.
    const fromEnv = process.env.NEXT_PUBLIC_APP_URL
    if (fromEnv) return fromEnv.replace(/\/+$/, '')
    // Otherwise use whatever origin the browser is currently on — this
    // already includes the LAN IP if the user accessed via it.
    return window.location.origin
  }
  return getAppBaseUrl()
}
