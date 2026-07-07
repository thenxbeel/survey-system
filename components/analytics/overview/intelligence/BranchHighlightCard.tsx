'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, MapPin, MessageSquare } from 'lucide-react'
import type { BranchHighlight } from '@/lib/types/analytics'

interface BranchHighlightCardProps {
  branch: BranchHighlight
  variant: 'high' | 'low'
  delay?: number
}

export function BranchHighlightCard({ branch, variant, delay = 0 }: BranchHighlightCardProps) {
  const isHigh = variant === 'high'
  const accent       = isHigh ? '#17A673' : '#E5484D'
  const accentBg     = isHigh ? '#ECFDF5' : '#FEF2F2'
  const changeColor  = branch.change >= 0 ? '#17A673' : '#E5484D'
  const changeBg     = branch.change >= 0 ? '#ECFDF5' : '#FEF2F2'

  // Mini sparkline
  const data = branch.trend
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 80, H = 28
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const linePath = `M ${pts.join(' L ')}`
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`
  const gradId   = `branch-spark-${variant}`

  const label = isHigh ? 'Highest Performing' : 'Needs Attention'
  const iconBg = isHigh ? '#ECFDF5' : '#FEF2F2'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="group relative flex flex-col overflow-hidden rounded-[14px] bg-white p-8"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}
    >
      {/* Top accent stripe */}
      <div
        aria-hidden
        className="absolute left-0 right-0 top-0 h-[3px]"
        style={{ background: accent }}
      />

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-[24px] w-[24px] items-center justify-center rounded-[7px]"
            style={{ background: accentBg, color: accent }}
          >
            {isHigh ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.08em]"
            style={{ color: accent }}
          >
            {label}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <h4 className="break-words text-[15px] font-extrabold leading-tight" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>
            {branch.name}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[10.5px]" style={{ color: 'var(--text-light)' }}>
            <MapPin size={10} className="flex-shrink-0" />
            <span className="font-semibold">{branch.responses.toLocaleString()} responses</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span>CSAT {branch.csat}%</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div
            className="text-[24px] font-extrabold leading-tight tabular"
            style={{ color: accent, letterSpacing: '-0.035em' }}
          >
            +{branch.nps}
          </div>
          <div
            className="mt-1 inline-flex items-center gap-0.5 rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold tabular"
            style={{ background: changeBg, color: changeColor }}
          >
            {branch.change >= 0 ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
            {Math.abs(branch.change).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t pt-2.5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex min-w-0 items-center gap-2.5 text-[10.5px]" style={{ color: 'var(--text-secondary)' }}>
          <MessageSquare size={11} className="flex-shrink-0" style={{ color: 'var(--text-light)' }} />
          <span className="break-words">Top: <span className="font-bold" style={{ color: 'var(--text)' }}>{branch.topTouchpoint}</span></span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[28px] w-[80px] flex-shrink-0" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={accent} stopOpacity="0.25" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradId})`} />
          <path d={linePath} fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </motion.div>
  )
}
