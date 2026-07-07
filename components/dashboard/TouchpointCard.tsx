'use client'

import { useEffect, useState } from 'react'

interface Row {
  label: string
  value: number
  color: string
}

function colorForNps(nps: number): string {
  if (nps >= 50) return '#17A673'
  if (nps >= 0) return '#F59E0B'
  return '#E5484D'
}

export default function TouchpointCard({ range = '30d', branch = 'all' }: { range?: string; branch?: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/overview?period=${range}&branch=${encodeURIComponent(branch)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.channelPerformance) return
        const mapped: Row[] = json.data.channelPerformance
          .map((c: any) => ({
            label: c.channel?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) ?? '—',
            value: c.avgNps ?? 0,
            color: colorForNps(c.avgNps ?? 0),
          }))
          .filter((r: Row) => r.value > 0)
          .slice(0, 6)
        setRows(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [range, branch])

  return (
    <div
      className="flex flex-col rounded-[18px] bg-white p-8"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
      <div className="mb-0.5 text-[13.5px] font-bold" style={{ color: 'var(--text)' }}>By Channel</div>
      <div className="mb-5 text-[11px]" style={{ color: 'var(--text-light)' }}>Avg NPS per distribution channel</div>
      <div className="flex flex-col gap-3.5">
        {loading ? (
          <div className="py-8 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>No channel data yet</div>
        ) : (
          rows.map(({ label, value, color }) => (
            <div key={label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="text-[12px] font-bold tabular" style={{ color }}>{value}</span>
              </div>
              <div className="h-[5px] w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-subtle)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(0, Math.min(100, value + 100) / 2)}%`, background: color }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
