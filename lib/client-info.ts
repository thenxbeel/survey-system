// lib/client-info.ts
//
// Lightweight parser for extracting device type, browser, OS, and IP from
// the incoming Next.js request. No external dependencies — pure string
// parsing on the User-Agent and forwarded-IP headers.
//
// Used by the public response submission endpoint to capture distribution
// channel metadata without requiring cookies or client-side fingerprinting.

import { NextRequest } from 'next/server'

export interface ClientInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop'
  browser: string
  operatingSystem: string
  ipAddress: string | null
  country: string | null
  city: string | null
}

/**
 * Parse the User-Agent string into a normalized browser name.
 *
 * Detection order matters — e.g. "Edge" contains "Chrome" in its UA, so we
 * check Edge / Edg first.
 */
export function parseBrowser(userAgent: string): string {
  if (!userAgent) return 'Unknown'
  const ua = userAgent.toLowerCase()
  if (ua.includes('edg/')) return 'Microsoft Edge'
  if (ua.includes('opr/') || ua.includes('opera')) return 'Opera'
  if (ua.includes('samsungbrowser')) return 'Samsung Internet'
  if (ua.includes('firefox/')) return 'Firefox'
  if (ua.includes('chrome/') && !ua.includes('chromium')) return 'Chrome'
  if (ua.includes('safari/') && !ua.includes('chrome')) return 'Safari'
  if (ua.includes('trident/') || ua.includes('msie')) return 'Internet Explorer'
  return 'Other'
}

/**
 * Parse the User-Agent string into a normalized OS name.
 */
export function parseOperatingSystem(userAgent: string): string {
  if (!userAgent) return 'Unknown'
  const ua = userAgent.toLowerCase()
  if (ua.includes('windows')) return 'Windows'
  if (ua.includes('mac os') || ua.includes('macos')) return 'macOS'
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS'
  if (ua.includes('android')) return 'Android'
  if (ua.includes('linux')) return 'Linux'
  if (ua.includes('chrome os')) return 'Chrome OS'
  return 'Other'
}

/**
 * Classify device type from User-Agent.
 */
export function parseDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  if (!userAgent) return 'desktop'
  const ua = userAgent.toLowerCase()
  if (ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile'))) return 'tablet'
  if (ua.includes('iphone') || ua.includes('android') || ua.includes('mobile')) return 'mobile'
  return 'desktop'
}

/**
 * Extract the client IP address from a Next.js request.
 *
 * Walks the standard forwarded-IP headers in order of preference. The first
 * non-empty value wins. Returns null if no IP can be determined (e.g. when
 * running locally without a proxy).
 */
export function extractIpAddress(req: NextRequest | Request): string | null {
  const headers = req.headers
  const candidates = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',     // Cloudflare
    'x-client-ip',
    'x-cluster-client-ip',
    'fastly-client-ip',
  ]
  for (const name of candidates) {
    const value = headers.get(name)
    if (value) {
      // x-forwarded-for may be "client, proxy1, proxy2" — take the first.
      return value.split(',')[0].trim()
    }
  }
  return null
}

/**
 * Extract geographic info from request headers.
 *
 * In production this is typically populated by Cloudflare / Vercel edge
 * headers (cf-ipcountry, x-vercel-ip-country, etc.). When unavailable
 * (e.g. local dev), both fields return null.
 */
export function extractGeo(req: NextRequest | Request): { country: string | null; city: string | null } {
  const headers = req.headers
  const country =
    headers.get('cf-ipcountry') ||
    headers.get('x-vercel-ip-country') ||
    headers.get('x-country-code') ||
    null
  const city =
    headers.get('cf-ipcity') ||
    headers.get('x-vercel-ip-city') ||
    headers.get('x-city') ||
    null
  return { country, city }
}

/**
 * One-shot helper: pull the full client info bundle from a Next.js request.
 */
export function extractClientInfo(req: NextRequest): ClientInfo {
  const userAgent = req.headers.get('user-agent') ?? ''
  const { country, city } = extractGeo(req)
  return {
    deviceType: parseDeviceType(userAgent),
    browser: parseBrowser(userAgent),
    operatingSystem: parseOperatingSystem(userAgent),
    ipAddress: extractIpAddress(req),
    country,
    city,
  }
}
