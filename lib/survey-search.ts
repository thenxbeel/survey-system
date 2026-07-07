// lib/survey-search.ts
//
// Helpers for survey search — especially URL-based search.
//
// When a user pastes a full public survey URL (e.g.
// `http://172.30.1.136:3000/survey/hola-amigo-6efdlw`) into a search box,
// this module extracts the slug so the database can be queried directly.
//
// Handles every URL variant:
//   - http://localhost:3000/survey/slug
//   - https://company.com/survey/slug
//   - http://172.30.1.136:3000/survey/slug
//   - http://localhost:3000/survey/slug?ref=email  (query params stripped)
//   - http://localhost:3000/survey/slug#section    (fragments stripped)
//   - http://localhost:3000/survey/slug/           (trailing slash stripped)
//   - /survey/slug                                 (bare path)
//   - slug-by-itself                               (treated as plain text)

/**
 * Extract the survey slug from a search input if the input is (or contains)
 * a `/survey/<slug>` URL path.
 *
 * Returns the decoded slug, or null if the input does not contain a
 * `/survey/...` path segment.
 *
 * Examples:
 *   extractSlugFromInput('http://172.30.1.136:3000/survey/hola-amigo-6efdlw')
 *     → 'hola-amigo-6efdlw'
 *   extractSlugFromInput('https://company.com/survey/hola-amigo-6efdlw?ref=email')
 *     → 'hola-amigo-6efdlw'
 *   extractSlugFromInput('/survey/hola-amigo-6efdlw')
 *     → 'hola-amigo-6efdlw'
 *   extractSlugFromInput('hola-amigo-6efdlw')
 *     → null  (bare slug — not a URL path)
 *   extractSlugFromInput('John Smith')
 *     → null
 */
export function extractSlugFromInput(input: string): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (!trimmed) return null

  // ── Strategy 1: try parsing as a full URL (handles http://, https://) ──
  // The URL class handles query params (?ref=email) and fragments (#section)
  // automatically — we only look at pathname.
  try {
    // Add a protocol if missing so URL() can parse it (e.g. "172.30.1.136:3000/survey/slug")
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
    const url = new URL(withProto)
    const match = url.pathname.match(/\/survey\/([^/?#]+)/)
    if (match) {
      const slug = decodeURIComponent(match[1]).replace(/\/+$/, '')
      if (slug) return slug
    }
  } catch {
    // Not a valid URL — fall through to strategy 2
  }

  // ── Strategy 2: bare path like "/survey/slug" (no protocol/host) ──
  const pathMatch = trimmed.match(/\/survey\/([^/?#]+)/)
  if (pathMatch) {
    const slug = decodeURIComponent(pathMatch[1]).replace(/\/+$/, '')
    if (slug) return slug
  }

  return null
}

/**
 * Determine whether a search input looks like it's targeting a survey (as
 * opposed to an employee name/email). Used by the frontend to decide whether
 * to auto-expand the first matching employee.
 *
 * Returns true if the input is:
 *   - A URL containing /survey/
 *   - A bare path /survey/...
 *   - A survey code (matches SVY-XXXXXX pattern)
 *   - A numeric survey ID
 */
export function looksLikeSurveySearch(input: string): boolean {
  if (!input) return false
  const trimmed = input.trim()

  // URL or path containing /survey/
  if (/\/survey\//i.test(trimmed)) return true

  // Survey code: SVY-XXXXXX (6 alphanumeric uppercase)
  if (/^SVY-[A-Z0-9]{4,8}$/i.test(trimmed)) return true

  // Pure number (survey ID)
  if (/^\d+$/.test(trimmed)) return true

  return false
}
