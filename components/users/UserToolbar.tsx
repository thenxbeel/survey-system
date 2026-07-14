'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Download, Shield, ChevronDown } from 'lucide-react'
import {
  USER_ROLES, USER_DEPARTMENTS, USER_STATUSES,
  type UserFilters,
} from '@/lib/types/user'
import { useBranches } from '@/lib/hooks/useBranches'
import { useDepartmentNames } from '@/lib/hooks/useDepartments'

interface Props {
  filters: UserFilters
  onChange: (f: UserFilters) => void
  onClear: () => void
  hasActiveFilters: boolean
  selectedIds: Set<string>
  totalItems: number
  onBulkExport?: () => void
  onBulkActivate?: () => void
  availableRoles?: string[]
}

const inputCls =
  'w-full rounded-[9px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(11,74,139,0.1)] transition-all'

function NativeSelect({
  value, onChange, options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-[32px] w-full appearance-none rounded-[9px] border border-[var(--border)] bg-white pl-3 pr-7 text-[12px] font-medium text-[var(--text)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-[var(--primary)] cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--text-light)' }}
      />
    </div>
  )
}

export function UserToolbar({ filters, onChange, onClear, hasActiveFilters, selectedIds, totalItems, onBulkExport, onBulkActivate, availableRoles }: Props) {
  const liveBranches = useBranches()
  const liveDepartments = useDepartmentNames()
  const selCount = selectedIds.size

  function patch<K extends keyof UserFilters>(key: K, value: UserFilters[K]) { onChange({ ...filters, [key]: value }) }

  const roleOptions = availableRoles
    ? [{ value: 'all', label: 'All Roles' }, ...availableRoles.map(r => ({ value: r, label: r }))]
    : USER_ROLES.map(r => ({ value: r.value, label: r.value === 'all' ? 'All Roles' : r.label }))

  return (
    <div className="flex flex-col gap-0" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex flex-wrap items-center gap-2 px-5 py-4">
        {/* Search */}
        <div 
          className="group flex max-w-[320px] flex-1 items-center gap-2.5 rounded-full px-3.5 py-2 transition-all duration-200 hover:shadow-md focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[rgba(11,74,139,0.1)]"
          style={{ background: '#FFFFFF', border: '1px solid var(--border)' }}
        >
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            className="flex-1 bg-transparent text-[12px] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none"
            placeholder="Search name, email, employee ID…"
            value={filters.search}
            onChange={e => patch('search', e.target.value)}
          />
        </div>

        {/* Role */}
        <div className="w-[160px]">
          <NativeSelect
            value={filters.role}
            onChange={v => patch('role', v)}
            options={roleOptions}
          />
        </div>

        {/* Status */}
        <div className="w-[150px]">
          <NativeSelect
            value={filters.status}
            onChange={v => patch('status', v)}
            options={USER_STATUSES.map(s => ({ value: s.value, label: s.value === 'all' ? 'All Statuses' : s.label }))}
          />
        </div>

        {/* Department */}
        <div className="w-[180px]">
          <NativeSelect
            value={filters.department}
            onChange={v => patch('department', v)}
            options={['All', ...liveDepartments].map(d => ({ value: d, label: d === 'All' ? 'All Departments' : d }))}
          />
        </div>

        {/* Branch */}
        <div className="w-[150px]">
          <NativeSelect
            value={filters.branch}
            onChange={v => patch('branch', v)}
            options={liveBranches.map(b => ({ value: b === 'All Branches' ? 'All' : b, label: b }))}
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] font-semibold transition-colors items-center justify-center text-center"
            style={{ color: 'var(--text-light)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-light)' }}
          >
            <X size={11} /> Clear
          </button>
        )}

        <div className="flex-1" />

        {/* Bulk actions */}
        {selCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-[9px] border px-3 h-[32px]"
            style={{
              background: 'var(--tint-blue)',
              borderColor: 'rgba(11,74,139,0.25)',
            }}
          >
            <span className="text-[11px] font-semibold" style={{ color: 'var(--primary)' }}>
              {selCount} selected
            </span>
            <div className="h-3 w-px" style={{ background: 'rgba(11,74,139,0.25)' }} />
            <button
              onClick={onBulkExport}
              className="flex items-center gap-1 text-[11px] font-semibold transition-opacity items-center justify-center text-center"
              style={{ color: 'var(--primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              <Download size={11} /> Export
            </button>
            <button
              onClick={onBulkActivate}
              className="flex items-center gap-1 text-[11px] font-semibold transition-opacity items-center justify-center text-center"
              style={{ color: 'var(--emerald)' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              <Shield size={11} /> Activate
            </button>
          </motion.div>
        )}

        <span className="text-[11px] font-medium tabular" style={{ color: 'var(--text-light)' }}>
          {totalItems} results
        </span>
      </div>
    </div>
  )
}
