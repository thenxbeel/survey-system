# QR Code Module Not Found — FIX

## Problem
Every route that imports `lib/survey-url.ts` was failing with HTTP 500 because
the old version of that file had `import QRCode from 'qrcode'` at the top —
and the `qrcode` package wasn't installed in your local `node_modules`.

This broke `/api/auth/me`, `/api/me/surveys`, `/dashboard/profile`,
`/dashboard/settings`, `/dashboard/reports`, and every other route that
transitively imported the file.

## Fix (4 files)

### 1. `lib/survey-url.ts` — REWRITE (zero npm dependencies)
- Removed `import QRCode from 'qrcode'`
- Removed `import { v4 as uuidv4 } from 'uuid'`
- Uses Node's built-in `crypto.randomUUID()` instead
- All QR code functions moved to `lib/survey-qr.ts`
- This file is now safe to import from any client or server route

### 2. `lib/survey-qr.ts` — NEW FILE (server-only)
- Contains `generateQrCodeDataUrl` and `generateSurveyUrlBundle`
- Uses dynamic `import('qrcode')` so a missing package produces a clear
  runtime error ONLY when QR generation is actually requested — not a
  build-time "Module not found" that breaks every route
- DO NOT import this file from client components

### 3. `app/api/surveys/route.ts` — UPDATED IMPORTS
- QR functions now imported from `@/lib/survey-qr`
- Pure utilities still imported from `@/lib/survey-url`

### 4. `app/api/surveys/[id]/route.ts` — UPDATED IMPORTS
- Same import split as above

## Installation

1. **Copy these 4 files** into your project at
   `C:\Users\thenx\Desktop\survey system\`, preserving the folder structure:

   ```
   lib/
     survey-url.ts     ← overwrite existing
     survey-qr.ts      ← new file
   app/api/surveys/
     route.ts          ← overwrite existing
     [id]/
       route.ts        ← overwrite existing
   ```

2. **Install the qrcode package** (needed for QR code generation when
   publishing surveys):

   ```powershell
   cd "C:\Users\thenx\Desktop\survey system"
   npm install qrcode @types/qrcode
   ```

3. **Clear the corrupted webpack cache**:

   ```powershell
   Remove-Item -Recurse -Force .next
   ```

4. **Restart the dev server**:

   ```powershell
   npm run dev
   ```

## What happens if `qrcode` is missing in the future?

- ✅ `/api/auth/me`, `/api/me/surveys`, `/dashboard/profile`,
  `/dashboard/settings`, `/dashboard/reports` — all keep working
  (they don't import `qrcode` at all)
- ✅ Only the "Publish Survey" and "Regenerate QR" actions would fail,
  returning a clear error: *"The 'qrcode' npm package is required to
  generate QR codes but is not installed. Run: npm install qrcode @types/qrcode"*
- ✅ No more cascade of 500 errors across unrelated routes
