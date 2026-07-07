'use client'

import { motion } from 'framer-motion'
import { Building2, Shield } from 'lucide-react'
import { ChartContainer } from '@/components/analytics/charts/ChartContainer'
import { UsersByDepartmentChart } from './charts/UsersByDepartmentChart'
import { RoleDistributionChart } from './charts/RoleDistributionChart'
import { PermissionMatrix } from './PermissionMatrix'
import type { UserStats } from '@/lib/types/user'

export function UserInsights({ stats }: { stats: UserStats }) {
  const deptData = Object.entries(stats.byDepartment)
    .map(([dept, users]) => ({ dept, users }))
    .sort((a, b) => b.users - a.users)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-col gap-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[28px] w-[28px] items-center justify-center rounded-[9px]"
            style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}
          >
            <Shield size={14} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-[14.5px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>
              Workforce Insights
            </h2>
            <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>
              Department distribution, role breakdown, and permission matrix
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartContainer title="Users by Department" description="Headcount across all departments">
          <UsersByDepartmentChart data={deptData} />
        </ChartContainer>
        <ChartContainer title="Role Distribution" description={`${stats.total} users across 6 roles`}>
          <RoleDistributionChart stats={stats} />
        </ChartContainer>
      </div>

      <div
        className="rounded-[18px] bg-white p-8"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-[28px] w-[28px] items-center justify-center rounded-[9px]"
              style={{ background: 'var(--tint-purple)', color: '#7C3AED' }}
            >
              <Building2 size={14} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-[14px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>
                Permission Matrix
              </h3>
              <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>
                Module × Role access control overview
              </p>
            </div>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.06em]"
            style={{ color: 'var(--text-muted)' }}
          >
            View-only overview
          </span>
        </div>
        <PermissionMatrix />
      </div>
    </motion.div>
  )
}
