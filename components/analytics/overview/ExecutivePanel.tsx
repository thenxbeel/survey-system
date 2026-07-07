'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChartLoadingSkeleton } from '@/components/analytics/charts/ChartLoadingSkeleton'
import { EmptyState } from '@/components/analytics/charts/EmptyState'

interface ExecutivePanelProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  isLoading?: boolean
  isEmpty?: boolean
  action?: ReactNode
  icon?: ReactNode
  accent?: string              // optional accent stripe color
  delay?: number               // stagger animation
}

/**
 * ExecutivePanel — premium chart container matching the enterprise design system.
 * Replaces ChartContainer on the Executive Analytics Overview tab.
 */
export function ExecutivePanel({
  title,
  description,
  children,
  className = '',
  isLoading = false,
  isEmpty = false,
  action,
  icon,
  accent,
  delay = 0,
}: ExecutivePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay, ease: [0.16, 1, 0.3, 1] }}
      role="region"
      aria-label={title}
      className={`group relative flex flex-col overflow-hidden rounded-[18px] bg-white transition-all duration-200 hover:shadow-[0_8px_32px_rgba(13,27,46,0.08)] ${className}`}
      style={{
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Accent stripe (optional) */}
      {accent && (
        <div
          aria-hidden
          className="absolute left-0 top-0 h-full w-[3px] flex-shrink-0"
          style={{ background: accent }}
        />
      )}

      <div className="flex items-start justify-between gap-3 px-8 pb-4 pt-6">
        <div className="flex min-w-0 items-start gap-2.5">
          {icon && (
            <div
              className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[9px]"
              style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h3
              className="text-[13.5px] font-bold leading-tight"
              style={{ color: 'var(--text)', letterSpacing: '-0.012em' }}
            >
              {title}
            </h3>
            {description && (
              <p
                className="mt-1 text-[11.5px] leading-relaxed break-words"
                style={{ color: 'var(--text-light)' }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      <div className="flex-1 px-8 pb-8">
        {isLoading ? (
          <ChartLoadingSkeleton />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          children
        )}
      </div>
    </motion.div>
  )
}
