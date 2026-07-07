'use client'
import { useAnalytics } from '../../state/useAnalytics'
import { buildTrendsQuery, safeNumber } from '@/lib/analytics-query'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { ChartTooltip } from '../../charts/ChartTooltip'

type Range = '6M' | '12M' | 'YTD'

interface TrendPoint {
  month: string
  nps: number
  target: number
}

export function NpsTrendChart() {
  const [range, setRange] = useState<Range>('12M')
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
          month: d.date,
          nps: d.npsScore ?? 0,
          target: 70, // target line
        }))
        setAllData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [filters])

  const data = range === '6M' ? allData.slice(-6) : range === 'YTD' ? allData.slice(-5) : allData

  const RangeToggle = (
    <div className="flex gap-0.5 rounded-[7px] p-0.5" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
      {(['6M', '12M', 'YTD'] as Range[]).map(r => (
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
          Loading NPS trend…
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
            No NPS trend data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="exec-nps-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0B4A8B" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#0B4A8B" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                orientation="right"
                domain={[-100, 100]}
                tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                content={<ChartTooltip valueFormatter={(v: any) => (Number(v) >= 0 ? `+${v}` : String(v))} />}
                cursor={{ stroke: 'rgba(138, 148, 166, 0.2)', strokeWidth: 1 }}
              />
              <ReferenceLine
                y={70}
                stroke="#17A673"
                strokeDasharray="4 4"
                strokeWidth={1.2}
                label={{ value: 'Target', position: 'insideTopRight', fill: '#17A673', fontSize: 10, fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="nps"
                stroke="#0B4A8B"
                strokeWidth={2.4}
                fill="url(#exec-nps-area)"
                dot={{ r: 3, fill: '#0B4A8B', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#0B4A8B', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#17A673"
                strokeWidth={1.2}
                strokeDasharray="3 3"
                dot={false}
                legendType="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
