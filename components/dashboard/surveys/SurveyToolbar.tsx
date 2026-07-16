'use client'

import { useState } from 'react'
import { ArrowUpDown, Archive, Trash2, ChevronDown } from 'lucide-react'
import Button from '@/components/common/Button'
import SearchInput from './SearchInput'
import type { SurveyStatus } from '@/lib/types/survey'
import { useBranches } from '@/lib/hooks/useBranches'
import { useTouchpointNames } from '@/lib/hooks/useTouchpoints'
import { useDepartmentNames } from '@/lib/hooks/useDepartments'

export type SortKey = 'updatedAt' | 'createdAt' | 'responseCount' | 'npsScore' | 'title'

export interface SurveyFilters {
  search: string
  status: SurveyStatus | 'all'
  touchpoint: string | 'all'
  branch: string | 'all'
  department: string | 'all'
  sort: SortKey
}

interface SurveyToolbarProps {
  filters: SurveyFilters
  onFiltersChange: (filters: SurveyFilters) => void
  selectedCount: number
  onBulkArchive: () => void
  onBulkDelete: () => void
}

const STATUS_OPTIONS: { value: SurveyStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'createdAt', label: 'Date Created' },
  { value: 'responseCount', label: 'Responses' },
  { value: 'npsScore', label: 'NPS Score' },
  { value: 'title', label: 'Title (A–Z)' },
]

function FilterSelect<T extends string>({
  value, onChange, options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-[34px] cursor-pointer appearance-none rounded-[var(--radius-sm)] border bg-white pl-3 pr-7 text-[12.5px] outline-none transition-colors"
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: '#fff', color: 'var(--text)' }}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-light)' }} />
    </div>
  )
}

export default function SurveyToolbar({
  filters, onFiltersChange, selectedCount, onBulkArchive, onBulkDelete,
}: SurveyToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false)
  const BRANCHES = useBranches()
  // Live touchpoints from the database — no hardcoded array.
  const TOUCHPOINTS = useTouchpointNames()
  const DEPARTMENTS = useDepartmentNames()

  function set<K extends keyof SurveyFilters>(key: K, value: SurveyFilters[K]) {
    onFiltersChange({ ...filters, [key]: value })
  }

  if (selectedCount > 0) {
    return (
      <div
        className="animate-fade-in flex items-center justify-between border-b px-5 py-3"
        style={{ borderColor: 'var(--border)', background: 'var(--tint-blue)' }}
      >
        <span className="text-[12.5px] font-semibold" style={{ color: 'var(--text)' }}>
          {selectedCount} survey{selectedCount > 1 ? 's' : ''} selected
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBulkArchive}>
            <Archive size={12} />
            Archive
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ borderColor: 'rgba(229,72,77,0.3)', color: 'var(--red)' }}
            onClick={onBulkDelete}
          >
            <Trash2 size={12} />
            Delete
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 border-b px-5 py-3" style={{ borderColor: 'var(--border)' }}>
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={filters.search}
          onChange={(v) => set('search', v)}
          placeholder="Search surveys…"
          className="w-[220px]"
        />
        <FilterSelect value={filters.status} onChange={(v) => set('status', v)} options={STATUS_OPTIONS} />
        <FilterSelect
          value={filters.touchpoint}
          onChange={(v) => set('touchpoint', v)}
          options={[{ value: 'all', label: 'All Touchpoints' }, ...TOUCHPOINTS.map((t) => ({ value: t, label: t }))]}
        />
        <FilterSelect
          value={filters.department}
          onChange={(v) => set('department', v)}
          options={[{ value: 'all', label: 'All Departments' }, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]}
        />
        <FilterSelect
          value={filters.branch}
          onChange={(v) => set('branch', v)}
          options={BRANCHES.map((b) => ({ value: b === 'All Branches' ? 'all' : b, label: b }))}
        />
      </div>

      <div className="relative">
        <Button variant="ghost" size="sm" onClick={() => setSortOpen((o) => !o)}>
          <ArrowUpDown size={12} />
          Sort: {SORT_OPTIONS.find((o) => o.value === filters.sort)?.label}
        </Button>
        {sortOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
            <div
              className="animate-fade-up absolute right-0 z-50 mt-1.5 w-44 overflow-hidden rounded-[var(--radius-md)] border bg-white py-1"
              style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow-lg)' }}
            >
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    set('sort', o.value)
                    setSortOpen(false)
                  }}
                  className="flex w-full items-center justify-between px-3 py-[7px] text-left text-[12.5px] transition-colors"
                  style={{ color: o.value === filters.sort ? 'var(--primary)' : 'var(--text)', fontWeight: o.value === filters.sort ? 600 : 400 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
