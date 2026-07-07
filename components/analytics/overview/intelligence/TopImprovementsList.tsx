'use client'

import { motion } from 'framer-motion'
import {
  Clock, Smartphone, CalendarClock, PhoneCall, type LucideIcon, ArrowRight,
} from 'lucide-react'
import type { Improvement } from '@/lib/types/analytics'

const iconMap: Record<string, LucideIcon> = {
  Clock, Smartphone, CalendarClock, PhoneCall,
}

const impactColors: Record<Improvement['impact'], { bg: string; fg: string }> = {
  high:   { bg: '#FEF2F2', fg: '#E5484D' },
  medium: { bg: '#FFFBEB', fg: '#D97706' },
  low:    { bg: 'var(--tint-blue)', fg: 'var(--primary)' },
}

const effortLabels: Record<Improvement['effort'], string> = {
  low:    'Low effort',
  medium: 'Medium effort',
  high:   'High effort',
}

export function TopImprovementsList({ items, delay = 0 }: { items: Improvement[]; delay?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((imp, i) => {
        const Icon = iconMap[imp.icon] ?? Clock
        const colors = impactColors[imp.impact]
        return (
          <motion.div
            key={imp.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, delay: delay + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="group flex items-start gap-3 rounded-[12px] bg-white p-8 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(13,27,46,0.06)]"
            style={{ border: '1px solid var(--border)' }}
          >
            <div
              className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: colors.bg, color: colors.fg }}
            >
              <Icon size={15} strokeWidth={2.1} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-[12.5px] font-bold leading-tight" style={{ color: 'var(--text)' }}>
                  {imp.title}
                </h4>
                <span
                  className="flex-shrink-0 rounded-[5px] px-1.5 py-0.5 text-[10px] font-bold tabular"
                  style={{ background: '#ECFDF5', color: '#17A673' }}
                >
                  {imp.expectedGain}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {imp.description}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.04em]" style={{ color: 'var(--text-light)' }}>
                <span
                  className="rounded-[4px] px-1.5 py-0.5"
                  style={{ background: colors.bg, color: colors.fg }}
                >
                  {imp.impact} impact
                </span>
                <span style={{ color: 'var(--text-muted)' }}>·</span>
                <span>{effortLabels[imp.effort]}</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
