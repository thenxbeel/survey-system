'use client'

import { motion } from 'framer-motion'
import {
  ArrowDownRight, ArrowUpRight, TrendingUp, MailCheck, ThumbsUp, ThumbsDown,
  Minus, Smile, Zap, BellRing, type LucideIcon,
} from 'lucide-react'
import type { ExecutiveKpi } from '@/lib/types/analytics'

const iconMap: Record<string, LucideIcon> = {
  TrendingUp, MailCheck, ThumbsUp, ThumbsDown, Minus, Smile, Zap, BellRing,
}

/**
 * ExecutiveKpiCard — flagship KPI card with:
 * - Large value + suffix
 * - Trend percentage with directional arrow
 * - Comparison caption (vs previous period)
 * - Lucide icon in tinted badge
 * - Mini sparkline (SVG)
 * Subtle fade-up entrance animation via Framer Motion.
 */
export function ExecutiveKpiCard({ kpi, delay = 0 }: { kpi: ExecutiveKpi; delay?: number }) {
  const Icon = iconMap[kpi.icon] ?? TrendingUp
  const isPositive = kpi.change >= 0
  // For invertTrend metrics (detractors, open follow-ups), down is good
  const isGood = kpi.invertTrend ? !isPositive : isPositive
  const deltaColor = isGood ? '#17A673' : '#E5484D'
  const deltaBg    = isGood ? '#ECFDF5' : '#FEF2F2'

  // Sparkline geometry
  const data = kpi.sparkline
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 120, H = 44
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 6) - 3
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const linePath = `M ${pts.join(' L ')}`
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`
  const gradId   = `exec-spark-${kpi.id}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="group relative flex flex-col items-center justify-center text-center rounded-[18px] bg-white p-8 transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(13,27,46,0.1)]"
      style={{
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        minHeight: 220, /* keep cards aligned even if one has shorter comparison text */
      }}
    >
      {/* Top row: label + icon */}
      <div className="mb-4 flex flex-col items-center gap-3 w-full relative">
        <div
          className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-[12px]"
          style={{ background: kpi.tint.bg, color: kpi.tint.fg }}
        >
          <Icon size={18} strokeWidth={2.1} />
        </div>
        <span
          className="text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: 'var(--text-light)' }}
        >
          {kpi.label}
        </span>
      </div>

      {/* Value */}
      <div className="mb-3 flex items-baseline justify-center gap-2.5 leading-tight w-full">
        <span
          className="text-[36px] font-extrabold tabular leading-tight"
          style={{ color: kpi.accent, letterSpacing: '-0.035em' }}
        >
          {kpi.value}
        </span>
        {kpi.suffix && (
          <span
            className="text-[16px] font-semibold"
            style={{ color: 'var(--text-light)' }}
          >
            {kpi.suffix}
          </span>
        )}
      </div>

      {/* Trend */}
      <div className="mb-4 flex flex-col items-center justify-center gap-2 w-full">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex flex-shrink-0 items-center justify-center gap-1 rounded-[6px] px-2 py-0.5 text-[12px] font-bold tabular"
            style={{ background: deltaBg, color: deltaColor }}
          >
            {isPositive ? <ArrowUpRight size={12} strokeWidth={2.5} /> : <ArrowDownRight size={12} strokeWidth={2.5} />}
            {Math.abs(kpi.change).toFixed(1)}%
          </span>
        </div>
        <span className="text-[11px] leading-snug break-words" style={{ color: 'var(--text-muted)' }}>
          {kpi.comparison}
        </span>
      </div>

      {/* Sparkline */}
      <div className="mt-2 h-[44px] w-full">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={kpi.accent} stopOpacity="0.22" />
              <stop offset="100%" stopColor={kpi.accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={kpi.accent}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* End dot */}
          {data && data.length > 0 && (
            <circle
              cx={W}
              cy={H - ((data[data.length - 1] - min) / range) * (H - 6) - 3}
              r="3"
              fill={kpi.accent}
              stroke="#fff"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>
    </motion.div>
  )
}
