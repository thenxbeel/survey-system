'use client'

import { TrendingUp, TrendingDown, Sparkles, ArrowUpRight } from 'lucide-react'
import { InsightData } from '@/types/analytics'

const impactStyles: Record<InsightData['impact'], { bg: string; text: string; label: string }> = {
  high:   { bg: 'rgba(229, 72, 77,0.12)',  text: '#E5484D', label: 'High impact'   },
  medium: { bg: 'rgba(245, 166, 35,0.12)', text: '#F5A623', label: 'Medium impact' },
  low:    { bg: 'rgba(11, 74, 139,0.12)', text: '#0B4A8B', label: 'Low impact'    },
}

export function InsightCard({ insight }: { insight: InsightData; className?: string }) {
  const isUp = insight.trend === 'up'
  const impact = impactStyles[insight.impact]

  return (
    <div className="group flex flex-col gap-3 rounded-[12px] border border-[#E6EDF3] bg-[#FFFFFF] p-4 transition-all hover:border-[#B0B8C4]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[rgba(11, 74, 139,0.12)]">
            <Sparkles size={13} className="text-[#0B4A8B]" />
          </div>
          <span
            className="inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em]"
            style={{ background: impact.bg, color: impact.text }}
          >
            {impact.label}
          </span>
        </div>
        <div
          className="inline-flex items-center gap-0.5 text-[11px] font-medium"
          style={{ color: isUp ? '#17A673' : '#E5484D' }}
        >
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isUp ? 'Positive' : 'Negative'}
        </div>
      </div>

      <div>
        <h3 className="text-[13px] font-semibold leading-tight text-[#333333]">{insight.title}</h3>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#8A94A6]">{insight.description}</p>
      </div>

      {insight.metric && (
        <div className="mt-auto flex items-center justify-between border-t border-[#E6EDF3] pt-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.06em] text-[#B0B8C4]">{insight.metric}</div>
            <div className="mt-0.5 text-[12px] font-semibold tabular-nums text-[#333333]">{insight.metricValue}</div>
          </div>
          <button className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#0B4A8B] opacity-0 transition-opacity group-hover:opacity-100 items-center justify-center text-center">
            Investigate
            <ArrowUpRight size={11} />
          </button>
        </div>
      )}
    </div>
  )
}
