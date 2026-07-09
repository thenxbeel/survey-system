'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Sparkles, ArrowUpRight, type LucideIcon,
} from 'lucide-react'
import type { AiInsight } from '@/lib/types/analytics'

const impactStyles: Record<AiInsight['impact'], { bg: string; text: string; label: string }> = {
  high:   { bg: 'rgba(229, 72, 77, 0.10)',  text: '#E5484D', label: 'High impact'   },
  medium: { bg: 'rgba(245, 166, 35, 0.12)', text: '#D97706', label: 'Medium impact' },
  low:    { bg: 'rgba(11, 74, 139, 0.10)',  text: '#0B4A8B', label: 'Low impact'    },
}

const categoryLabels: Record<AiInsight['category'], string> = {
  opportunity: 'Opportunity',
  risk:        'Risk',
  trend:       'Trend',
  anomaly:     'Anomaly',
}

export function ExecutiveInsightCard({ insight, delay = 0 }: { insight: AiInsight; delay?: number }) {
  const isUp = insight.trend === 'up'
  const impact = impactStyles[insight.impact]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="group flex flex-col gap-2.5 rounded-[18px] bg-white p-8 transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(13,27,46,0.08)]"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px]"
            style={{ background: 'var(--tint-purple)', color: '#7C3AED' }}
          >
            <Sparkles size={12} />
          </div>
          <span
            className="inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em]"
            style={{ background: impact.bg, color: impact.text }}
          >
            {impact.label}
          </span>
          <span
            className="inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.04em]"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-light)' }}
          >
            {categoryLabels[insight.category]}
          </span>
        </div>
        <div
          className="inline-flex items-center gap-0.5 text-[10.5px] font-bold"
          style={{ color: isUp ? '#17A673' : '#E5484D' }}
        >
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isUp ? 'Up' : 'Down'}
        </div>
      </div>

      <div>
        <h4 className="break-words text-[12.5px] font-bold leading-tight" style={{ color: 'var(--text)' }}>
          {insight.title}
        </h4>
        <p className="mt-1 break-words text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {insight.description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t pt-2.5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          {insight.metric && (
            <div>
              <div className="text-[9.5px] uppercase tracking-[0.06em] font-semibold" style={{ color: 'var(--text-muted)' }}>
                {insight.metric}
              </div>
              <div className="mt-0.5 text-[11.5px] font-bold tabular" style={{ color: 'var(--text)' }}>
                {insight.metricValue}
              </div>
            </div>
          )}
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.06em] font-semibold" style={{ color: 'var(--text-muted)' }}>
              Confidence
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              <div className="h-[3px] w-[44px] overflow-hidden rounded-full" style={{ background: 'var(--bg-subtle)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${insight.confidence}%`, background: 'var(--primary)' }}
                />
              </div>
              <span className="text-[10.5px] font-bold tabular" style={{ color: 'var(--text)' }}>
                {insight.confidence}%
              </span>
            </div>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold opacity-0 transition-opacity group-hover:opacity-100 items-center justify-center text-center"
          style={{ color: 'var(--primary)' }}
        >
          Investigate
          <ArrowUpRight size={11} />
        </button>
      </div>
    </motion.div>
  )
}
