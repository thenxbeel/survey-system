'use client'

import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const NPS_DISTRIBUTION = [
  { name: 'Detractors (0-6)', value: 6, color: '#DC2626' },
  { name: 'Passives (7-8)', value: 5, color: '#F59E0B' },
  { name: 'Promoters (9-10)', value: 0, color: '#16A34A' },
]

const TOTAL = NPS_DISTRIBUTION.reduce((s, d) => s + d.value, 0)

export default function NpsDistributionChart() {
  return (
    <div className="rs-data-card">
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>NPS Distribution</h3>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-light)' }}>Response distribution by NPS score bands</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="h-44 w-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={NPS_DISTRIBUTION} cx="50%" cy="50%" innerRadius={52} outerRadius={74} dataKey="value" strokeWidth={0}>
                {NPS_DISTRIBUTION.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          {NPS_DISTRIBUTION.map((item) => {
            const pct = TOTAL > 0 ? Math.round((item.value / TOTAL) * 1000) / 10 : 0
            return (
              <div key={item.name} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: item.color }} />
                  <span className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                </div>
                <div className="flex flex-shrink-0 items-baseline gap-2.5">
                  <span className="rs-num text-xs font-semibold" style={{ color: 'var(--text)' }}>{item.value}</span>
                  <span className="rs-num text-[11px]" style={{ color: 'var(--text-light)' }}>{pct}%</span>
                </div>
              </div>
            )
          })}
          <div className="mt-2 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--border-soft)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-light)' }}>Total Responses</span>
            <span className="rs-num text-sm font-bold" style={{ color: 'var(--text)' }}>{TOTAL}</span>
          </div>
        </div>
      </div>
    </div>
  )
}