'use client'
import { useAnalytics } from '../../state/useAnalytics'
import { buildTrendsQuery, safeNumber } from '@/lib/analytics-query'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { ChartTooltip } from '../../charts/ChartTooltip'

interface TrendPoint { week: string; nps: number; responses: number }

export function WeeklyTrendsChart() {
  const { state } = useAnalytics()
  const filters = state.filters
  const [data, setData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/trends?${buildTrendsQuery(filters)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        // Use the last 12 data points as "weekly" proxy
        const mapped: TrendPoint[] = json.data.slice(-12).map((d: any, i: number) => ({
          week: d.date,
          nps: d.npsScore ?? 0,
          responses: d.responses ?? 0,
        }))
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [filters])

  if (loading) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
              <XAxis dataKey="week" tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={6} />
              <YAxis orientation="right" tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={36} domain={[-100, 100]} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(138, 148, 166, 0.2)', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="nps" stroke="#0B4A8B" strokeWidth={2.4} dot={{ r: 3, fill: '#0B4A8B', stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5, fill: '#0B4A8B', stroke: '#fff', strokeWidth: 2 }} name="NPS" />
              <Line type="monotone" dataKey="responses" stroke="#17A673" strokeWidth={2.4} dot={{ r: 3, fill: '#17A673', stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5, fill: '#17A673', stroke: '#fff', strokeWidth: 2 }} name="Responses" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
