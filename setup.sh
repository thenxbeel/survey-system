#!/usr/bin/env bash
# setup.sh — one-command project setup.
#
# This script guarantees that the Prisma Client is freshly generated and
# contains ALL models from the schema (including Touchpoint). It clears
# every possible stale-client location before regenerating.
#
# Run this after unzipping the project.
#
# Usage:
#   bash setup.sh

set -e

echo "══════════════════════════════════════════════════════════════════════════"
echo "ADNTC CX Platform — Setup"
echo "══════════════════════════════════════════════════════════════════════════"

# ── 1. Install dependencies ──
echo ""
echo "▶ Step 1/5: Installing dependencies (npm install)..."
npm install
echo "  ✓ Dependencies installed"

# ── 2. NUKE every possible stale Prisma Client location ──
# This is the critical step. If any of these directories contain stale code
# from an older schema (without the Touchpoint model), `prisma generate`
# might not fully overwrite them, and `prisma.touchpoint` will be undefined
# at runtime. Deleting them forces a clean regeneration.
echo ""
echo "▶ Step 2/5: Clearing stale Prisma Client cache..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client/node_modules/.prisma 2>/dev/null || true
rm -rf .next  # clear Next.js cache (which may have bundled a stale client)
echo "  ✓ Stale client cache cleared"

# ── 3. Regenerate Prisma Client ──
echo ""
echo "▶ Step 3/5: Regenerating Prisma Client (npx prisma generate)..."
npx prisma generate
echo "  ✓ Prisma Client regenerated"

# ── 4. Push schema to database ──
echo ""
echo "▶ Step 4/5: Pushing schema to database (npx prisma db push)..."
npx prisma db push
echo "  ✓ Database schema in sync"

# ── 5. Verify the Touchpoint model is available ──
echo ""
echo "▶ Step 5/5: Verifying Prisma Client has ALL models..."
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const models = ['touchpoint', 'branch', 'department', 'user', 'survey', 'response', 'campaign', 'notification', 'activityLog', 'surveyAuditLog'];
  let allOk = true;
  for (const m of models) {
    if (typeof p[m] !== 'object' || p[m] === null) {
      console.error('  ✗ prisma.' + m + ' is MISSING');
      allOk = false;
    } else {
      console.log('  ✓ prisma.' + m + ' is available');
    }
  }
  if (!allOk) {
    console.error('');
    console.error('  Some models are missing. Try running: npx prisma generate');
    process.exit(1);
  }
  const tpCount = await p.touchpoint.count().catch(() => 0);
  console.log('');
  console.log('  Touchpoint table has', tpCount, 'rows');
  await p.\$disconnect();
})();
"

echo ""
echo "══════════════════════════════════════════════════════════════════════════"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  npm run dev        # start the dev server on http://localhost:3000"
echo "  npx prisma studio  # open Prisma Studio to view the Touchpoint table"
echo "══════════════════════════════════════════════════════════════════════════"
