// lib/survey-qr.ts
//
// QR CODE GENERATION — SERVER-ONLY MODULE.
//
// This file is intentionally separate from lib/survey-url.ts so that the
// `qrcode` npm dependency is isolated to server-side code only. If `qrcode`
// is missing from node_modules, only the routes that import this file will
// fail — every other route (auth, users, responses, analytics, etc.)
// continues to work because they only import the pure utility functions
// from lib/survey-url.ts (which has zero npm dependencies).
//
// DO NOT import this file from any client component. The `qrcode` package
// uses Node.js APIs (Buffer, Stream) that are unavailable in the browser.

import { generateSlug, generateSurveyCode, buildPublicSurveyUrl } from '@/lib/survey-url'

// Dynamic import of qrcode so that a missing package produces a clear
// runtime error only when QR generation is actually requested — NOT a
// build-time "Module not found" that breaks every route that transitively
// imports this module.
let _QRCode: typeof import('qrcode') | null = null
let _QRCodeLoadError: Error | null = null

async function loadQRCode(): Promise<typeof import('qrcode')> {
  if (_QRCode) return _QRCode
  if (_QRCodeLoadError) throw _QRCodeLoadError
  try {
    // Dynamic import — bundlers will still try to resolve `qrcode` at build
    // time, but if it's missing the error is scoped to this module only.
    _QRCode = await import('qrcode')
    return _QRCode
  } catch (err) {
    _QRCodeLoadError = err instanceof Error
      ? err
      : new Error('Failed to load qrcode package: ' + String(err))
    throw _QRCodeLoadError
  }
}

/**
 * Check whether the `qrcode` package is available without actually loading it.
 * Used by API routes to give a helpful error message before attempting
 * QR generation.
 */
export async function isQrCodeAvailable(): Promise<boolean> {
  try {
    await loadQRCode()
    return true
  } catch {
    return false
  }
}

/**
 * Generate a QR code as a base64-encoded PNG data URL.
 *
 * Throws a clear, actionable error if the `qrcode` package is not installed.
 */
export async function generateQrCodeDataUrl(
  payload: string,
  options: { size?: number; margin?: number; errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' } = {},
): Promise<string> {
  const QRCode = await loadQRCode()
  const {
    size = 512,
    margin = 2,
    errorCorrectionLevel = 'H',
  } = options

  return QRCode.toDataURL(payload, {
    width: size,
    margin,
    errorCorrectionLevel,
    color: {
      dark: '#0B4A8B', // ADNTC brand primary
      light: '#FFFFFF',
    },
  })
}

/**
 * One-shot helper: generate slug + survey code + public URL + QR code for a
 * new survey. Returns everything the caller needs to persist.
 *
 * If the `qrcode` package is missing, this throws an error with installation
 * instructions. The slug + surveyCode + publicUrl are still usable; only the
 * `qrCode` field cannot be produced.
 */
export async function generateSurveyUrlBundle(
  title: string,
  requestOrigin?: string,
): Promise<{
  slug: string
  surveyCode: string
  publicUrl: string
  qrCode: string
}> {
  const slug = generateSlug(title)
  const surveyCode = generateSurveyCode()
  const publicUrl = buildPublicSurveyUrl(slug, requestOrigin)

  let qrCode: string
  try {
    qrCode = await generateQrCodeDataUrl(publicUrl)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("Cannot find module") || msg.includes("Module not found") || msg.includes("qrcode")) {
      throw new Error(
        "The 'qrcode' npm package is required to generate QR codes but is not installed. " +
        "Run: npm install qrcode @types/qrcode"
      )
    }
    throw err
  }

  return { slug, surveyCode, publicUrl, qrCode }
}
