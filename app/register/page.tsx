'use client'

import LeftPanel from '@/components/auth/LeftPanel'
import RegisterCard from '@/components/auth/RegisterCard'

/**
 * ADNTC CX Platform — Registration page.
 * Reuses the same full-screen brand panel as /login (deep blue gradient,
 * Islamic geometric pattern, Abu Dhabi skyline silhouette) and renders the
 * <RegisterCard /> in place of <LoginCard />.
 *
 * The /api/auth/register route + RegisterSchema (lib/validations.ts) already
 * existed; this page just wires them to the UI, mirroring the login page.
 */
export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full">
      <LeftPanel>
        <RegisterCard />
      </LeftPanel>
    </main>
  )
}
