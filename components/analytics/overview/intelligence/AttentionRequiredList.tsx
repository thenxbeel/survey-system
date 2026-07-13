'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle, Users, CalendarX, BellRing, type LucideIcon,
} from 'lucide-react'
import type { AttentionItem } from '@/lib/types/analytics'

const iconMap: Record<string, LucideIcon> = {
  AlertTriangle, Users, CalendarX, BellRing,
}

const severityConfig: Record<AttentionItem['severity'], { bg: string; fg: string; label: string; dot: string }> = {
  critical: { bg: '#FEF2F2', fg: '#E5484D', label: 'Critical', dot: '#E5484D' },
  warning:  { bg: '#FFFBEB', fg: '#D97706', label: 'Warning',  dot: '#F5A623' },
  info:     { bg: 'var(--tint-blue)', fg: 'var(--primary)', label: 'Info', dot: '#0B4A8B' },
}

export function AttentionRequiredList({ items, delay = 0 }: { items: AttentionItem[]; delay?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const Icon = iconMap[item.icon] ?? AlertTriangle
        const cfg = severityConfig[item.severity]
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, delay: delay + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex items-start gap-3 overflow-hidden rounded-[12px] bg-white p-8 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(13,27,46,0.06)]"
            style={{ border: '1px solid var(--border)' }}
          >
            {/* Severity stripe */}
            <div
              aria-hidden
              className="absolute left-0 top-0 h-full w-[3px] flex-shrink-0"
              style={{ background: cfg.dot }}
            />
            <div
              className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: cfg.bg, color: cfg.fg }}
            >
              <Icon size={15} strokeWidth={2.1} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="break-words text-[12.5px] font-bold leading-tight" style={{ color: 'var(--text)' }}>
                  {item.title}
                </h4>
                <span
                  className="flex-shrink-0 rounded-[4px] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em]"
                  style={{ background: cfg.bg, color: cfg.fg }}
                >
                  {cfg.label}
                </span>
              </div>
              <p className="mt-0.5 break-words text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.description}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10.5px] font-semibold">
                <span className="tabular" style={{ color: cfg.fg }}>
                  {item.metric}: <span className="font-bold">{item.metricValue}</span>
                </span>
                {item.branch && (
                  <>
                    <span style={{ color: 'var(--text-muted)' }}>·</span>
                    <span className="break-words" style={{ color: 'var(--text-light)' }}>{item.branch}</span>
                  </>
                )}
              </div>
            </div>


          </motion.div>
        )
      })}
    </div>
  )
}
