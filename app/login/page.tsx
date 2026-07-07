'use client'

import LeftPanel from '@/components/auth/LeftPanel'

/**
 * ADNTC CX Platform — Login page.
 * Full-screen blue brand panel — no right preview panel.
 * Middleware still redirects authenticated users away from /login before this
 * page renders — no client-side session check needed (unchanged behavior).
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen w-full">
      <LeftPanel />
    </main>
  )
}
