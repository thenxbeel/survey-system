'use client'

import { Inbox, type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
  /** Optional CTA button rendered below the description */
  action?: ReactNode
  /** Compact mode for use inside chart containers (smaller icon, less padding) */
  compact?: boolean
}

/**
 * EmptyState — premium empty state used across charts, tables, and lists.
 *
 * Contains:
 *  - icon in a tinted halo
 *  - bold title
 *  - helpful description
 *  - optional primary CTA
 *
 * Design tokens throughout. Compact mode for inside chart containers.
 */
export function EmptyState({
  title = 'No data for current filters',
  description = 'Try adjusting your filters or date range to see results.',
  icon: Icon = Inbox,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-3 text-center ${compact ? 'py-4' : 'py-8'}`}>
      <div
        className={`flex items-center justify-center rounded-[14px] ${compact ? 'h-10 w-10' : 'h-14 w-14'}`}
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          color: 'var(--text-light)',
        }}
      >
        <Icon size={compact ? 16 : 22} strokeWidth={1.8} />
      </div>
      <div className="max-w-[260px]">
        <h4
          className={`${compact ? 'text-[12px]' : 'text-[13.5px]'} font-bold`}
          style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
        >
          {title}
        </h4>
        <p
          className={`mt-1 ${compact ? 'text-[10.5px]' : 'text-[11.5px]'} leading-relaxed`}
          style={{ color: 'var(--text-light)' }}
        >
          {description}
        </p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
