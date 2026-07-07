'use client'

import { motion } from 'framer-motion'
import {
  Users, UserCheck, Shield, UserX, Clock, Briefcase, Activity, FileText,
  ArrowUpRight, ArrowDownRight, type LucideIcon,
} from 'lucide-react'
import type { UserStats, UserRole } from '@/lib/types/user'
import { ROLES } from '@/lib/types/user'

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
              <linearGradient id={`user-spark-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={accent} stopOpacity="0.2" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points={`${sparkPoints} 100,28 0,28`}
              fill={`url(#user-spark-${label.replace(/\s+/g, '-')})`}
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
            {sparkData && sparkData.length > 0 && (
              <circle
                cx="100"
                cy={28 - ((sparkData[sparkData.length - 1] - Math.min(...sparkData)) / Math.max(1, Math.max(...sparkData) - Math.min(...sparkData))) * (28 - 4) - 2}
                r="3"
                fill={accent}
                stroke="#fff"
                strokeWidth="1.5"
              />
            )}
          </svg>
        </div>
      )}
    </motion.div>
  )
}

interface Props { stats: UserStats }

export function UserStatsCards({ stats }: Props) {
  const activePct = stats.total > 0 ? Math.round(stats.active / stats.total * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total Users"
        value={stats.total}
        sub={`${stats.active} active`}
        accent="#0B4A8B"
        tint={{ bg: '#E8F1FA', fg: '#0B4A8B' }}
        icon={Users}
        trend={{ dir: 'up', value: '5%', positive: true }}
        sparkData={[22, 24, 25, 26, 27, 28, 29, 30]}
        delay={0.05}
      />
      <StatCard
        label="Active"
        value={stats.active}
        sub={`${activePct}% of base`}
        accent="#17A673"
        tint={{ bg: '#ECFDF5', fg: '#17A673' }}
        icon={UserCheck}
        sparkData={[18, 19, 21, 22, 23, 24, 25, 25]}
        delay={0.1}
      />
      <StatCard
        label="Suspended"
        value={stats.suspended}
        sub={`${stats.pending} pending`}
        accent="#E5484D"
        tint={{ bg: '#FEF2F2', fg: '#E5484D' }}
        icon={UserX}
        sparkData={[3, 2, 3, 3, 2, 3, 3, 3]}
        delay={0.15}
      />
      <StatCard
        label="Surveys Assigned"
        value={stats.totalSurveysAssigned}
        sub="Across active users"
        accent="#7C3AED"
        tint={{ bg: '#F5F3FF', fg: '#7C3AED' }}
        icon={FileText}
        sparkData={[420, 460, 490, 520, 550, 580, 600, 620]}
        delay={0.2}
      />
      <StatCard
        label="Roles Defined"
        value={ROLES.length}
        sub="Admin · Mgr · CS · Analyst"
        accent="#8FA0B5"
        tint={{ bg: 'var(--bg-subtle)', fg: '#4A5568' }}
        icon={Shield}
        sparkData={[6, 6, 6, 6, 6, 6, 6, 6]}
        delay={0.25}
      />
    </div>
  )
}

// Re-export for downstream consumers
export type { UserRole }
