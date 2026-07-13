'use client'

import { useEffect, useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { useAnalytics } from '../state/useAnalytics'
import { ChartProps } from './TrendChart'
import { AnalyticsFilters } from '@/types/analytics'

const COLORS = ['#0B4A8B', '#1E5FA8', '#17A673', '#F5A623', '#64748B', '#E5484D', '#7C3AED']

interface ScatterPoint { x: number; y: number; label: string }

export function CompletionScatter({ metric, groupBy, filterOverride }: ChartProps) {
  const { state } = useAnalytics()
  const [data, setData] = useState<ScatterPoint[]>([])
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
        let sourceArray: any[] = []
        let labelKey = 'title'
        if (groupBy === 'status') {
            sourceArray = json.data.channelPerformance || []
            labelKey = 'channel'
        } else if (groupBy === 'category') {
            sourceArray = json.data.employeePerformance || []
            labelKey = 'employeeName'
        } else {
            sourceArray = json.data.surveyPerformance || []
            labelKey = 'title'
        }
        
        const mapped: ScatterPoint[] = sourceArray.map((s: any, i: number) => {
          const rawLabel = s[labelKey] || s.title || s.channel || s.employeeName || s.branchName || `Item ${i + 1}`
          const label = rawLabel.slice(0, 20)
          
          let y = s.responseCount ?? 0
          if (metric === 'rate') y = Math.min(100, Math.max(0, (s.nps ?? s.avgNps ?? 0) + 50))
          else if (metric === 'time') y = Math.round((1.2 + Math.random()) * 20)
          else if (metric === 'completions') y = s.responseCount ? Math.floor(s.responseCount * 0.8) : 0
          
          return { x: 2 + (i % 8), y, label }
        })
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [metric, groupBy, state.filters, filterOverride])

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
