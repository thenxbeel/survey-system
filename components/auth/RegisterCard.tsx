'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, AlertCircle, ArrowRight, BadgeCheck } from 'lucide-react'
import LoginInput from './LoginInput'
import PasswordInput from './PasswordInput'
import LoginButton from './LoginButton'
import { RegisterSchema } from '@/lib/validations'

/**
 * ADNTC CX Platform — Registration form card.
 * Mirrors LoginCard's premium glassmorphism treatment and reuses the same
 * LoginInput / PasswordInput / LoginButton primitives.
 *
 * Validates client-side with the shared RegisterSchema (zod) before posting
 * to /api/auth/register. On success, redirects to /login so the user can
 * sign in with their new account.
 */
export default function RegisterCard() {
  const router = useRouter()

  const [employeeId, setEmployeeId] = useState('')
  const [name, setName]             = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  async function handleRegister() {
    setError('')

    // Client-side validation using the same schema as the API route
    const parsed = RegisterSchema.safeParse({
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim(),
      password,
    })

    if (!parsed.success) {
      const first = parsed.error.issues[0]
      setError(first?.message ?? 'Please check the highlighted fields.')
      return
    }

    setLoading(true)

    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('The server is taking too long to respond. Please check that the database is running and try again.')
    }, 15000)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      const data = await response.json()

      if (!data.success) {
        clearTimeout(timeoutId)
        setError(data.message || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      clearTimeout(timeoutId)
      setSuccess(true)
      // Brief success state, then redirect to login so the new user can sign in
      setTimeout(() => {
        router.push('/login?registered=1')
      }, 900)
    } catch (err) {
      clearTimeout(timeoutId)
      console.error(err)
      setError('Unable to connect to the server. Please check that the dev server is running on port 3000.')
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    handleRegister()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-[24px] p-9"
      style={{
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.16)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}
      noValidate
    >
      {/* Header */}
      <h1
        className="mb-1 text-[32px] font-extrabold text-white"
        style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}
      >
        Create Account
      </h1>
      <div className="mb-0.5 text-[14px] font-semibold text-white/85">
        Join the ADNTC CX Platform
      </div>
      <div className="mb-7 text-[12.5px] text-white/55">
        New hires register here — an administrator will approve elevated roles.
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="employeeId" className="mb-2 block text-[12px] font-semibold text-white/80">
            Employee ID
          </label>
          <LoginInput
            id="employeeId"
            placeholder="EMP001"
            icon={<BadgeCheck size={15} />}
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            autoComplete="organization"
            name="employeeId"
          />
        </div>

        <div>
          <label htmlFor="name" className="mb-2 block text-[12px] font-semibold text-white/80">
            Full Name
          </label>
          <LoginInput
            id="name"
            placeholder="Your full name"
            icon={<User size={15} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            name="name"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-[12px] font-semibold text-white/80">
            Work Email
          </label>
          <LoginInput
            id="email"
            type="email"
            placeholder="you@adntc.ae"
            icon={<Mail size={15} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            name="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-[12px] font-semibold text-white/80">
            Password
          </label>
          <PasswordInput
            id="password"
            placeholder="At least 8 characters"
            icon={<Lock size={15} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            name="password"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-[#E5484D]/40 bg-[#E5484D]/12 px-3.5 py-3">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-[#E5484D]" />
          <p className="text-[12px] leading-relaxed text-[#FCEAEA]">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-[#17A673]/40 bg-[#17A673]/12 px-3.5 py-3">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-[#17A673]" />
          <p className="text-[12px] leading-relaxed text-[#E6F7F0]">
            Account created. Redirecting you to sign in…
          </p>
        </div>
      )}

      {/* Submit */}
      <div className="mt-6">
        <LoginButton type="submit" loading={loading}>
          Create Account
          <ArrowRight size={16} />
        </LoginButton>
      </div>

      {/* Sign-in link */}
      <div className="mt-5 text-center text-[12.5px] text-white/65">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-white/90 underline-offset-2 transition-colors hover:text-white hover:underline"
        >
          Sign in
        </Link>
      </div>

      {/* Helper note */}
      <div
        className="mt-5 rounded-[12px] px-4 py-3.5"
        style={{
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/45">
          Default Access
        </div>
        <div className="text-[11.5px] leading-relaxed text-white/60">
          New registrations are created with the <span className="font-semibold text-white/80">Viewer</span> role.
          Contact your administrator to request elevated permissions.
        </div>
      </div>
    </form>
  )
}
