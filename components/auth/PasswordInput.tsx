'use client'

import { useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  autoComplete?: string
  name?: string
  id?: string
  icon?: ReactNode
}

/**
 * Premium 52px glass password input with black Eye/EyeOff toggle.
 *
 * The visibility button is fully interactive:
 * - type="button" (so it never submits a parent form)
 * - no tabIndex={-1}
 * - no overlay / pointer-events blockers
 * - icon color is black (#111827) with proper hover
 */
export default function PasswordInput({
  placeholder = 'Password',
  value,
  onChange,
  onKeyDown,
  autoComplete = 'current-password',
  name,
  id,
  icon,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="group relative w-full">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoComplete={autoComplete}
        name={name}
        className={[
          'peer h-[50px] w-full rounded-full py-2.5 pr-12',
          'text-[13.5px] font-medium text-white placeholder:text-white/40 outline-none',
          'transition-all duration-300',
          icon ? 'pl-[46px]' : 'pl-4',
        ].join(' ')}
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderTopColor: 'rgba(255,255,255,0.2)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.4)'
          e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1), 0 0 0 4px rgba(59,130,246,0.3)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'
          e.currentTarget.style.borderTopColor = 'rgba(255,255,255,0.2)'
          e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}
      />
      {icon && (
        <div
          className="pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-white/50 transition-colors duration-150 peer-focus:text-white/80 peer-autofill:text-[#0D1B2E]"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3.5 top-1/2 z-[2] flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-[8px] transition-colors"
        style={{
          color: 'rgba(255,255,255,0.5)',
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
        }}
        onMouseDown={(e) => {
          // Prevent the input from losing focus when toggling visibility
          e.preventDefault()
        }}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}
