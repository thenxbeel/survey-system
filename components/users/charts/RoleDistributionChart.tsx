'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartTooltip } from '@/components/analytics/charts/ChartTooltip'
import { ChartLegend } from '@/components/analytics/charts/ChartLegend'
import { ROLES, ROLE_META, type UserStats } from '@/lib/types/user'

interface Props { stats: UserStats }

export function RoleDistributionChart({ stats }: Props) {
  const data = ROLES.map(role => ({
    label: role,
    value: stats.byRole[role] ?? 0,
    color: ROLE_META[role].color,
  })).filter(d => d.value > 0)

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex h-full items-center gap-4">
      <div className="relative h-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="85%"
              paddingAngle={3}
              stroke="none"
              isAnimationActive
            >
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip content={<ChartTooltip valueFormatter={v => `${v} users`} />} cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-extrabold leading-none tabular" style={{ color: 'var(--text)' }}>
            {total}
          </span>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.07em]" style={{ color: 'var(--text-light)' }}>
            Users
          </span>
        </div>
      </div>
      <ChartLegend
        className="flex-shrink-0"
        items={data.map(d => ({ label: d.label, value: d.value, color: d.color }))}
      />
    </div>
  )
}
