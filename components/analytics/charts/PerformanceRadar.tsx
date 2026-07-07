'use client'

import { useEffect, useState } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'

interface RadarPoint { metric: string; value: number }

export function PerformanceRadar() {
  const [data, setData] = useState<RadarPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/overview?period=1y', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.kpis) return
        const k = json.data.kpis
        // Build radar metrics from live KPIs, normalized to 0-100
        const mapped: RadarPoint[] = [
          { metric: 'NPS',       value: Math.max(0, Math.min(100, (k.npsScore ?? 0) + 50)) },
          { metric: 'Responses', value: Math.min(100, Math.round((k.totalResponses ?? 0) / 10)) },
          { metric: 'Resp Rate', value: k.responseRate ?? 0 },
          { metric: 'Active',    value: Math.min(100, (k.activeSurveys ?? 0) * 10) },
          { metric: 'Surveys',   value: Math.min(100, (k.totalSurveys ?? 0) * 10) },
          { metric: 'CSAT',      value: k.csatScore ?? 0 },
        ]
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>
  if (data.length === 0) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>No data available</div>

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.06)" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: '#8A94A6', fontSize: 10 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#B0B8C4', fontSize: 9 }} axisLine={false} tickCount={5} />
        <Tooltip content={<ChartTooltip valueFormatter={(v: any) => `${v}/100`} />} cursor={{ stroke: 'rgba(138, 148, 166, 0.15)', strokeWidth: 1 }} />
        <Radar name="Score" dataKey="value" stroke="#0B4A8B" strokeWidth={2} fill="#0B4A8B" fillOpacity={0.25} dot={{ r: 3, fill: '#0B4A8B', stroke: '#FFFFFF', strokeWidth: 2 }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
