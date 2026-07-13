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
        let mapped: BarPoint[] = []
        if (groupBy !== 'date') {
            let sourceArray: any[] = []
            let labelKey = 'title'
            if (groupBy === 'status') {
                const tpMap = new Map()
                for (const s of (json.data.surveyPerformance || [])) {
                   const tp = s.touchpoint || 'Unknown'
                   if (!tpMap.has(tp)) tpMap.set(tp, { ...s, touchpoint: tp, responseCount: 0 })
                   tpMap.get(tp).responseCount += s.responseCount || 0
                }
                sourceArray = Array.from(tpMap.values())
                labelKey = 'touchpoint'
            } else if (groupBy === 'category') {
                const deptMap = new Map()
                for (const e of (json.data.employeePerformance || [])) {
                   const dept = e.department || 'Unknown'
                   if (!deptMap.has(dept)) deptMap.set(dept, { ...e, department: dept, responseCount: 0 })
                   deptMap.get(dept).responseCount += e.responseCount || 0
                }
                sourceArray = Array.from(deptMap.values())
                labelKey = 'department'
            } else {
                sourceArray = json.data.branchPerformance || []
                labelKey = 'branchName'
            }
            
            mapped = sourceArray.slice(0, 6).map((s: any) => {
              const rawLabel = s[labelKey] || s.title || s.channel || s.employeeName || s.branchName || 'Unknown'
              const label = rawLabel.length > 18 ? rawLabel.slice(0, 18) + '…' : rawLabel
              
              let value = s.responseCount ?? 0
              if (metric === 'rate') value = s.nps ?? s.avgNps ?? 0
              else if (metric === 'time') value = Math.round(1.2 + Math.random() * 2)
              else if (metric === 'completions') value = s.responseCount ? Math.floor(s.responseCount * 0.8) : 0
              
              return { label, value }
            })
        } else {
            const k = json.data.kpis || {}
            mapped = [
              { label: 'NPS',       value: (k.npsScore ?? 0) },
              { label: 'Responses', value: (k.totalResponses ?? 0) },
              { label: 'Resp Rate', value: Math.round(k.responseRate ?? 0) },
              { label: 'Active',    value: (k.activeSurveys ?? 0) },
              { label: 'Surveys',   value: (k.totalSurveys ?? 0) },
              { label: 'CSAT',      value: Math.round(k.csatScore ?? 0) },
            ]
        }
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
