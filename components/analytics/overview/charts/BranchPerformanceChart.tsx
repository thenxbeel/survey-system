'use client'
import { useAnalytics } from '../../state/useAnalytics'
import { buildOverviewQuery, safeNumber } from '@/lib/analytics-query'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
} from 'recharts'
import { ChartTooltip } from '../../charts/ChartTooltip'

const PALETTE = ['#0B4A8B', '#1E5FA8', '#F5A623', '#17A673', '#7C3AED', '#E5484D']

interface BranchPoint { branch: string; nps: number }

export function BranchPerformanceChart() {
  const { state } = useAnalytics()
  const filters = state.filters
  const [data, setData] = useState<BranchPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/overview?${buildOverviewQuery(filters)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.branchPerformance) return
        const mapped: BranchPoint[] = json.data.branchPerformance
          .map((b: any) => ({
            branch: b.branchName.slice(0, 18),
            nps: b.nps,
          }))
          .slice(0, 6)
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
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, left: 8, bottom: 8 }}>
              <CartesianGrid horizontal={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
              <XAxis type="number" domain={[-100, 100]} tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="branch" tick={{ fill: '#4A5568', fontSize: 11.5, fontFamily: 'Inter', fontWeight: 500 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<ChartTooltip valueFormatter={(v: any) => `${Number(v) >= 0 ? '+' : ''}${v} NPS`} />} cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }} />
              <Bar dataKey="nps" radius={[0, 6, 6, 0]} barSize={22} name="NPS">
                {data.map((entry, i) => (
                  <Cell key={entry.branch} fill={PALETTE[i % PALETTE.length]} />
                ))}
                <LabelList dataKey="nps" position="right" formatter={(v: number) => `${v >= 0 ? '+' : ''}${v}`} style={{ fill: '#0D1B2E', fontSize: 11, fontWeight: 700, fontFamily: 'Inter' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
