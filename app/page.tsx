import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/jwt'

// ─── Root route ─────────────────────────────────────────────────────────────
// "/" is no longer the dashboard. It redirects to:
//   • /dashboard  if a valid JWT cookie exists (user is authenticated)
//   • /login      otherwise
//
// This is a server component so there is zero client-side flash — the redirect
// happens before any HTML is sent to the browser. Middleware also enforces this
// on the edge, but this server check is the primary (fastest) path.

const COOKIE_NAME = 'token'

export default async function RootPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  let authed = false
  if (token) {
    try {
      verifyToken(token)
      authed = true
    } catch {
      authed = false
    }
  }

  redirect(authed ? '/dashboard' : '/login')
}
