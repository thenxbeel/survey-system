'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartTooltip } from '@/components/analytics/charts/ChartTooltip'

interface Props { data: { period: string; nps: number | null; responses: number }[] }

export function NpsTrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id="rpt-nps-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B4A8B" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0B4A8B" stopOpacity="0" />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
        <XAxis dataKey="period" tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={6} />
        <YAxis orientation="right" tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={36} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(138, 148, 166, 0.2)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="nps"
          name="NPS"
          stroke="#0B4A8B"
          strokeWidth={2.2}
          fill="url(#rpt-nps-grad)"
          connectNulls={false}
          dot={{ r: 3, fill: '#0B4A8B', stroke: '#FFFFFF', strokeWidth: 2 }}
          activeDot={{ r: 5, fill: '#0B4A8B', stroke: '#FFFFFF', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
