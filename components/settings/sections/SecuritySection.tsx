'use client'

import { useState } from 'react'
import {
  Lock, Eye, EyeOff, Check, Loader2,
} from 'lucide-react'
import { SettingsCard, Field, TextInput } from '../SettingsCard'
import { useToast } from '@/lib/stores/ToastStore'

interface Props {
  delay?: number
}

export function SecuritySection({ delay = 0 }: Props) {
  const toast = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Change-password submission state
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState<string | null>(null)

  // Password strength (mock — based on length)
  const strength = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : 3
  const strengthLabels = ['—', 'Weak', 'Good', 'Strong']
  const strengthColors = ['#B0BDCC', '#E5484D', '#F5A623', '#17A673']

  // ── Change Password submit ────────────────────────────────────────────────
  async function handleChangePassword() {
    setPwError(null)
    setPwSuccess(null)

    // Client-side guard: confirm match before round-trip
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill in all three password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match.')
      return
    }

    setPwLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const json = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
      if (!res.ok || !json?.success) {
        const msg = json?.message || `HTTP ${res.status}`
        setPwError(msg)
        toast.error('Password not changed', msg)
        return
      }
      // Success — clear form, surface message
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPwSuccess(json.message || 'Password updated successfully.')
      toast.success('Password updated', json.message || 'Your password has been changed.')
    } catch {
      setPwError('Could not reach the server. Please try again.')
      toast.error('Network error', 'Could not reach the server.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Change Password */}
      <SettingsCard
        title="Change Password"
        description="Update your account password regularly for security"
        icon={Lock}
        accent="var(--primary)"
        delay={delay}
        action={
          <button
            onClick={handleChangePassword}
            disabled={pwLoading}
            className="inline-flex h-[32px] items-center gap-2.5 rounded-[9px] px-3 text-[11.5px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 items-center justify-center text-center"
            style={{ background: 'var(--primary)' }}
          >
            {pwLoading ? <Loader2 size={12} strokeWidth={2.2} className="animate-spin" /> : <Check size={12} strokeWidth={2.2} />}
            {pwLoading ? 'Updating…' : 'Update'}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Hidden username field to trap browser autofill so it doesn't fill the global search bar */}
          <input type="text" autoComplete="username" className="hidden" aria-hidden="true" readOnly />
          <Field label="Current Password">
            <div className="relative">
              <TextInput
                value={currentPassword}
                onChange={setCurrentPassword}
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[4px] p-1"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Toggle visibility"
              >
                {showCurrent ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </Field>
          <Field label="New Password" hint={`Strength: ${strengthLabels[strength]}`}>
            <div className="relative">
              <TextInput
                value={newPassword}
                onChange={setNewPassword}
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowNew(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[4px] p-1"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Toggle visibility"
              >
                {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-1 flex h-[3px] gap-0.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="h-full flex-1 rounded-full transition-all"
                    style={{ background: i < strength ? strengthColors[strength] : 'var(--bg-subtle)' }}
                  />
                ))}
              </div>
            )}
          </Field>
          <Field label="Confirm Password">
            <div className="relative">
              <TextInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[4px] p-1"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Toggle visibility"
              >
                {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <span className="text-[10.5px] font-semibold" style={{ color: 'var(--red)' }}>Passwords don't match</span>
            )}
            {confirmPassword && confirmPassword === newPassword && (
              <span className="text-[10.5px] font-semibold" style={{ color: 'var(--emerald)' }}>✓ Passwords match</span>
            )}
          </Field>
        </div>

        {/* Inline status line — no layout change, just a feedback row below the grid */}
        {(pwError || pwSuccess) && (
          <div className="mt-4">
            {pwError && (
              <div
                className="rounded-[9px] px-3 py-2 text-[11.5px] font-semibold"
                style={{ background: 'var(--tint-red)', color: 'var(--red)', border: '1px solid rgba(229,72,77,0.25)' }}
              >
                {pwError}
              </div>
            )}
            {pwSuccess && !pwError && (
              <div
                className="rounded-[9px] px-3 py-2 text-[11.5px] font-semibold"
                style={{ background: 'var(--tint-emerald)', color: 'var(--emerald)', border: '1px solid rgba(23,166,115,0.25)' }}
              >
                {pwSuccess}
              </div>
            )}
          </div>
        )}
      </SettingsCard>
    </div>
  )
}
