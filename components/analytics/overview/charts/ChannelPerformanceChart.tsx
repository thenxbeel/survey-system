'use client'
import { useAnalytics } from '../../state/useAnalytics'
import { buildOverviewQuery, safeNumber } from '@/lib/analytics-query'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
} from 'recharts'
import { ChartTooltip } from '../../charts/ChartTooltip'

interface ChannelPoint {
  channel: string
  rate: number
  color: string
}

const PALETTE = ['#0B4A8B', '#17A673', '#F5A623', '#7C3AED', '#E5484D', '#3B82F6']

export function ChannelPerformanceChart() {
  const { state } = useAnalytics()
  const filters = state.filters
  const [data, setData] = useState<ChannelPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/overview?${buildOverviewQuery(filters)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.channelPerformance) return
        const total = json.data.channelPerformance.reduce((s: number, c: any) => s + (c.responseCount ?? 0), 0)
        const mapped: ChannelPoint[] = json.data.channelPerformance.map((c: any, i: number) => ({
          channel: (c.channel ?? 'web').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          rate: total > 0 ? Math.round(((c.responseCount ?? 0) / total) * 1000) / 10 : 0,
          color: PALETTE[i % PALETTE.length],
        }))
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [filters])

  if (loading) {
    return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
            No channel data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 4, right: 32, left: 0, bottom: 8 }}
            >
              <CartesianGrid vertical={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
              <XAxis
                dataKey="channel"
                tick={{ fill: '#4A5568', fontSize: 11, fontFamily: 'Inter', fontWeight: 500 }}
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
                content={<ChartTooltip valueFormatter={(v) => `${v}%`} />}
                cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }}
              />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={32} name="Response Share %">
                {data.map((entry) => (
                  <Cell key={entry.channel} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="rate"
                  position="top"
                  formatter={(v: number) => `${v.toFixed(1)}%`}
                  style={{ fill: '#4A5568', fontSize: 10, fontWeight: 700, fontFamily: 'Inter' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
