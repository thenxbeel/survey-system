'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { useAnalytics } from '../state/useAnalytics'
import { MetricType, GroupByType, FilterType, AnalyticsFilters } from '@/types/analytics'
import { ChartProps } from './TrendChart'

const COLORS = ['#0B4A8B', '#1E5FA8', '#17A673', '#F5A623', '#64748B', '#7C3AED']

interface BarPoint { label: string; value: number }

export function VolumeBarChart({ metric = 'responses', groupBy = 'survey', filterOverride }: ChartProps) {
  const { state } = useAnalytics()
  const [data, setData] = useState<BarPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const f: AnalyticsFilters = { ...state.filters }
    if (filterOverride && filterOverride !== 'all') {
      f.branch = filterOverride as any
    }
    
    const params = new URLSearchParams()
    if (f.period !== '30d') params.set('period', f.period)
    if (f.branch !== 'all') params.set('branch', f.branch)
    if (f.department !== 'all') params.set('department', f.department)
    if (f.touchpoint !== 'all') params.set('touchpoint', f.touchpoint)
    if (f.npsCategory !== 'all') params.set('npsCategory', f.npsCategory)

    fetch(`/api/analytics/overview?${params.toString()}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        // Pick array based on groupBy
        let sourceArray = []
        if (groupBy === 'status' || groupBy === 'category') {
            sourceArray = json.data.channelPerformance || []
        } else {
            sourceArray = json.data.surveyPerformance || []
        }
        const mapped: BarPoint[] = sourceArray
          .slice(0, 6)
          .map((s: any) => ({
            label: (s.title || s.channel || '').length > 18 ? (s.title || s.channel || '').slice(0, 18) + '…' : (s.title || s.channel || 'Unknown'),
            value: metric === 'rate' ? (s.nps ?? 0) : (s.responseCount ?? 0),
          }))
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [metric, groupBy, state.filters, filterOverride])

  if (loading) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>
  if (data.length === 0) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>No data available</div>

  const maxVal = Math.max(...data.map(d => d.value), 1)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid horizontal={false} stroke="rgba(138, 148, 166, 0.10)" strokeDasharray="" />
        <XAxis type="number" tick={{ fill: '#8A94A6', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} domain={[0, Math.ceil(maxVal / 10) * 10]} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
        <YAxis type="category" dataKey="label" tick={{ fill: '#8A94A6', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
        <Tooltip content={<ChartTooltip valueFormatter={(v: any) => Number(v).toLocaleString()} />} cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
