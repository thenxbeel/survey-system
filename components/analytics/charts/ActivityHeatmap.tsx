'use client'

import { useEffect, useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface HeatmapEntry { day: string; hour: string; value: number }

function cellColor(value: number): string {
  switch (value) {
    case 0:  return '#F5F7FA'
    case 1:  return 'rgba(11, 74, 139,0.20)'
    case 2:  return 'rgba(11, 74, 139,0.40)'
    case 3:  return 'rgba(11, 74, 139,0.65)'
    default: return '#0B4A8B'
  }
}

function cellLabel(value: number): string {
  const counts = ['No', 'Low', 'Moderate', 'High', 'Peak']
  return `${counts[value] || 'No'} activity`
}
import { useAnalytics } from '../state/useAnalytics'
import { ChartProps } from './TrendChart'
import { AnalyticsFilters } from '@/types/analytics'

export function ActivityHeatmap({ metric, groupBy, filterOverride }: ChartProps) {
  const { state } = useAnalytics()
  const [grid, setGrid] = useState<HeatmapEntry[]>([])
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

    fetch(`/api/analytics/heatmap?${params.toString()}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        setGrid(json.data)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [metric, groupBy, state.filters, filterOverride])

  const valueMap = new Map<string, number>()
  for (const entry of grid) {
    valueMap.set(`${entry.day}-${entry.hour}`, entry.value)
  }

  if (loading) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>

  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex flex-1 gap-2.5">
        {/* Day labels */}
        <div className="flex w-7 flex-col justify-around text-[9px] font-medium text-[#8A94A6]">
          {DAYS.map((d) => <span key={d} className="text-right">{d}</span>)}
        </div>

        {/* Grid */}
        <div className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]">
          {DAYS.map((day, dIdx) =>
            HOURS.map(h => {
              const value = valueMap.get(`${day}-${h}`) ?? 0
              return (
                <div
                  key={`${dIdx}-${h}`}
                  className="rounded-[2px] transition-transform hover:scale-110 hover:ring-1 hover:ring-[#0B4A8B]"
                  style={{ background: cellColor(value) }}
                  title={`${day} ${h.toString().padStart(2, '0')}:00 — ${cellLabel(value)}`}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Hour labels */}
      <div className="ml-8 flex justify-between text-[9px] text-[#8A94A6]">
        {[0, 6, 12, 18, 23].map(h => (
          <span key={h}>{h.toString().padStart(2, '0')}:00</span>
        ))}
      </div>

      {/* Legend */}
      <div className="ml-8 mt-1 flex items-center justify-end gap-2.5 text-[9px] text-[#8A94A6]">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(v => (
          <span key={v} className="h-3 w-3 rounded-[2px]" style={{ background: cellColor(v) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
