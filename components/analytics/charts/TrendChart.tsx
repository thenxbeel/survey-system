'use client'

import { useEffect, useState } from 'react'
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'

type Period = 'Weekly' | 'Monthly' | 'Quarterly'

interface TrendPoint { date: string; responses: number; completions: number }

export function TrendChart() {
  const [period, setPeriod] = useState<Period>('Monthly')
  const [data, setData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/trends?period=monthly', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const mapped: TrendPoint[] = json.data.map((d: any) => ({
          date: d.date,
          responses: d.responses ?? 0,
          completions: d.completions ?? d.responses ?? 0,
        }))
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [period])

  const PeriodToggle = (
    <div className="flex gap-0.5 rounded-[6px] border border-[#E6EDF3] bg-[#F5F7FA] p-0.5">
      {(['Weekly', 'Monthly', 'Quarterly'] as Period[]).map(p => (
        <button key={p} onClick={() => setPeriod(p)} className={`rounded-[4px] px-2 py-0.5 text-[11px] transition-all ${period === p ? 'bg-[#F5F7FA] text-[#333333]' : 'text-[#8A94A6] hover:text-[#333333]'}`}>{p}</button>
      ))}
    </div>
  )

  if (loading) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex justify-end">{PeriodToggle}</div>
      <div className="flex-1">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="trend-responses" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0B4A8B" stopOpacity="0.3" /><stop offset="100%" stopColor="#0B4A8B" stopOpacity="0" /></linearGradient>
                <linearGradient id="trend-completions" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#17A673" stopOpacity="0.25" /><stop offset="100%" stopColor="#17A673" stopOpacity="0" /></linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(138, 148, 166, 0.10)" strokeDasharray="" />
              <XAxis dataKey="date" tick={{ fill: '#8A94A6', fontSize: 11 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis orientation="right" tick={{ fill: '#8A94A6', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(138, 148, 166, 0.15)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="responses" stroke="#0B4A8B" strokeWidth={2} fill="url(#trend-responses)" dot={{ r: 3, fill: '#0B4A8B', stroke: '#FFFFFF', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#0B4A8B', stroke: '#FFFFFF', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="completions" stroke="#17A673" strokeWidth={2} fill="url(#trend-completions)" dot={{ r: 3, fill: '#17A673', stroke: '#FFFFFF', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#17A673', stroke: '#FFFFFF', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
