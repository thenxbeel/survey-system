'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Check, RotateCcw } from 'lucide-react'
import { useAnalytics } from '../state/useAnalytics'
import type { AnalyticsFilters as AnalyticsFiltersType } from '@/types/analytics'
import { useBranchOptions } from '@/lib/hooks/useBranches'
import { useDepartmentOptions } from '@/lib/hooks/useDepartments'
import { useTouchpointOptions } from '@/lib/hooks/useTouchpoints'

// Static filter options — these are UI dropdown choices that are NOT business
// data (time periods, NPS categories). Branches / Departments / Touchpoints
// are loaded LIVE from the database via hooks below.
const STATIC_OPTIONS = {
  periods: [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last 12 months' },
  ],
  products: [
    { value: 'all', label: 'All Products' },
  ],
  npsCategories: [
    { value: 'all', label: 'All Categories' },
    { value: 'promoter', label: 'Promoters (9-10)' },
    { value: 'passive', label: 'Passives (7-8)' },
    { value: 'detractor', label: 'Detractors (0-6)' },
  ],
}

interface FilterDef {
  key: keyof AnalyticsFiltersType
  label: string
  options: { value: string; label: string }[]
}

function FilterDropdown({ def }: { def: FilterDef }) {
  const { state, dispatch } = useAnalytics()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const selected = state.filters[def.key]
  const selectedLabel = def.options.find(o => o.value === selected)?.label ?? def.label
  const isActive = selected !== 'all' && selected !== '30d'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex h-[30px] items-center gap-2.5 rounded-[9px] border px-3 text-[12px] font-semibold transition-all
          ${isActive
            ? 'border-[rgba(11,74,139,0.3)] bg-[var(--tint-blue)] text-[var(--primary)]'
            : 'border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
          }`}
      >
        <span className="text-[9.5px] uppercase tracking-[0.08em] opacity-65">{def.label}</span>
        <span style={{ color: isActive ? 'var(--primary)' : 'var(--text)' }}>{selectedLabel}</span>
        <ChevronDown size={12} className={`opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[200px] overflow-hidden rounded-[10px] border border-[var(--border)] bg-white py-1"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          {def.options.map(opt => {
            const active = opt.value === selected
            return (
              <button
                key={opt.value}
                onClick={() => {
                  dispatch({ type: 'SET_FILTER', key: def.key, value: opt.value })
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between px-6 py-3 text-[12px] transition-colors"
                style={{
                  background: active ? 'var(--bg-subtle)' : 'transparent',
                  color: active ? 'var(--text)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = 'var(--bg-subtle)'
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span>{opt.label}</span>
                {active && <Check size={12} style={{ color: 'var(--primary)' }} />}
              </button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

export function AnalyticsFilters() {
  const { state, dispatch } = useAnalytics()

  // Live branch / department / touchpoint options from the database.
  // These update automatically when records are created/edited/deleted.
  const branchOpts = useBranchOptions()
  const deptOpts = useDepartmentOptions()
  const tpOpts = useTouchpointOptions()

  const filterDefs: FilterDef[] = useMemo(() => [
    { key: 'branch',      label: 'Branch',      options: branchOpts },
    { key: 'period',      label: 'Period',      options: STATIC_OPTIONS.periods },
    { key: 'product',     label: 'Product',     options: STATIC_OPTIONS.products },
    { key: 'department',  label: 'Department',  options: deptOpts },
    { key: 'touchpoint',  label: 'Touchpoint',  options: tpOpts },
    { key: 'npsCategory', label: 'NPS Category',options: STATIC_OPTIONS.npsCategories },
  ], [branchOpts, deptOpts, tpOpts])

  const hasActiveFilters = Object.entries(state.filters).some(([k, v]) => {
    if (k === 'period') return v !== '30d'
    return v !== 'all'
  })

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterDefs.map(def => (
        <FilterDropdown key={def.key} def={def} />
      ))}

      {hasActiveFilters && (
        <button
          onClick={() => dispatch({ type: 'RESET_FILTERS' })}
          className="inline-flex h-[30px] items-center gap-2.5 rounded-[9px] px-2.5 text-[12px] font-semibold transition-all"
          style={{ color: 'var(--text-light)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-light)' }}
        >
          <RotateCcw size={12} />
          Reset
        </button>
      )}
    </div>
  )
}
