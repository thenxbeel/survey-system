'use client'
import { useAnalytics } from '../../state/useAnalytics'

import { useEffect, useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface HeatmapEntry {
  day: string
  hour: string
  value: number
}

export function ResponseHeatmap() {
  const { state } = useAnalytics()
  const filters = state.filters
  const [grid, setGrid] = useState<HeatmapEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/heatmap', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        if (Array.isArray(json.data)) {
          setGrid(json.data)
        } else {
          setGrid(json.data.grid?.map((g: any) => ({ day: g.y, hour: g.x, value: g.value })) || [])
        }
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [filters])

  // Build a lookup map for quick access
  const valueMap = new Map<string, number>()
  for (const entry of grid) {
    valueMap.set(`${entry.day}-${entry.hour}`, entry.value)
  }

  const colorForValue = (v: number) => {
    if (v === 0) return 'var(--bg-subtle)'
    const opacity = Math.min(1, v / 4)
    return `rgba(11, 74, 139, ${0.15 + opacity * 0.75})`
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading heatmap…</div>
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-[3px]">
          {/* Hour header */}
          <div className="flex gap-[3px]">
            <div className="w-[28px] flex-shrink-0" />
            {HOURS.map(h => (
              <div key={h} className="flex-1 min-w-[14px] text-center text-[8px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                {h % 3 === 0 ? h : ''}
              </div>
            ))}
          </div>
          {/* Day rows */}
          {DAYS.map(day => (
            <div key={day} className="flex gap-[3px]">
              <div className="w-[28px] flex-shrink-0 text-[9px] font-semibold flex items-center" style={{ color: 'var(--text-light)' }}>
                {day}
              </div>
              {HOURS.map(h => {
                const v = valueMap.get(`${day}-${h}`) ?? 0
                return (
                  <div
                    key={`${day}-${h}`}
                    className="flex-1 min-w-[14px] h-[18px] rounded-[2px] transition-all hover:scale-110"
                    style={{ background: colorForValue(v) }}
                    title={`${day} ${h}:00 — ${v} responses`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-2.5">
        <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>Less</span>
        {[0, 1, 2, 3, 4].map(v => (
          <div key={v} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: colorForValue(v) }} />
        ))}
        <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  )
}
