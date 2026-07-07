'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { type LucideIcon, ChevronRight } from 'lucide-react'

interface SettingsCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  accent?: string
  children: ReactNode
  className?: string
  action?: ReactNode
  delay?: number
  footer?: ReactNode
}

/**
 * SettingsCard — premium grouped card with title, description, optional icon,
 * and an accent stripe on the left edge. Reused across all Settings sections.
 */
export function SettingsCard({
  title,
  description,
  icon: Icon,
  accent = 'var(--primary)',
  children,
  className = '',
  action,
  delay = 0,
  footer,
}: SettingsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-[18px] bg-white p-8 ${className}`}
      style={{
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Accent stripe */}
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-[3px] flex-shrink-0"
        style={{ background: accent }}
      />

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <div
              className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: `${accent}1A`, color: accent }}
            >
              <Icon size={16} strokeWidth={2.1} />
            </div>
          )}
          <div className="min-w-0">
            <h3
              className="text-[14px] font-extrabold leading-tight"
              style={{ color: 'var(--text)', letterSpacing: '-0.012em' }}
            >
              {title}
            </h3>
            {description && (
              <p
                className="mt-1 text-[11.5px] leading-relaxed"
                style={{ color: 'var(--text-light)' }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      <div className="flex-1">{children}</div>
      {footer && (
        <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          {footer}
        </div>
      )}
    </motion.div>
  )
}

// ─── Field components ───────────────────────────────────────────────────────

interface FieldProps {
  label: string
  hint?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function Field({ label, hint, icon: Icon, children, className = '' }: FieldProps) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-muted-foreground" style={{ color: 'var(--text-light)' }} />}
        <label
          className="text-[10.5px] font-bold uppercase tracking-[0.08em]"
          style={{ color: 'var(--text-light)' }}
        >
          {label}
        </label>
      </div>
      {children}
      {hint && (
        <span className="text-[10.5px]" style={{ color: 'var(--text-muted)' }}>{hint}</span>
      )}
    </div>
  )
}

interface TextInputProps {
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  className?: string
}

export function TextInput({ value, onChange, placeholder, type = 'text', disabled, className = '' }: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`h-[36px] w-full rounded-[9px] border bg-white px-3 text-[12px] font-medium outline-none transition-all focus:ring-2 disabled:opacity-60 ${className}`}
      style={{
        borderColor: 'var(--border)',
        color: 'var(--text)',
      }}
      onFocus={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'var(--primary)'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,74,139,0.1)'
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

interface ToggleProps {
  checked: boolean
  onChange?: (v: boolean) => void
  label?: string
  description?: string
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        {label && (
          <div className="text-[12.5px] font-semibold" style={{ color: 'var(--text)' }}>{label}</div>
        )}
        {description && (
          <div className="mt-0.5 text-[11px] leading-relaxed" style={{ color: 'var(--text-light)' }}>{description}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange?.(!checked)}
        className="relative inline-flex h-[24px] w-[44px] flex-shrink-0 items-center rounded-full transition-colors duration-200"
        style={{
          background: checked ? 'var(--primary)' : 'var(--border-strong)',
        }}
        aria-pressed={checked}
        aria-label={label}
      >
        <span
          className="inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{
            transform: checked ? 'translateX(22px)' : 'translateX(3px)',
          }}
        />
      </button>
    </label>
  )
}

// ─── Settings nav item ─────────────────────────────────────────────────────

export interface SettingsNavItem {
  id: string
  label: string
  icon: LucideIcon
  description?: string
}

interface NavItemProps {
  item: SettingsNavItem
  active: boolean
  onClick: () => void
}

export function SettingsNavItem({ item, active, onClick }: NavItemProps) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-[10px] px-6 py-3 text-left transition-all items-center justify-center text-center"
      style={active
        ? { background: 'var(--tint-blue)', color: 'var(--primary)' }
        : { color: 'var(--text-secondary)' }
      }
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'var(--bg-subtle)'
          e.currentTarget.style.color = 'var(--text)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }
      }}
    >
      <div
        className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-[8px] transition-all"
        style={active
          ? { background: 'rgba(11,74,139,0.15)', color: 'var(--primary)' }
          : { background: 'var(--bg-subtle)', color: 'var(--text-light)' }
        }
      >
        <Icon size={13} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-[12.5px] font-semibold leading-tight">{item.label}</div>
        {item.description && (
          <div className="line-clamp-2 text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>
            {item.description}
          </div>
        )}
      </div>
      {active && (
        <ChevronRight size={14} style={{ color: 'var(--primary)' }} />
      )}
    </button>
  )
}
