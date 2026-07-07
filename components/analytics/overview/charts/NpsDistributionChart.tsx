'use client'
import { useAnalytics } from '../../state/useAnalytics'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import { ChartTooltip } from '../../charts/ChartTooltip'

const categoryColors: Record<string, string> = {
  detractor: '#E5484D',
  passive:   '#F5A623',
  promoter:  '#17A673',
}

interface NpsPoint {
  score: number
  count: number
  category: string
}

export function NpsDistributionChart() {
  const { state } = useAnalytics()
  const filters = state.filters
  const [data, setData] = useState<NpsPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch responses and bucket them by NPS score
    fetch(`/api/responses?pageSize=100${filters.npsCategory !== 'all' ? '&npsCategory=' + filters.npsCategory : ''}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        // Bucket by score 0-10
        const buckets = new Map<number, number>()
        for (let s = 0; s <= 10; s++) buckets.set(s, 0)
        for (const r of json.data) {
          if (r.npsScore !== null && r.npsScore !== undefined) {
            buckets.set(r.npsScore, (buckets.get(r.npsScore) ?? 0) + 1)
          }
        }
        const mapped: NpsPoint[] = Array.from(buckets.entries()).map(([score, count]) => ({
          score,
          count,
          category: score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor',
        }))
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [filters])

  const maxCount = Math.max(...data.map(d => d.count), 1)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
        Loading NPS distribution…
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-end gap-3">
        <span className="flex items-center gap-2.5 text-[10.5px] font-semibold" style={{ color: '#E5484D' }}>
          <span className="h-[8px] w-[8px] rounded-full" style={{ background: '#E5484D' }} />
          Detractors
        </span>
        <span className="flex items-center gap-2.5 text-[10.5px] font-semibold" style={{ color: '#F5A623' }}>
          <span className="h-[8px] w-[8px] rounded-full" style={{ background: '#F5A623' }} />
          Passives
        </span>
        <span className="flex items-center gap-2.5 text-[10.5px] font-semibold" style={{ color: '#17A673' }}>
          <span className="h-[8px] w-[8px] rounded-full" style={{ background: '#17A673' }} />
          Promoters
        </span>
      </div>
      <div className="flex-1">
        {data.length === 0 || data.every(d => d.count === 0) ? (
          <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
            No NPS distribution data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
            >
              <XAxis
                dataKey="score"
                tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                orientation="right"
                tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                content={<ChartTooltip valueFormatter={(v) => `${Number(v).toLocaleString()} responses`} />}
                cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={26} name="Responses">
                {data.map((entry) => (
                  <Cell key={entry.score} fill={categoryColors[entry.category]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
