'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { ChartLegend } from './ChartLegend'
import { safeNumber } from '@/lib/analytics-query'

const COLORS = ['#0B4A8B', '#17A673', '#F5A623', '#7C3AED', '#E5484D', '#3B82F6']

interface PiePoint { label: string; value: number; color: string }

export function DistributionPieChart() {
  const [data, setData] = useState<PiePoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/overview?period=1y', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.npsBreakdown) return
        const b = json.data.npsBreakdown
        const total = (b.promoters ?? 0) + (b.passives ?? 0) + (b.detractors ?? 0)
        if (total === 0) return
        const mapped: PiePoint[] = [
          { label: 'Promoters', value: b.promoterPct ?? Math.round((b.promoters / total) * 100), color: COLORS[0] },
          { label: 'Passives',  value: b.passivePct  ?? Math.round((b.passives  / total) * 100), color: COLORS[1] },
          { label: 'Detractors',value: b.detractorPct?? Math.round((b.detractors/ total) * 100), color: COLORS[2] },
        ]
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>
  if (data.length === 0) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>No data available</div>

  const total = data.reduce((sum, item) => sum + safeNumber(item.value), 0)

  return (
    <div className="flex h-full items-center gap-4">
      <div className="relative h-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius="58%" outerRadius="85%" paddingAngle={3} stroke="none" isAnimationActive>
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip content={<ChartTooltip valueFormatter={(v: any) => `${v}%`} />} cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-semibold leading-none tabular-nums text-[#333333]">{total}</span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.07em] text-[#8A94A6]">Total %</span>
        </div>
      </div>
      <ChartLegend className="flex-shrink-0" items={data.map(d => ({ label: d.label, value: `${d.value}%`, color: d.color }))} />
    </div>
  )
}
