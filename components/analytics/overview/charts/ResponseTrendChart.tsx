'use client'
import { useAnalytics } from '../../state/useAnalytics'
import { buildTrendsQuery, safeNumber } from '@/lib/analytics-query'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { ChartTooltip } from '../../charts/ChartTooltip'

type Range = '4W' | '12W' | 'YTD'

interface TrendPoint {
  week: string
  responses: number
  completions: number
}

export function ResponseTrendChart() {
  const [range, setRange] = useState<Range>('12W')
  const { state } = useAnalytics()
  const filters = state.filters
  const [allData, setAllData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/trends?${buildTrendsQuery(filters)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const mapped: TrendPoint[] = json.data.map((d: any) => ({
          week: d.date,
          responses: d.responses ?? 0,
          completions: d.completions ?? d.responses ?? 0,
        }))
        setAllData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [filters])

  const data = range === '4W' ? allData.slice(-4) : range === 'YTD' ? allData.slice(-8) : allData

  const RangeToggle = (
    <div className="flex gap-0.5 rounded-[7px] p-0.5" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
      {(['4W', '12W', 'YTD'] as Range[]).map(r => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className="rounded-[5px] px-2 py-0.5 text-[10.5px] font-semibold transition-all"
          style={range === r
            ? { background: '#fff', color: 'var(--primary)', boxShadow: 'var(--shadow-xs)' }
            : { color: 'var(--text-light)' }
          }
        >
          {r}
        </button>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-2 flex justify-end">{RangeToggle}</div>
        <div className="flex-1 flex items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Loading response trend…
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex justify-end">{RangeToggle}</div>
      <div className="flex-1">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
            No response trend data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="exec-resp-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0B4A8B" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#0B4A8B" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="exec-comp-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#17A673" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#17A673" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
              <XAxis
                dataKey="week"
                tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                orientation="right"
                tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: 'rgba(138, 148, 166, 0.2)', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="responses"
                stroke="#0B4A8B"
                strokeWidth={2.2}
                fill="url(#exec-resp-area)"
                dot={{ r: 2.5, fill: '#0B4A8B', stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 4, fill: '#0B4A8B', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="completions"
                stroke="#17A673"
                strokeWidth={2.2}
                fill="url(#exec-comp-area)"
                dot={{ r: 2.5, fill: '#17A673', stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 4, fill: '#17A673', stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
