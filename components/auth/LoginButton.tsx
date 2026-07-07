'use client'

import { type ReactNode } from 'react'

interface LoginButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
}

/**
 * Full-width 54px Sign In button — blue gradient, white text, arrow icon.
 */
export default function LoginButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
}: LoginButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="group relative inline-flex h-[50px] w-full overflow-hidden items-center justify-center gap-2.5 rounded-[12px] text-[14.5px] font-bold text-white transition-all duration-300 hover:shadow-[0_12px_32px_rgba(11,74,139,0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 40%, #0B4A8B 100%)',
        boxShadow: '0 8px 24px rgba(6,56,111,0.4), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      {/* Animated Shine Effect */}
      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-15deg)_translateX(-150%)] transition-transform duration-1000 group-hover:[transform:skew(-15deg)_translateX(150%)] pointer-events-none">
        <div className="relative h-full w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2.5">
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}
        {loading ? 'Signing in…' : children}
      </div>
    </button>
  )
}
