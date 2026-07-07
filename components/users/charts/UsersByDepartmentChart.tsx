'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { ChartTooltip } from '@/components/analytics/charts/ChartTooltip'

interface Props { data: { dept: string; users: number }[] }

const COLORS = ['#0B4A8B', '#1E5FA8', '#17A673', '#F5A623', '#E5484D', '#7C3AED', '#0A84FF']

export function UsersByDepartmentChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 8 }}>
        <CartesianGrid horizontal={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
        <XAxis type="number" tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="dept" tick={{ fill: '#4A5568', fontSize: 10.5, fontFamily: 'Inter', fontWeight: 500 }} axisLine={false} tickLine={false} width={120} />
        <Tooltip content={<ChartTooltip valueFormatter={v => `${v} users`} />} cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }} />
        <Bar dataKey="users" name="Users" radius={[0, 5, 5, 0]} barSize={18}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          <LabelList
            dataKey="users"
            position="right"
            formatter={(v: number) => `${v}`}
            style={{ fill: '#0D1B2E', fontSize: 11, fontWeight: 700, fontFamily: 'Inter' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
