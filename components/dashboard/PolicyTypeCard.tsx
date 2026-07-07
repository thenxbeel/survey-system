'use client'

import { useEffect, useState } from 'react'

interface Row {
  id: string
  label: string
  value: number
  color: string
}

function colorForNps(nps: number): string {
  if (nps >= 50) return '#17A673'
  if (nps >= 0) return '#F59E0B'
  return '#E5484D'
}

export default function PolicyTypeCard({ range = '30d', branch = 'all' }: { range?: string; branch?: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/overview?period=${range}&branch=${encodeURIComponent(branch)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.surveyPerformance) return
        const mapped: Row[] = json.data.surveyPerformance
          .slice(0, 6)
          .map((s: any) => ({
            id: String(s.surveyId || s.title),
            label: s.title?.length > 22 ? s.title.slice(0, 22) + '…' : s.title,
            value: s.nps ?? 0,
            color: colorForNps(s.nps ?? 0),
          }))
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
      <div className="mb-0.5 text-[13.5px] font-bold" style={{ color: 'var(--text)' }}>By Survey</div>
      <div className="mb-5 text-[11px]" style={{ color: 'var(--text-light)' }}>NPS score per survey</div>
      <div className="flex flex-col gap-3.5">
        {loading ? (
          <div className="py-8 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>No surveys yet</div>
        ) : (
          rows.map(({ id, label, value, color }) => (
            <div key={id}>
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
