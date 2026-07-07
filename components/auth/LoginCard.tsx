'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, AlertCircle, ArrowRight, ShieldCheck, Activity, BarChart2 } from 'lucide-react'
import LoginInput from './LoginInput'
import PasswordInput from './PasswordInput'
import LoginButton from './LoginButton'
import RememberMe from './RememberMe'

/**
 * ADNTC CX Platform — Login form card.
 * Premium glassmorphism card on the blue panel.
 *
 * The whole card is wrapped in a <form> so that:
 *   - pressing Enter in either input submits the form
 *   - mobile keyboards show a "Go" key that submits
 *   - the Sign In button is type="submit"
 *
 * All authentication logic (POST /api/auth/login, token storage, redirect)
 * is preserved exactly as-is. Only the form semantics were added.
 */
export default function LoginCard() {
  const router = useRouter()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!identifier.trim() || !password) {
      setError('Please enter your email/employee ID and password.')
      return
    }

    setLoading(true)
    setError('')

    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('The server is taking too long to respond. Please check that the database is running and try again.')
    }, 15000)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      })

      const data = await response.json()

      if (!data.success) {
        clearTimeout(timeoutId)
        setError(data.message || 'Login failed. Please try again.')
        setLoading(false)
        return
      }

      if (remember) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        sessionStorage.setItem('token', data.token)
        sessionStorage.setItem('user', JSON.stringify(data.user))
      }

      clearTimeout(timeoutId)
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search)
        const redirectParam = params.get('redirect')
        window.location.href = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/dashboard'
      }, 100)
    } catch (err) {
      clearTimeout(timeoutId)
      console.error(err)
      setError('Unable to connect to the server. Please check that the dev server is running on port 3000.')
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    handleLogin()
  }

  return (
    <div className="relative group w-full">
      {/* Ambient exterior glow that activates on hover */}
      <div className="absolute -inset-0.5 rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-blue-400/20 via-indigo-500/20 to-emerald-400/20 opacity-0 blur-xl transition-all duration-1000 group-hover:opacity-100 group-hover:duration-300" />
      
      <form
        onSubmit={handleSubmit}
        className="relative w-full overflow-hidden rounded-[20px] px-6 py-4 sm:rounded-[24px] sm:px-8 sm:py-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRightColor: 'rgba(255,255,255,0.1)',
          borderBottomColor: 'rgba(255,255,255,0.1)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 40px rgba(255,255,255,0.05)',
        }}
        noValidate
      >
        {/* Volumetric interior lighting */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-blue-400/15 blur-[64px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-emerald-400/10 blur-[64px]" />

        {/* Header */}
        <div className="relative mb-6 flex flex-col items-center text-center">
          <h1
            className="mb-3 text-[26px] tracking-tight sm:text-[30px]"
            style={{ lineHeight: 1.15 }}
          >
            <span className="font-light text-white/90">Digital Survey</span>
            <br />
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
              Management System
            </span>
          </h1>
          <div className="mb-4 text-[13.5px] leading-[1.7] text-white/60 font-medium px-2">
            Access surveys, customer feedback, and experience insights across ADNTC touchpoints.
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
              <ShieldCheck size={13} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              Secure Access
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
              <Activity size={13} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
              Trusted Operations
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
              <BarChart2 size={13} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              Enterprise Reporting
            </div>
          </div>
        </div>

      {/* Form fields */}
      <div className="space-y-3">
        <div>
          <label htmlFor="identifier" className="mb-1.5 block text-[12.5px] font-semibold text-white/80">
            Username
          </label>
          <LoginInput
            id="identifier"
            placeholder="Username"
            icon={<User size={15} />}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            name="identifier"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-semibold text-white/80">
            Password
          </label>
          <PasswordInput
            id="password"
            placeholder="Password"
            icon={<Lock size={15} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-[10px] border border-[#E5484D]/40 bg-[#E5484D]/12 px-3.5 py-3">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-[#E5484D]" />
          <p className="text-[12px] leading-relaxed text-[#FCEAEA]">{error}</p>
        </div>
      )}

      {/* Remember / Forgot row */}
      <div className="my-4 flex items-center justify-between">
        <RememberMe checked={remember} onChange={setRemember} />
        <button
          type="button"
          className="flex items-center justify-center text-center text-[12.5px] font-semibold text-white/75 transition-colors hover:text-white"
        >
          Forgot Password?
        </button>
      </div>

      {/* Sign In button — type="submit" so Enter / mobile Go submits the form */}
      <LoginButton type="submit" loading={loading}>
        Sign In
        <ArrowRight size={16} />
      </LoginButton>

    </form>
    </div>
  )
}
