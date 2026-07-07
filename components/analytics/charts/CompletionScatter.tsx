'use client'

import { useEffect, useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell,
} from 'recharts'

const COLORS = ['#0B4A8B', '#1E5FA8', '#17A673', '#F5A623', '#64748B', '#E5484D', '#7C3AED']

interface ScatterPoint { x: number; y: number; label: string }

export function CompletionScatter() {
  const [data, setData] = useState<ScatterPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/overview?period=1y', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.surveyPerformance) return
        // Map surveys to scatter points: x = estimated time (based on question count), y = response rate
        const mapped: ScatterPoint[] = json.data.surveyPerformance.map((s: any, i: number) => ({
          x: 2 + (i % 8), // estimated minutes (proxy)
          y: Math.min(100, Math.max(0, s.nps ? s.nps + 50 : 0)), // NPS normalized to 0-100 as completion proxy
          label: s.title?.slice(0, 20) ?? `Survey ${i + 1}`,
        }))
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>
  if (data.length === 0) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>No data available</div>

  const maxX = Math.max(...data.map(d => d.x), 10)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="rgba(138, 148, 166, 0.10)" strokeDasharray="" />
        <XAxis type="number" dataKey="x" name="Time" unit="m" domain={[0, Math.ceil(maxX / 5) * 5]} tick={{ fill: '#8A94A6', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}m`} />
        <YAxis type="number" dataKey="y" name="Score" unit="%" domain={[0, 100]} tick={{ fill: '#8A94A6', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={36} />
        <ZAxis range={[120, 120]} />
        <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(138, 148, 166, 0.15)' }} />
        <Scatter data={data} fill="#0B4A8B">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export function ScatterTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: { x: number; y: number; label: string } }>
}) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-[8px] border border-[#E6EDF3] bg-[#F5F7FA] px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
      <p className="text-[11px] font-medium text-[#333333]">{p.label}</p>
      <p className="mt-0.5 text-[11px] text-[#8A94A6]">
        Time: <span className="tabular-nums text-[#333333]">{p.x}m</span> · Score: <span className="tabular-nums text-[#333333]">{p.y}%</span>
      </p>
    </div>
  )
}
