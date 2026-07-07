'use client'

import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from 'lucide-react'
import { KpiData } from '@/types/analytics'

// Icon color mapping based on KPI accent
const ICON_MAP: Record<string, { bg: string; emoji: string }> = {
  '#0B4A8B': { bg: '#EFF6FF', emoji: '📊' },
  '#17A673': { bg: '#ECFDF5', emoji: '📩' },
  '#F5A623': { bg: '#FFFBEB', emoji: '📋' },
  '#7C3AED': { bg: '#F5F3FF', emoji: '📈' },
  '#E5484D': { bg: '#FEF2F2', emoji: '⚠️' },
  '#F59E0B': { bg: '#FFFBEB', emoji: '⭐' },
}

export function KpiCard({ kpi }: { kpi: KpiData }) {
  const isPositive = kpi.change >= 0
  // For "handling time", down is good (green); for others, up is good
  const isGood = kpi.id === 'handling-time' ? !isPositive : isPositive
  const deltaColor = isGood ? '#17A673' : '#E5484D'

  // Compute sparkline path
  const data = kpi.sparkline
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 100, H = 28
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const linePath  = `M ${pts.join(' L ')}`
  const areaPath  = `${linePath} L ${W},${H} L 0,${H} Z`
  const gradId    = `spark-${kpi.id}`

  const iconInfo = ICON_MAP[kpi.accent ?? '#0B4A8B'] ?? ICON_MAP['#0B4A8B']
  return (
    <div className="group relative flex flex-col items-center justify-center text-center rounded-[14px] border border-[#E2E8F3] bg-white p-8 min-h-[220px] transition-all hover:border-[#C8D4E3] hover:shadow-md">
      {/* Top row: icon + label + 3-dot menu */}
      <div className="flex flex-col items-center gap-4 w-full relative">
        <div
          className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-[10px] text-[18px]"
          style={{ background: iconInfo.bg }}
        >
          {iconInfo.emoji}
        </div>
        <div className="break-words text-[11px] font-semibold uppercase tracking-[0.06em] leading-tight text-[#8FA0B5]">
          {kpi.title}
        </div>
        <button
          className="absolute right-0 top-0 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[6px] text-[#B0BDCC] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#F4F7FB] hover:text-[#4A5568]"
          aria-label="More options"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Value */}
      <div className="mt-5 flex flex-col items-center gap-2 w-full">
        <div className="break-words text-[32px] font-bold leading-tight tracking-[-0.5px] tabular-nums" style={{ color: kpi.accent ?? '#0D1B2E' }}>
          {kpi.value}
          {kpi.suffix && <span className="ml-1 text-[16px] font-normal text-[#8FA0B5]">{kpi.suffix}</span>}
        </div>
        {/* Change + subtitle */}
        <div className="flex items-center justify-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-[12px] font-semibold tabular-nums"
            style={{ color: deltaColor }}
          >
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(kpi.change).toFixed(1)}%
          </span>
          {kpi.sub && (
            <span className="text-[11px] text-[#B0BDCC]">
              {kpi.sub}
            </span>
          )}
        </div>
      </div>

      {/* Sparkline */}
      <div className="mt-5 w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-8 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={kpi.accent ?? '#0B4A8B'} stopOpacity="0.18" />
              <stop offset="100%" stopColor={kpi.accent ?? '#0B4A8B'} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradId})`} />
          <path d={linePath} fill="none" stroke={kpi.accent ?? '#0B4A8B'} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
