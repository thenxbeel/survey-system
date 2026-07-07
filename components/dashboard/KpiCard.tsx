'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

interface KpiCardProps {
  title: string
  value: string
  change: number
  changeLabel: string
  sparkData: number[]
  icon: React.ReactNode
  color: string
}

export default function KpiCard({ title, value, change, changeLabel, sparkData, icon, color }: KpiCardProps) {
  const isPositive = change > 0
  const isNeutral = change === 0
  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown
  const trendColor = isNeutral ? '#64748B' : isPositive ? '#16A34A' : '#DC2626'
  const trendBg = isNeutral ? '#F1F5F9' : isPositive ? '#F0FDF4' : '#FEF2F2'
  const data = sparkData.map((v) => ({ v }))
  const gradId = `spark-${title.replace(/[^a-z0-9]/gi, '')}`

  return (
    <div className="rs-data-card rs-data-card-hover relative flex flex-col" style={{ minHeight: 168 }}>
      <div className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: color + '15' }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>{title}</p>
        <p className="rs-num mt-2 text-3xl font-bold tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.035em' }}>{value}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ color: trendColor, background: trendBg }}>
            <TrendIcon size={11} />{Math.abs(change)}%
          </span>
          <span className="text-xs" style={{ color: 'var(--text-light)' }}>{changeLabel}</span>
        </div>
      </div>
      <div className="mt-auto h-14 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}