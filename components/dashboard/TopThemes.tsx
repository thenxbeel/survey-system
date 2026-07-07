'use client'

import { useEffect, useState } from 'react'

interface Theme {
  label: string
  count: number
  color: string
  fg: string
}

const PALETTE = [
  { color: '#EFF6FF', fg: '#0B4A8B' },
  { color: '#ECFDF5', fg: '#17A673' },
  { color: '#FFFBEB', fg: '#D97706' },
  { color: '#F5F3FF', fg: '#7C3AED' },
  { color: '#FEF2F2', fg: '#E5484D' },
]

export default function TopThemes({ range = '30d', branch = 'all' }: { range?: string; branch?: string }) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Derive "themes" from the actual survey touchpoints in the database.
    // Each touchpoint becomes a theme tag, weighted by its response count.
    fetch(`/api/analytics/overview?period=${range}&branch=${encodeURIComponent(branch)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.surveyPerformance) return
        // Group by touchpoint and sum response counts
        const touchpointMap = new Map<string, number>()
        for (const s of json.data.surveyPerformance) {
          const tp = s.touchpoint || 'General'
          touchpointMap.set(tp, (touchpointMap.get(tp) ?? 0) + (s.responseCount ?? 0))
        }
        const mapped: Theme[] = Array.from(touchpointMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([label, count], i) => ({
            label,
            count,
            color: PALETTE[i % PALETTE.length].color,
            fg: PALETTE[i % PALETTE.length].fg,
          }))
        setThemes(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [range, branch])

  return (
    <div
      className="flex flex-col rounded-[18px] bg-white p-8"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
      <div className="mb-0.5 text-[13.5px] font-bold" style={{ color: 'var(--text)' }}>Top Touchpoints</div>
      <div className="mb-5 flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-light)' }}>
        By response volume
        <span
          className="rounded-[4px] px-1.5 py-0.5 text-[8.5px] font-bold text-white"
          style={{ background: '#0B4A8B' }}
        >
          LIVE
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {loading ? (
          <div className="py-8 text-center text-[11px] w-full" style={{ color: 'var(--text-muted)' }}>Loading…</div>
        ) : themes.length === 0 ? (
          <div className="py-8 text-center text-[11px] w-full" style={{ color: 'var(--text-muted)' }}>No touchpoint data yet</div>
        ) : (
          themes.map(({ label, count, color, fg }) => (
            <div
              key={label}
              className="flex cursor-default items-center gap-2.5 rounded-[8px] px-2.5 py-[5px] text-[11px] font-medium transition-all hover:opacity-80"
              style={{ background: color, color: fg }}
            >
              {label}
              <span className="font-bold opacity-60">· {count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
