'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  SlidersHorizontal,
  X,
  Download,
  Trash2,
  UserPlus,
  ChevronDown,
} from 'lucide-react'

export interface ResponseFilters {
  search: string
  survey: string
  touchpoint: string
  branch: string
  department: string
  scoreMin: string
  scoreMax: string
  status: string
  dateFrom: string
  dateTo: string
  category: string
  assignedFilter: string
}

export const DEFAULT_FILTERS: ResponseFilters = {
  search: '',
  survey: 'All',
  touchpoint: 'All',
  branch: 'All',
  department: 'All',
  scoreMin: '',
  scoreMax: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  category: 'all',
  assignedFilter: 'all',
}

interface Props {
  filters: ResponseFilters
  onChange: (f: ResponseFilters) => void
  onClear: () => void
  hasActiveFilters: boolean
  selectedIds: Set<string>
  totalItems: number
  onBulkExport: () => void
  onBulkAssign: () => void
  onBulkDelete: () => void
}

// Live filter option types
interface SurveyOption { id: number; title: string; surveyCode: string | null }
interface BranchOption { id: number; name: string }
interface DeptOption { id: number; name: string }

export function ResponseToolbar({
  filters, onChange, onClear, hasActiveFilters, selectedIds, totalItems,
  onBulkExport, onBulkAssign, onBulkDelete,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const selCount = selectedIds.size

  // ── Fetch live filter options from the database ──
  const [surveys, setSurveys] = useState<SurveyOption[]>([])
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [departments, setDepartments] = useState<DeptOption[]>([])
  const [touchpoints, setTouchpoints] = useState<string[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/surveys?pageSize=200', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      fetch('/api/branches', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      fetch('/api/departments', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
    ]).then(([s, b, d]) => {
      if (s?.data) setSurveys(s.data.map((sv: any) => ({ id: sv.numericId, title: sv.title, surveyCode: sv.surveyCode })))
      if (b?.data) setBranches(b.data)
      if (d?.data) setDepartments(d.data)
    }).catch(() => { /* ignore */ })
  }, [])

  // Fetch touchpoints from surveys (unique touchpoint values)
  useEffect(() => {
    fetch('/api/surveys?pageSize=200', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const tps = Array.from(new Set(json.data.map((s: any) => s.touchpoint).filter(Boolean))) as string[]
        setTouchpoints(tps)
      })
      .catch(() => { /* ignore */ })
  }, [])

  function patch<K extends keyof ResponseFilters>(key: K, value: ResponseFilters[K]) { onChange({ ...filters, [key]: value }) }

  const selectCls = 'h-[34px] flex-1 appearance-none rounded-[9px] border border-[var(--border)] bg-white pl-3 pr-9 text-[12px] font-medium text-[var(--text)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(11,74,139,0.1)] cursor-pointer'
  const inputStyle = { borderColor: 'var(--border)' as const }

  return (
    <div className="flex flex-col gap-3 p-4" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Row 1: search + category + status + advanced toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <div 
          className="group flex min-w-[180px] flex-1 items-center gap-2.5 rounded-full border border-[var(--border)] bg-white px-3.5 py-2 transition-all duration-200 hover:shadow-md focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[rgba(11,74,139,0.1)]"
        >
          <Search size={13} className="flex-shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by name, email, survey URL, slug, code, title, or touchpoint…"
            value={filters.search}
            onChange={(e) => patch('search', e.target.value)}
            className="flex-1 bg-transparent text-[12px] font-medium text-[var(--text)] outline-none"
          />
        </div>

        <select
          className={selectCls + ' w-auto'}
          style={inputStyle}
          value={filters.category}
          onChange={(e) => patch('category', e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="promoter">Promoters (9-10)</option>
          <option value="passive">Passives (7-8)</option>
          <option value="detractor">Detractors (0-6)</option>
        </select>

        <select
          className={selectCls + ' w-auto'}
          style={inputStyle}
          value={filters.assignedFilter}
          onChange={(e) => patch('assignedFilter', e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
          <option value="new">New Responses</option>
        </select>

        {selCount > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-light)' }}>{selCount} selected</span>
            <button onClick={onBulkExport} className="flex items-center justify-center text-center gap-2.5 rounded-[9px] border border-[var(--border)] px-6 py-3 text-[11.5px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]">
              <Download size={13} /> Export
            </button>
            <button onClick={onBulkAssign} className="flex items-center justify-center text-center gap-2.5 rounded-[9px] border border-[var(--border)] px-6 py-3 text-[11.5px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]">
              <UserPlus size={13} /> Assign
            </button>
            <button onClick={onBulkDelete} className="flex items-center justify-center text-center gap-2.5 rounded-[9px] border border-[rgba(229,72,77,0.3)] px-6 py-3 text-[11.5px] font-semibold text-[var(--red)] hover:bg-[var(--tint-red)]">
              <Trash2 size={13} /> Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center justify-center text-center gap-2.5 rounded-[10px] border border-[var(--border)] px-5 py-2 text-[12px] font-semibold text-[var(--text-secondary)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]"
          >
            <SlidersHorizontal size={13} />
            Filters
            <ChevronDown size={11} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3 lg:grid-cols-4">
          {/* Survey filter — fetches from /api/surveys */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--text-light)' }}>Survey</label>
            <select
              className={selectCls + ' w-full'}
              style={inputStyle}
              value={filters.survey}
              onChange={(e) => patch('survey', e.target.value)}
            >
              <option value="All">All Surveys</option>
              {surveys.map(s => (
                <option key={s.id} value={String(s.id)}>
                  {s.title}{s.surveyCode ? ` (${s.surveyCode})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Touchpoint filter — fetches from surveys */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--text-light)' }}>Touchpoint</label>
            <select
              className={selectCls + ' w-full'}
              style={inputStyle}
              value={filters.touchpoint}
              onChange={(e) => patch('touchpoint', e.target.value)}
            >
              <option value="All">All Touchpoints</option>
              {touchpoints.map(tp => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          </div>

          {/* Branch filter — fetches from /api/branches */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--text-light)' }}>Branch</label>
            <select
              className={selectCls + ' w-full'}
              style={inputStyle}
              value={filters.branch}
              onChange={(e) => patch('branch', e.target.value)}
            >
              <option value="All">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Department filter — fetches from /api/departments */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--text-light)' }}>Department</label>
            <select
              className={selectCls + ' w-full'}
              style={inputStyle}
              value={filters.department}
              onChange={(e) => patch('department', e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Score Min */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--text-light)' }}>Min Score</label>
            <input
              type="number"
              min={0}
              max={10}
              value={filters.scoreMin}
              onChange={(e) => patch('scoreMin', e.target.value)}
              placeholder="0"
              className={selectCls + ' w-full'}
              style={inputStyle}
            />
          </div>

          {/* Score Max */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--text-light)' }}>Max Score</label>
            <input
              type="number"
              min={0}
              max={10}
              value={filters.scoreMax}
              onChange={(e) => patch('scoreMax', e.target.value)}
              placeholder="10"
              className={selectCls + ' w-full'}
              style={inputStyle}
            />
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--text-light)' }}>Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => patch('dateFrom', e.target.value)}
              className={selectCls + ' w-full'}
              style={inputStyle}
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--text-light)' }}>Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => patch('dateTo', e.target.value)}
              className={selectCls + ' w-full'}
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {/* Active filters bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            {totalItems} result{totalItems !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] hover:underline items-center justify-center text-center"
          >
            <X size={11} />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
