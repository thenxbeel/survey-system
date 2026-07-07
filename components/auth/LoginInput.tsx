'use client'

import { type ReactNode } from 'react'

interface LoginInputProps {
  type?: string
  placeholder: string
  icon?: ReactNode
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  autoComplete?: string
  name?: string
  id?: string
  rightSlot?: ReactNode
}

/**
 * Premium 56px glass input for the blue login panel.
 */
export default function LoginInput({
  type = 'text',
  placeholder,
  icon,
  value,
  onChange,
  onKeyDown,
  autoComplete,
  name,
  id,
  rightSlot,
}: LoginInputProps) {
  return (
    <div className="group relative w-full">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoComplete={autoComplete}
        name={name}
        className={[
          'peer h-[50px] w-full rounded-full py-2.5 pr-4',
          'text-[13.5px] font-medium text-white placeholder:text-white/40 outline-none',
          'transition-all duration-300',
          icon ? 'pl-[46px]' : 'pl-4',
          rightSlot ? 'pr-12' : '',
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
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50 transition-colors duration-150 peer-focus:text-white/80 peer-autofill:text-[#0D1B2E]">
          {icon}
        </div>
      )}
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  )
}
