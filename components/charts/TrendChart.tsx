'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Period = 'Weekly' | 'Monthly' | 'Quarterly'

interface TrendPoint {
  period: string
  nps: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="rounded-lg border border-[#E6EDF3] bg-[#F5F7FA] px-3 py-2.5 text-xs">
      <p className="mb-0.5 text-[#8A94A6]">{label}</p>
      <p className="font-semibold text-[#333333]">NPS {val >= 0 ? `+${val}` : val}</p>
    </div>
  )
}

export function TrendChart({ range = '30d', branch = 'all' }: { range?: string; branch?: string }) {
  const [period, setPeriod] = useState<Period>('Monthly')
  const [data, setData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/trends?period=${period.toLowerCase()}&branch=${encodeURIComponent(branch)}&range=${range}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        // The API returns { date, responses, completions, npsScore, csatScore }
        // Map to { period, nps }
        const mapped: TrendPoint[] = json.data.map((d: any) => ({
          period: d.date,
          nps: d.npsScore ?? 0,
        }))
        setData(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [period, range, branch])

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#8A94A6]">
          {loading ? 'Loading…' : `${data.length}-Month NPS Trend (Live)`}
        </span>
        <div className="flex gap-0.5">
          {(['Weekly', 'Monthly', 'Quarterly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-[5px] border px-2.5 py-1 text-[11px] transition-all duration-75
                ${period === p
                  ? 'border-[#E6EDF3] bg-[#F5F7FA] text-[#333333]'
                  : 'border-transparent bg-transparent text-[#8A94A6] hover:text-[#333333]'
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[12px] text-[#8A94A6]">
            Loading trend data…
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12px] text-[#8A94A6]">
            No trend data available yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6EDF3" vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: '#8A94A6' }}
                axisLine={{ stroke: '#E6EDF3' }}
                tickLine={false}
              />
              <YAxis
                domain={[-100, 100]}
                tick={{ fontSize: 11, fill: '#8A94A6' }}
                axisLine={{ stroke: '#E6EDF3' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="nps"
                stroke="#0B4A8B"
                strokeWidth={2.5}
                dot={{ fill: '#0B4A8B', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
