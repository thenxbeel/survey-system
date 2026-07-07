'use client'
import { useAnalytics } from '../../state/useAnalytics'
import { buildOverviewQuery, safeNumber } from '@/lib/analytics-query'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { ChartTooltip } from '../../charts/ChartTooltip'

const PALETTE = ['#0B4A8B', '#1E5FA8', '#F5A623', '#17A673', '#7C3AED', '#E5484D']

interface RegionPoint { region: string; nps: number; color: string }

export function RegionalComparisonChart() {
  const { state } = useAnalytics()
  const filters = state.filters
  const [data, setData] = useState<RegionPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/overview?${buildOverviewQuery(filters)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.campaignPerformance) return
        const mapped: RegionPoint[] = json.data.campaignPerformance
          .filter((c: any) => c.isActive)
          .slice(0, 6)
          .map((c: any, i: number) => ({
            region: c.campaignName.slice(0, 12),
            nps: c.nps ?? 0,
            color: PALETTE[i % PALETTE.length],
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
            <BarChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
              <XAxis dataKey="region" tick={{ fill: '#4A5568', fontSize: 10.5, fontFamily: 'Inter', fontWeight: 500 }} axisLine={false} tickLine={false} dy={6} interval={0} angle={-12} textAnchor="end" height={50} />
              <YAxis orientation="right" domain={[-100, 100]} tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<ChartTooltip valueFormatter={(v: any) => `${Number(v) >= 0 ? '+' : ''}${v} NPS`} />} cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }} />
              <Bar dataKey="nps" radius={[6, 6, 0, 0]} barSize={36} name="NPS">
                {data.map((entry) => (
                  <Cell key={entry.region} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
