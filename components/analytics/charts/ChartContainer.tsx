'use client'

import { type ReactNode } from 'react'
import { ChartLoadingSkeleton } from './ChartLoadingSkeleton'
import { EmptyState } from './EmptyState'

interface ChartContainerProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  isLoading?: boolean
  isEmpty?: boolean
  action?: ReactNode      // optional right-aligned header action (e.g. period toggle)
}

/**
 * ChartContainer — premium chart wrapper used across Analytics, Customers,
 * Users, Reports, and Follow-ups.
 *
 * Polish:
 *  - 24px internal padding (p-6) so content feels naturally contained
 *  - design tokens instead of hardcoded hex
 *  - refined hover (border + subtle shadow lift)
 *  - consistent title/description hierarchy with proper breathing room
 */
export function ChartContainer({
  title,
  description,
  children,
  className = '',
  isLoading = false,
  isEmpty = false,
  action,
}: ChartContainerProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={`group flex flex-col rounded-[14px] bg-white p-8 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(13,27,46,0.06)] ${className}`}
      style={{
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className="text-[13.5px] font-bold leading-tight"
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
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {/* Fixed height of 320px so ResponsiveContainer can compute height properly */}
      <div className="h-[320px] w-full">
        {isLoading ? (
          <ChartLoadingSkeleton />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          children
        )}
      </div>
    </div>
  )
}
