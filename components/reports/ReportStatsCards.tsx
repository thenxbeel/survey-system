'use client'

import { motion } from 'framer-motion'
import {
  FileText, CalendarClock, CheckCircle2, Download, Clock, AlertCircle,
  BarChart3, Timer, ArrowUpRight, ArrowDownRight, type LucideIcon,
} from 'lucide-react'
import type { ReportStats } from '@/lib/types/report'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent: string
  tint: { bg: string; fg: string }
  icon: LucideIcon
  trend?: { dir: 'up' | 'down'; value: string; positive?: boolean }
  sparkData?: number[]
  delay?: number
}

function StatCard({ label, value, sub, accent, tint, icon: Icon, trend, sparkData, delay = 0 }: StatCardProps) {
  const isUp = trend?.dir === 'up'
  const isGood = trend?.positive ?? isUp
  const deltaColor = isGood ? '#17A673' : '#E5484D'
  const deltaBg    = isGood ? '#ECFDF5' : '#FEF2F2'

  const sparkPoints = sparkData && sparkData.length > 1
    ? (() => {
        const max = Math.max(...sparkData)
        const min = Math.min(...sparkData)
        const W = 100, H = 28
        return sparkData.map((v, i) => {
          const x = (i / (sparkData.length - 1)) * W
          const y = H - ((v - min) / Math.max(1, max - min)) * (H - 4) - 2
          return `${x.toFixed(1)},${y.toFixed(1)}`
        }).join(' ')
      })()
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="group relative flex flex-col items-center justify-center text-center rounded-[18px] bg-white p-8 transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(13,27,46,0.1)]"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)', minHeight: 220 }}
    >
      <div className="mb-4 flex flex-col items-center gap-3 w-full relative">
        <div
          className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-[12px]"
          style={{ background: tint.bg, color: tint.fg }}
        >
          <Icon size={18} strokeWidth={2.1} />
        </div>
        <span
          className="text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: 'var(--text-light)' }}
        >
          {label}
        </span>
      </div>

      <div className="mb-3 flex items-baseline justify-center gap-2.5 leading-tight w-full">
        <span
          className="text-[36px] font-extrabold tabular leading-tight"
          style={{ color: accent, letterSpacing: '-0.035em' }}
        >
          {value}
        </span>
      </div>

      {trend && (
        <div className="mb-4 flex flex-col items-center justify-center gap-2 w-full">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex flex-shrink-0 items-center justify-center gap-1 rounded-[6px] px-2 py-0.5 text-[12px] font-bold tabular"
              style={{ background: deltaBg, color: deltaColor }}
            >
              {isUp ? <ArrowUpRight size={12} strokeWidth={2.5} /> : <ArrowDownRight size={12} strokeWidth={2.5} />}
              {trend.value}
            </span>
          </div>
          {sub && <span className="text-[11px] leading-snug break-words" style={{ color: 'var(--text-muted)' }}>{sub}</span>}
        </div>
      )}
      {!trend && sub && (
        <div className="mb-4 text-[11px] leading-snug break-words" style={{ color: 'var(--text-muted)' }}>{sub}</div>
      )}

      {sparkPoints && (
        <div className="mt-2 h-[44px] w-full">
          <svg viewBox="0 0 100 28" width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`rep-spark-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={accent} stopOpacity="0.2" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points={`${sparkPoints} 100,28 0,28`}
              fill={`url(#rep-spark-${label.replace(/\s+/g, '-')})`}
              stroke="none"
            />
            <polyline
              points={sparkPoints}
              fill="none"
              stroke={accent}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx="100"
              cy={28 - ((sparkData![sparkData!.length - 1] - Math.min(...sparkData!)) / Math.max(1, Math.max(...sparkData!) - Math.min(...sparkData!))) * (28 - 4) - 2}
              r="3"
              fill={accent}
              stroke="#fff"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      )}
    </motion.div>
  )
}

interface Props { stats: ReportStats }

export function ReportStatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Reports"
        value={stats.totalReports}
        sub={`${stats.totalTemplates} templates`}
        accent="#0B4A8B"
        tint={{ bg: '#E8F1FA', fg: '#0B4A8B' }}
        icon={FileText}
        trend={{ dir: 'up', value: '14%', positive: true }}
        sparkData={[8, 10, 11, 12, 14, 15, 16, 16]}
        delay={0.05}
      />
      <StatCard
        label="Scheduled"
        value={stats.totalScheduled}
        sub={`${stats.activeSchedules} active`}
        accent="#F5A623"
        tint={{ bg: '#FFFBEB', fg: '#D97706' }}
        icon={CalendarClock}
        sparkData={[3, 4, 4, 5, 5, 5, 5, 5]}
        delay={0.1}
      />
      <StatCard
        label="Ready"
        value={stats.readyReports}
        sub="Available now"
        accent="#17A673"
        tint={{ bg: '#ECFDF5', fg: '#17A673' }}
        icon={CheckCircle2}
        sparkData={[10, 11, 12, 12, 13, 14, 14, 14]}
        delay={0.15}
      />
      <StatCard
        label="Avg Gen Time"
        value={stats.avgGenerationTime}
        sub="Per report"
        accent="#8FA0B5"
        tint={{ bg: 'var(--bg-subtle)', fg: '#4A5568' }}
        icon={Timer}
        sparkData={[42, 40, 38, 36, 34, 33, 32, 32]}
        delay={0.2}
      />
    </div>
  )
}
