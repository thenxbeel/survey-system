'use client'
import { useAnalytics } from '../../state/useAnalytics'
import { buildOverviewQuery, safeNumber } from '@/lib/analytics-query'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend,
} from 'recharts'

interface DeptPoint { metric: string; NPS: number; CSAT: number }

export function DepartmentPerformanceChart() {
  const { state } = useAnalytics()
  const filters = state.filters
  const [data, setData] = useState<DeptPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/overview?${buildOverviewQuery(filters)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.employeePerformance) return
        const mapped: DeptPoint[] = json.data.employeePerformance
          .filter((e: any) => e.nps !== null && e.nps !== undefined)
          .map((e: any) => ({
            metric: (e.department ?? e.employeeName ?? '—').slice(0, 15),
            NPS: Math.max(0, Math.min(100, safeNumber(e.nps) + 50)),
            CSAT: e.avgNps ? Math.min(100, safeNumber(e.avgNps) * 10) : 0,
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
            <RadarChart data={data} outerRadius="72%">
              <PolarGrid stroke="rgba(138, 148, 166, 0.18)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#4A5568', fontSize: 10.5, fontFamily: 'Inter', fontWeight: 500 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#B0BDCC', fontSize: 9, fontFamily: 'Inter' }} stroke="rgba(138, 148, 166, 0.12)" />
              <Radar name="NPS" dataKey="NPS" stroke="#0B4A8B" strokeWidth={2} fill="#0B4A8B" fillOpacity={0.22} />
              <Radar name="CSAT" dataKey="CSAT" stroke="#17A673" strokeWidth={2} fill="#17A673" fillOpacity={0.22} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F3', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} labelStyle={{ color: '#4A5568', fontWeight: 600 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
