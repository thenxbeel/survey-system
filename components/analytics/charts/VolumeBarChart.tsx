'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'

const COLORS = ['#0B4A8B', '#1E5FA8', '#17A673', '#F5A623', '#64748B', '#7C3AED']

interface BarPoint { label: string; value: number }

export function VolumeBarChart() {
  const [data, setData] = useState<BarPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/overview?period=1y', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.surveyPerformance) return
        const mapped: BarPoint[] = json.data.surveyPerformance
          .slice(0, 6)
          .map((s: any) => ({
            label: s.title?.length > 18 ? s.title.slice(0, 18) + '…' : s.title,
            value: s.responseCount ?? 0,
          }))
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [])

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
