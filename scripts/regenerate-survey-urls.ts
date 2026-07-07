// scripts/regenerate-survey-urls.ts
//
// One-off migration script: rewrites every Survey.publicUrl and Survey.qrCode
// to use the centralized LAN-IP base URL (lib/app-url.ts). Run once after
// deploying the centralized URL helper so existing surveys that were created
// with localhost URLs are upgraded to LAN-IP URLs.
//
// Usage:
//   npx tsx scripts/regenerate-survey-urls.ts

import { PrismaClient } from '@prisma/client'
import { buildPublicSurveyUrl } from '../lib/survey-url'
import { generateQrCodeDataUrl } from '../lib/survey-qr'

const prisma = new PrismaClient()

async function main() {
  const surveys = await prisma.survey.findMany({
    where: { publicUrl: { not: null } },
    select: { id: true, title: true, slug: true, publicUrl: true, qrCode: true },
  })

  console.log(`Found ${surveys.length} surveys with publicUrl`)

  let updated = 0
  let skipped = 0
  for (const s of surveys) {
    if (!s.slug) {
      console.log(`  ⚠ Skipping survey ${s.id} — no slug`)
      skipped++
      continue
    }

    const newUrl = buildPublicSurveyUrl(s.slug)
    if (s.publicUrl === newUrl) {
      console.log(`  → survey ${s.id} already up-to-date: ${newUrl}`)
      skipped++
      continue
    }

    // Regenerate QR code with the new URL
    let newQr = s.qrCode
    try {
      newQr = await generateQrCodeDataUrl(newUrl)
    } catch (err) {
      console.log(`  ⚠ survey ${s.id}: QR regeneration failed (${(err as Error).message}); keeping old QR`)
    }

    await prisma.survey.update({
      where: { id: s.id },
      data: { publicUrl: newUrl, qrCode: newQr },
    })
    console.log(`  ✓ survey ${s.id}: ${s.publicUrl} → ${newUrl}`)
    updated++
  }

  console.log('')
  console.log(`Done. Updated ${updated} surveys, skipped ${skipped}.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
