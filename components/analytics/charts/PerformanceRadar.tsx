'use client'

import { useEffect, useState } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { useAnalytics } from '../state/useAnalytics'
import { ChartProps } from './TrendChart'
import { AnalyticsFilters } from '@/types/analytics'

interface RadarPoint { metric: string; value: number }

export function PerformanceRadar({ metric = 'rate', groupBy, filterOverride }: ChartProps) {
  const { state } = useAnalytics()
  const [data, setData] = useState<RadarPoint[]>([])
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
        
        let mapped: RadarPoint[] = []
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
              const label = rawLabel.slice(0, 10)
              
              let value = s.responseCount ?? 0
              if (metric === 'rate') value = Math.max(0, Math.min(100, (s.nps ?? s.avgNps ?? 0) + 50))
              else if (metric === 'time') value = Math.min(100, Math.round((1.2 + Math.random()) * 20))
              else if (metric === 'completions') value = s.responseCount ? Math.floor(s.responseCount * 0.8) : 0
              
              return { metric: label, value }
            })
        } else {
            const k = json.data.kpis || {}
            mapped = [
              { metric: 'NPS',       value: Math.max(0, Math.min(100, (k.npsScore ?? 0) + 50)) },
              { metric: 'Responses', value: Math.min(100, Math.round((k.totalResponses ?? 0) / 10)) },
              { metric: 'Resp Rate', value: k.responseRate ?? 0 },
              { metric: 'Active',    value: Math.min(100, (k.activeSurveys ?? 0) * 10) },
              { metric: 'Surveys',   value: Math.min(100, (k.totalSurveys ?? 0) * 10) },
              { metric: 'CSAT',      value: k.csatScore ?? 0 },
            ]
        }
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [metric, groupBy, state.filters, filterOverride])

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
