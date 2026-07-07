'use client'
import { useAnalytics } from '../../state/useAnalytics'
import { buildTrendsQuery, safeNumber } from '@/lib/analytics-query'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { ChartTooltip } from '../../charts/ChartTooltip'

type Metric = 'nps' | 'responses'

const metricConfig: Record<Metric, { color: string; label: string }> = {
  nps:       { color: '#0B4A8B', label: 'NPS'        },
  responses: { color: '#F5A623', label: 'Responses'  },
}

interface TrendPoint { month: string; nps: number; responses: number }

export function MonthlyTrendsChart() {
  const [metric, setMetric] = useState<Metric>('nps')
  const { state } = useAnalytics()
  const filters = state.filters
  const [data, setData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/trends?${buildTrendsQuery(filters)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const mapped: TrendPoint[] = json.data.map((d: any) => ({
          month: d.date,
          nps: d.npsScore ?? 0,
          responses: d.responses ?? 0,
        }))
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [filters])

  const Toggle = (
    <div className="flex gap-0.5 rounded-[7px] p-0.5" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
      {(Object.keys(metricConfig) as Metric[]).map(m => (
        <button key={m} onClick={() => setMetric(m)} className="rounded-[5px] px-2.5 py-0.5 text-[10.5px] font-semibold transition-all"
          style={metric === m ? { background: '#fff', color: metricConfig[m].color, boxShadow: 'var(--shadow-xs)' } : { color: 'var(--text-light)' }}>
          {metricConfig[m].label}
        </button>
      ))}
    </div>
  )

  const color = metricConfig[metric].color

  if (loading) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex justify-end">{Toggle}</div>
      <div className="flex-1">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="exec-monthly-bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={color} stopOpacity="1" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.55" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
              <XAxis dataKey="month" tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={6} />
              <YAxis orientation="right" tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }} />
              <Bar dataKey={metric} fill="url(#exec-monthly-bar)" radius={[4, 4, 0, 0]} barSize={22} name={metricConfig[metric].label} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
