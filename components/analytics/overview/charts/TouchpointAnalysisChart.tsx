'use client'
import { useAnalytics } from '../../state/useAnalytics'
import { buildOverviewQuery, safeNumber } from '@/lib/analytics-query'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { ChartTooltip } from '../../charts/ChartTooltip'

type Metric = 'nps' | 'volume'
const metricMeta: Record<Metric, { label: string; color: string; format: (v: number) => string }> = {
  nps:     { label: 'NPS',     color: '#0B4A8B', format: (v) => `${v >= 0 ? '+' : ''}${v}` },
  volume:  { label: 'Volume',  color: '#F5A623', format: (v) => v.toLocaleString() },
}

interface TouchpointPoint { touchpoint: string; nps: number; volume: number }

export function TouchpointAnalysisChart() {
  const [metric, setMetric] = useState<Metric>('nps')
  const { state } = useAnalytics()
  const filters = state.filters
  const [rawData, setRawData] = useState<TouchpointPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/overview?${buildOverviewQuery(filters)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.surveyPerformance) return
        // Group by touchpoint
        const tpMap = new Map<string, { nps: number; volume: number }>()
        for (const s of json.data.surveyPerformance) {
          const tp = s.touchpoint || 'General'
          const entry = tpMap.get(tp) ?? { nps: 0, volume: 0 }
          entry.nps = s.nps ?? entry.nps
          entry.volume += s.responseCount ?? 0
          tpMap.set(tp, entry)
        }
        const mapped: TouchpointPoint[] = Array.from(tpMap.entries()).map(([touchpoint, v]) => ({
          touchpoint: touchpoint.slice(0, 18),
          nps: v.nps,
          volume: v.volume,
        }))
        setRawData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [filters])

  const data = rawData.map(t => ({ touchpoint: t.touchpoint, value: t[metric] }))
  const meta = metricMeta[metric]
  const sorted = [...data].sort((a, b) => b.value - a.value)

  const Toggle = (
    <div className="flex gap-0.5 rounded-[7px] p-0.5" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
      {(Object.keys(metricMeta) as Metric[]).map(m => (
        <button key={m} onClick={() => setMetric(m)} className="rounded-[5px] px-2 py-0.5 text-[10.5px] font-semibold transition-all"
          style={metric === m ? { background: '#fff', color: metricMeta[m].color, boxShadow: 'var(--shadow-xs)' } : { color: 'var(--text-light)' }}>
          {metricMeta[m].label}
        </button>
      ))}
    </div>
  )

  if (loading) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex justify-end">{Toggle}</div>
      <div className="flex-1">
        {sorted.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 36, left: 8, bottom: 8 }}>
              <CartesianGrid horizontal={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
              <XAxis type="number" tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="touchpoint" tick={{ fill: '#4A5568', fontSize: 10.5, fontFamily: 'Inter', fontWeight: 500 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip content={<ChartTooltip valueFormatter={(v: any) => meta.format(Number(v))} />} cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }} />
              <Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={16} name={meta.label}>
                {sorted.map((entry, i) => {
                  const isBottom = i >= Math.ceil(sorted.length / 2)
                  return <Cell key={entry.touchpoint} fill={isBottom ? '#E5484D' : meta.color} fillOpacity={isBottom ? 0.85 : 1} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
