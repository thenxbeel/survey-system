'use client'

import { motion } from 'framer-motion'
import { AlertOctagon, ArrowRight } from 'lucide-react'
import type { PriorityCase } from '@/lib/types/analytics'

const priorityConfig: Record<PriorityCase['priority'], { bg: string; fg: string; label: string }> = {
  critical: { bg: '#FEF2F2', fg: '#E5484D', label: 'Critical' },
  high:     { bg: '#FFFBEB', fg: '#D97706', label: 'High'     },
  medium:   { bg: 'var(--tint-blue)', fg: 'var(--primary)', label: 'Medium' },
}

const npsColor = (score: number) => {
  if (score <= 6) return '#E5484D'
  if (score <= 8) return '#F5A623'
  return '#17A673'
}

export function PriorityCasesTable({ cases, delay = 0, onAssign }: { cases: PriorityCase[]; delay?: number; onAssign?: (id: string) => void }) {
  return (
    <div className="flex flex-col">
      {/* Header row */}
      <div
        className="grid grid-cols-[1.5fr_1fr_1.5fr_0.7fr_0.7fr_0.8fr_0.6fr] gap-3 border-b px-3 py-2 text-[10px] font-bold uppercase tracking-[0.07em]"
        style={{ borderColor: 'var(--border)', color: 'var(--text-light)', background: 'var(--bg-subtle)' }}
      >
        <span>Customer</span>
        <span>Branch</span>
        <span>Issue</span>
        <span>NPS</span>
        <span>Open</span>
        <span>Owner</span>
        <span></span>
      </div>
      {/* Rows */}
      {cases.map((c, i) => {
        const cfg = priorityConfig[c.priority]
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: delay + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="group grid grid-cols-[1.5fr_1fr_1.5fr_0.7fr_0.7fr_0.8fr_0.6fr] items-center gap-3 border-b px-3 py-2.5 transition-colors last:border-b-0 hover:bg-[var(--bg-subtle)]"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0B4A8B 0%, #06386F 100%)' }}
              >
                {c.respondent.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0">
                <div className="text-[11.5px] font-semibold line-clamp-2 leading-tight" style={{ color: 'var(--text)' }}>
                  {c.respondent}
                </div>
                <div className="text-[10px] line-clamp-2 leading-tight" style={{ color: 'var(--text-light)' }}>
                  {c.id} · {c.product}
                </div>
              </div>
            </div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {c.branch}
            </div>
            <div className="text-[11px] line-clamp-2 leading-tight" style={{ color: 'var(--text-secondary)' }}>
              {c.issue}
            </div>
            <div className="flex items-center gap-1">
              <span
                className="text-[11.5px] font-bold tabular"
                style={{ color: npsColor(c.npsScore) }}
              >
                {c.npsScore}
              </span>
            </div>
            <div className="text-[11px] font-semibold tabular" style={{ color: c.daysOpen > 7 ? '#E5484D' : 'var(--text-secondary)' }}>
              {c.daysOpen}d
            </div>
            <div className="text-[11px] line-clamp-2 leading-tight" style={{ color: 'var(--text-secondary)' }}>
              {c.assignedTo ?? <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
            </div>
            <div className="flex items-center justify-end gap-2">
              <span
                className="inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.05em]"
                style={{ background: cfg.bg, color: cfg.fg }}
              >
                {cfg.label}
              </span>
              {onAssign && !c.assignedTo && (
                <button
                  onClick={() => onAssign(c.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[4px] px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  Assign
                </button>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
