'use client'

import { useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const NPS_TREND = [
  { date: '2 Jun', nps: -45 },
  { date: '9 Jun', nps: -52 },
  { date: '16 Jun', nps: -48 },
  { date: '23 Jun', nps: -60 },
  { date: '30 Jun', nps: -55 },
  { date: '2 Jul', nps: -55 },
]

type Period = 'Daily' | 'Weekly' | 'Monthly'

function NpsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-white p-8 text-xs shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <p className="mb-1 font-semibold" style={{ color: 'var(--text)' }}>{label}</p>
      <p style={{ color: 'var(--primary)' }}>NPS: <span className="rs-num font-semibold">{payload[0]?.value}</span></p>
    </div>
  )
}

export default function NpsTrendChart() {
  const [period, setPeriod] = useState<Period>('Weekly')
  return (
    <div className="rs-data-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>NPS Trend</h3>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-light)' }}>Last 30 days · {period.toLowerCase()} NPS · All Branches</p>
        </div>
        <div className="flex items-center gap-2.5 rounded-[10px] p-2.5" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          {(['Daily', 'Weekly', 'Monthly'] as Period[]).map((p) => {
            const active = period === p
            return (
              <button key={p} onClick={() => setPeriod(p)} className="flex items-center justify-center text-center rounded-[8px] px-5 py-1.5 text-[11.5px] font-semibold transition-all"
                style={active ? { background: '#fff', color: 'var(--primary)', boxShadow: 'var(--shadow-xs)' } : { color: 'var(--text-light)' }}>
                {p}
              </button>
            )
          })}
        </div>
      </div>
      <div className="h-56 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={NPS_TREND} margin={{ top: 15, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid vertical={false} stroke="var(--border-soft)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-light)' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis domain={[-100, 100]} ticks={[-100, -50, 0, 50, 100]} tick={{ fontSize: 11, fill: 'var(--text-light)' }} axisLine={false} tickLine={false} dx={-10} />
            <Tooltip content={<NpsTooltip />} />
            <Line type="monotone" dataKey="nps" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }} activeDot={{ r: 6, fill: 'var(--primary)' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}