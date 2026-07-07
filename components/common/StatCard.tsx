/**
 * StatCard — shared KPI card used by Responses, Reports, Users,
 * Customers, and Followups stat rows.
 *
 * Fixes applied vs the old per-page copies:
 *  - Sparkline x offset (2px inset each side) so stroke never clips
 *    the card border on the left/right edge.
 *  - Value text-[20px] → fits all lengths (2-char, 6-char, negative)
 *    without overflowing the card at 7-column grid widths.
 *  - Label two-line safe: leading-tight + break-words.
 *  - Icon 26×26 (was 28×28) — saves 2px width in tight columns.
 *  - All internal gaps tightened: mb-3→mb-2, mb-2.5→mb-1.5.
 */
'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react'

export interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent: string
  tint: { bg: string; fg: string }
  icon: LucideIcon
  trend?: { dir: 'up' | 'down'; value: string; positive?: boolean }
  sparkData?: number[]
  delay?: number
  /** Gradient id prefix — must be unique per page to avoid SVG id collisions */
  gradPrefix?: string
}

export function StatCard({
  label, value, sub, accent, tint, icon: Icon,
  trend, sparkData, delay = 0, gradPrefix = 'stat',
}: StatCardProps) {
  const isUp   = trend?.dir === 'up'
  const isGood = trend?.positive ?? isUp
  const deltaColor = isGood ? '#17A673' : '#E5484D'
  const deltaBg    = isGood ? '#ECFDF5' : '#FEF2F2'

  // Sparkline — 2px inset on each side so the stroke never clips
  // the card's overflow:hidden boundary at x=0 / x=100.
  const sparkPoints = sparkData && sparkData.length > 1
    ? (() => {
        const max = Math.max(...sparkData)
        const min = Math.min(...sparkData)
        const W = 96, H = 26, OX = 2   // OX = left inset
        return sparkData.map((v, i) => {
          const x = OX + (i / (sparkData.length - 1)) * W
          const y = H - ((v - min) / Math.max(1, max - min)) * (H - 4) - 2
          return `${x.toFixed(1)},${y.toFixed(1)}`
        }).join(' ')
      })()
    : null

  // Safe gradient id (no spaces)
  const gradId = `${gradPrefix}-spark-${String(label).replace(/\s+/g, '-').toLowerCase()}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="group relative flex flex-col overflow-hidden rounded-[18px] bg-white p-8! transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(13,27,46,0.1)] "
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
      {/* Label + icon */}
      <div className="mb-2 flex items-start justify-between gap-1">
        <span
          className="text-[9.5px] font-bold uppercase tracking-[0.07em] leading-tight"
          style={{ color: 'var(--text-light)' }}
        >
          {label}
        </span>
        <div
          className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[8px]"
          style={{ background: tint.bg, color: tint.fg }}
        >
          <Icon size={12} strokeWidth={2.1} />
        </div>
      </div>

      {/* Value — 20px keeps 6-char strings (e.g. "+12.3%") inside 7-col cards */}
      <div className="mb-1 leading-none">
        <span
          className="text-[20px] font-extrabold tabular block truncate"
          style={{ color: accent, letterSpacing: '-0.03em' }}
        >
          {value}
        </span>
      </div>

      {/* Trend badge + sub */}
      {trend ? (
        <div className="mb-1.5 flex flex-wrap items-center gap-1">
          <span
            className="inline-flex items-center gap-0.5 rounded-[4px] px-1 py-0.5 text-[9px] font-bold tabular flex-shrink-0"
            style={{ background: deltaBg, color: deltaColor }}
          >
            {isUp ? <ArrowUpRight size={9} strokeWidth={2.5} /> : <ArrowDownRight size={9} strokeWidth={2.5} />}
            {trend.value}
          </span>
          {sub && (
            <span className="text-[9px] leading-tight truncate" style={{ color: 'var(--text-muted)' }}>
              {sub}
            </span>
          )}
        </div>
      ) : sub ? (
        <div className="mb-1.5 text-[9.5px] leading-tight" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </div>
      ) : null}

      {/* Sparkline — inset so stroke never clips card edge */}
      {sparkPoints && (
        <div className="mt-auto h-[24px] w-full">
          <svg
            viewBox="0 0 100 28"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={accent} stopOpacity="0.18" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Fill area — closed to inset edges */}
            <polyline
              points={`${sparkPoints} 98,28 2,28`}
              fill={`url(#${gradId})`}
              stroke="none"
            />
            {/* Stroke line */}
            <polyline
              points={sparkPoints}
              fill="none"
              stroke={accent}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </motion.div>
  )
}
