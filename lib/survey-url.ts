// lib/survey-url.ts
//
// Survey URL / slug / share-link / lifecycle utility functions.
//
// IMPORTANT: This file is imported by BOTH client components and server
// routes. It has ZERO npm dependencies — no `qrcode`, no `uuid`. It only
// uses Node.js / browser built-ins (crypto.randomUUID). This guarantees
// that even if optional packages are missing from node_modules, every
// route that imports this file will still load correctly.
//
// QR code generation lives in lib/survey-qr.ts (server only).
//
// URL origin is centralized through lib/app-url.ts → NEXT_PUBLIC_APP_URL env
// var with auto-detection of the machine's LAN IP as fallback. This ensures
// every generated URL works from any device on the network (phones, tablets,
// other computers), not just the dev machine.

import { getAppBaseUrl } from '@/lib/app-url'

// ─── UUID generation (built-in, no `uuid` package needed) ──────────────────

/**
 * Generate a v4 UUID using the built-in crypto API.
 * Falls back to a Math.random-based generator in very old environments.
 */
function uuidv4(): string {
  // Node.js 19+ and all modern browsers expose crypto.randomUUID()
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ─── Slug & survey code ─────────────────────────────────────────────────────

/**
 * Generate a URL-safe slug from a title.
 *
 * Examples:
 *   "Q2 Customer Experience" → "q2-customer-experience"
 *   "Post-Purchase Feedback!" → "post-purchase-feedback"
 *
 * If a uniqueness suffix is requested (recommended), a 6-char random string
 * is appended to virtually eliminate collision risk:
 *   "q2-customer-experience-k3b9p7"
 */
export function generateSlug(title: string, uniqueSuffix = true): string {
  const base = (title || 'survey')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'survey'

  if (!uniqueSuffix) return base
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${base}-${suffix}`
}

/**
 * Generate a short human-readable survey code. Format: "SVY-XXXXXXXX" where
 * X is alphanumeric uppercase. Used for QR codes, SMS shares, and customer
 * support references.
 *
 * Example: SVY-7K3B9P
 */
export function generateSurveyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1 to avoid confusion
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `SVY-${code}`
}

// ─── Public URL ─────────────────────────────────────────────────────────────

/**
 * Build the absolute public URL for a survey given its slug.
 *
 * The origin is resolved through the centralized `getAppBaseUrl()` helper
 * (lib/app-url.ts), which uses (in order):
 *   1. NEXT_PUBLIC_APP_URL env var (recommended — set in .env)
 *   2. VERCEL_URL env var (auto-set on Vercel)
 *   3. Auto-detected LAN IP (e.g. http://21.0.14.67:3000)
 *   4. http://localhost:3000 (last-resort fallback — only when no LAN IP
 *      can be detected, e.g. an air-gapped server)
 *
 * The optional `requestOrigin` parameter is ACCEPTED for backwards
 * compatibility but IGNORED — using it produced inconsistent URLs depending
 * on which host the request came in on (localhost when accessed locally vs
 * the LAN IP when accessed from a phone). Centralizing on env-var + auto-
 * detection ensures every generated URL works from every device.
 */
export function buildPublicSurveyUrl(slug: string, _requestOrigin?: string): string {
  const origin = getAppBaseUrl()
  return `${origin.replace(/\/+$/, '')}/survey/${slug}`
}

// ─── Share links ────────────────────────────────────────────────────────────

/**
 * Build a shareable message for a given survey + channel.
 */
export function buildShareMessage(
  surveyTitle: string,
  publicUrl: string,
  surveyCode?: string,
): string {
  const codeLine = surveyCode ? ` (Ref: ${surveyCode})` : ''
  return `You've been invited to share your feedback: "${surveyTitle}"${codeLine}.\n\nPlease take 2 minutes to complete this short survey:\n${publicUrl}\n\nThank you — your input helps us improve.`
}

/**
 * Build mailto: link for sharing a survey via email.
 */
export function buildEmailShareUrl(
  surveyTitle: string,
  publicUrl: string,
  surveyCode?: string,
  recipient?: string,
): string {
  const subject = encodeURIComponent(`Your feedback is requested: ${surveyTitle}`)
  const body = encodeURIComponent(buildShareMessage(surveyTitle, publicUrl, surveyCode))
  const to = recipient ? encodeURIComponent(recipient) : ''
  return `mailto:${to}?subject=${subject}&body=${body}`
}

/**
 * Build sms: link for sharing via SMS.
 */
export function buildSmsShareUrl(
  surveyTitle: string,
  publicUrl: string,
  surveyCode?: string,
  recipient?: string,
): string {
  const body = encodeURIComponent(buildShareMessage(surveyTitle, publicUrl, surveyCode))
  const to = recipient ? encodeURIComponent(recipient) : ''
  return `sms:${to}?&body=${body}`
}

/**
 * Build https://wa.me/?text= link for sharing via WhatsApp.
 */
export function buildWhatsappShareUrl(
  surveyTitle: string,
  publicUrl: string,
  surveyCode?: string,
  recipient?: string,
): string {
  const text = encodeURIComponent(buildShareMessage(surveyTitle, publicUrl, surveyCode))
  const phone = recipient ? recipient.replace(/[^\d]/g, '') : ''
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`
}

// ─── Time / lifecycle helpers ───────────────────────────────────────────────

/**
 * Compute the remaining lifetime of a survey in milliseconds.
 * Returns null if the survey has no expiration date, or 0 if already expired.
 */
export function computeRemainingMs(expirationDate: Date | string | null): number | null {
  if (!expirationDate) return null
  const exp = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate
  const diff = exp.getTime() - Date.now()
  return diff > 0 ? diff : 0
}

/**
 * Format remaining milliseconds into a human-readable countdown.
 */
export function formatRemainingTime(ms: number | null): string {
  if (ms === null) return 'No expiration'
  if (ms <= 0) return 'Expired'
  const seconds = Math.floor(ms / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}d ${hours}h ${minutes}m`
}

/**
 * Derive the effective lifecycle status of a survey.
 *
 * If the survey was ACTIVE and the expirationDate has passed, it should be
 * considered EXPIRED. This is a pure derivation — it does NOT mutate the
 * database.
 */
export function deriveLifecycleStatus(
  current: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'CLOSED' | 'ARCHIVED',
  activationDate: Date | null,
  expirationDate: Date | null,
  closedAt: Date | null,
): 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'CLOSED' | 'ARCHIVED' {
  if (current === 'ARCHIVED' || current === 'CLOSED' || current === 'DRAFT') return current
  if (closedAt) return 'CLOSED'
  const now = Date.now()
  if (expirationDate && now >= new Date(expirationDate).getTime()) return 'EXPIRED'
  if (activationDate && now < new Date(activationDate).getTime()) return 'SCHEDULED'
  return 'ACTIVE'
}

// ─── UUID re-export (for callers that still want it) ────────────────────────

export { uuidv4 }
