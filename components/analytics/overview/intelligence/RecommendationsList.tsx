'use client'

import { motion } from 'framer-motion'
import {
  Smartphone, Timer, CalendarClock, GraduationCap, type LucideIcon, ArrowRight,
} from 'lucide-react'
import type { Recommendation } from '@/lib/types/analytics'

const iconMap: Record<string, LucideIcon> = {
  Smartphone, Timer, CalendarClock, GraduationCap,
}

const categoryConfig: Record<Recommendation['category'], { bg: string; fg: string; label: string }> = {
  process:       { bg: 'var(--tint-blue)',    fg: 'var(--primary)',  label: 'Process'       },
  training:      { bg: 'var(--tint-purple)',  fg: '#7C3AED',         label: 'Training'      },
  product:       { bg: '#ECFDF5',             fg: '#17A673',         label: 'Product'       },
  communication: { bg: '#FFFBEB',             fg: '#D97706',         label: 'Communication' },
}

export function RecommendationsList({ items, delay = 0 }: { items: Recommendation[]; delay?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((rec, i) => {
        const Icon = iconMap[rec.icon] ?? Smartphone
        const cfg = categoryConfig[rec.category]
        return (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, delay: delay + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="group flex items-start gap-3 rounded-[12px] bg-white p-8 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(13,27,46,0.06)]"
            style={{ border: '1px solid var(--border)' }}
          >
            <div
              className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: cfg.bg, color: cfg.fg }}
            >
              <Icon size={15} strokeWidth={2.1} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-[12.5px] font-bold leading-tight" style={{ color: 'var(--text)' }}>
                  {rec.title}
                </h4>
                <span
                  className="flex-shrink-0 rounded-[4px] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em]"
                  style={{ background: cfg.bg, color: cfg.fg }}
                >
                  {cfg.label}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {rec.description}
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-[10.5px] font-semibold">
                <span className="flex items-center gap-1">
                  <span style={{ color: 'var(--text-light)' }}>Impact:</span>
                  <span className="font-bold" style={{ color: '#17A673' }}>{rec.expectedImpact}</span>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>·</span>
                <span className="flex items-center gap-1">
                  <span style={{ color: 'var(--text-light)' }}>Timeline:</span>
                  <span className="font-bold" style={{ color: 'var(--text)' }}>{rec.timeframe}</span>
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
