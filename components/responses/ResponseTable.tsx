'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, MoreHorizontal, UserPlus, Trash2, Inbox, FilterX } from 'lucide-react'
import type { ResponseRecord } from '@/lib/types/response'
import NpsScoreBadge from './NpsScoreBadge'
import { ResponseStatusBadge } from './ResponseBadges'
import { ResponseToolbar, type ResponseFilters } from './ResponseToolbar'

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="shimmer h-3 rounded-[4px]" style={{ width: `${60 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <tr>
      <td colSpan={9}>
        <div className="animate-fade-in flex flex-col items-center gap-3 py-16">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
          >
            {hasFilters ? <FilterX size={20} style={{ color: 'var(--text-light)' }} /> : <Inbox size={20} style={{ color: 'var(--text-light)' }} />}
          </div>
          <div className="text-center">
            <div className="text-[13.5px] font-semibold" style={{ color: 'var(--text)' }}>
              {hasFilters ? 'No responses match your filters' : 'No responses yet'}
            </div>
            <div className="mt-1 text-[12.5px]" style={{ color: 'var(--text-light)' }}>
              {hasFilters ? 'Try adjusting your search or filter criteria.' : 'Responses will appear here once surveys are submitted.'}
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={onClear}
              className="flex items-center justify-center text-center rounded-[var(--radius-sm)] border px-6 py-3 text-[12.5px] font-medium transition-colors "
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (p: number) => void
}

function Pagination({ page, totalPages, pageSize, totalItems, onPageChange }: PaginationProps) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (page <= 4) return i + 1
    if (page >= totalPages - 3) return totalPages - 6 + i
    return page - 3 + i
  })

  return (
    <div className="flex items-center justify-between border-t px-6 py-4" style={{ borderColor: 'var(--border)' }}>
      <span className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>
        Showing {from}–{to} of {totalItems} results
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          style={{ color: 'var(--text-light)' }}
          onMouseEnter={(e) => { if (page > 1) { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="h-7 min-w-[28px] rounded-[8px] border text-[11.5px] font-medium transition-all"
            style={
              p === page
                ? { borderColor: 'var(--primary)', background: 'var(--tint-blue)', color: 'var(--primary)' }
                : { borderColor: 'var(--border)', color: 'var(--text-light)' }
            }
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          style={{ color: 'var(--text-light)' }}
          onMouseEnter={(e) => { if (page < totalPages) { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Sort header ─────────────────────────────────────────────────────────────

type SortKey = 'customerName' | 'surveyTitle' | 'npsScore' | 'submittedAt' | 'status'

interface SortHeaderProps {
  label: string
  sortKey: SortKey
  currentSort: SortKey
  dir: 'asc' | 'desc'
  onSort: (k: SortKey) => void
}

function SortHeader({ label, sortKey, currentSort, dir, onSort }: SortHeaderProps) {
  const active = currentSort === sortKey
  return (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors"
      style={{ color: active ? 'var(--text)' : 'var(--text-light)' }}
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={`transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}>
          {dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </span>
      </span>
    </th>
  )
}

// ─── Row action menu ──────────────────────────────────────────────────────────

interface RowMenuProps {
  response: ResponseRecord
  onView: (r: ResponseRecord) => void
  onAssign: (r: ResponseRecord) => void
  onDelete: (r: ResponseRecord) => void
}

function RowMenu({ response, onView, onAssign, onDelete }: RowMenuProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="icon-btn !h-7 !w-7"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="animate-fade-up absolute right-0 top-8 z-50 min-w-[150px] overflow-hidden rounded-[var(--radius-md)] border bg-white py-1"
            style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow-lg)' }}
          >
            <button
              onClick={() => { onView(response); setOpen(false) }}
              className="flex w-full items-center gap-2.5 px-3 py-[7px] text-left text-[12.5px] transition-colors"
              style={{ color: 'var(--text)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Eye size={13} /> View Details
            </button>
            <button
              onClick={() => { onAssign(response); setOpen(false) }}
              className="flex w-full items-center gap-2.5 px-3 py-[7px] text-left text-[12.5px] transition-colors"
              style={{ color: 'var(--text)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <UserPlus size={13} /> Assign
            </button>
            <div className="my-1 h-px" style={{ background: 'var(--border)' }} />
            <button
              onClick={() => { onDelete(response); setOpen(false) }}
              className="flex w-full items-center gap-2.5 px-3 py-[7px] text-left text-[12.5px] transition-colors"
              style={{ color: 'var(--red)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--tint-red)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main Table ───────────────────────────────────────────────────────────────

interface Props {
  responses: ResponseRecord[]
  loading: boolean
  hasActiveFilters: boolean
  onClearFilters: () => void
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onView: (r: ResponseRecord) => void
  onAssign: (r: ResponseRecord) => void
  onDelete: (r: ResponseRecord) => void
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (p: number) => void
  filters: ResponseFilters
  onFiltersChange: (f: ResponseFilters) => void
  onBulkExport: () => void
  onBulkAssign: () => void
  onBulkDelete: () => void
}

export default function ResponseTable({
  responses, loading, hasActiveFilters, onClearFilters,
  selectedIds, onToggleSelect, onToggleSelectAll,
  onView, onAssign, onDelete,
  page, totalPages, totalItems, pageSize, onPageChange,
  filters, onFiltersChange,
  onBulkExport, onBulkAssign, onBulkDelete,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(k); setSortDir('desc') }
  }

  const allOnPageSelected = responses.length > 0 && responses.every((r) => selectedIds.has(r.id))
  const someSelected = responses.some((r) => selectedIds.has(r.id)) && !allOnPageSelected

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-AE', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  return (
    <div className="card flex flex-col">
      {/* Toolbar */}
      <ResponseToolbar
        filters={filters}
        onChange={onFiltersChange}
        onClear={onClearFilters}
        hasActiveFilters={hasActiveFilters}
        selectedIds={selectedIds}
        onBulkExport={onBulkExport}
        onBulkAssign={onBulkAssign}
        onBulkDelete={onBulkDelete}
        totalItems={totalItems}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)', background: '#FAFCFE' }}>
              <th className="sticky top-0 w-10 px-5 py-3.5" style={{ background: '#FAFCFE' }}>
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected }}
                  onChange={onToggleSelectAll}
                  className="h-3.5 w-3.5 cursor-pointer"
                  style={{ accentColor: 'var(--primary)' }}
                />
              </th>
              <SortHeader label="Respondent" sortKey="customerName" currentSort={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHeader label="Survey" sortKey="surveyTitle" currentSort={sortKey} dir={sortDir} onSort={handleSort} />
              <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--text-light)' }}>Touchpoint / Branch</th>
              <SortHeader label="NPS" sortKey="npsScore" currentSort={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHeader label="Status" sortKey="status" currentSort={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHeader label="Submitted" sortKey="submittedAt" currentSort={sortKey} dir={sortDir} onSort={handleSort} />
              <th className="w-12 px-5 py-3.5" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : responses.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} onClear={onClearFilters} />
            ) : (
              responses.map((r) => {
                const selected = selectedIds.has(r.id)
                return (
                  <tr
                    key={r.id}
                    className="group cursor-pointer border-b transition-colors duration-100 last:border-b-0"
                    style={{ borderColor: 'var(--border)', background: selected ? 'var(--tint-blue)' : 'transparent' }}
                    onClick={() => onView(r)}
                    onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = '#FAFCFE' }}
                    onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Checkbox */}
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(r.id)}
                        className="h-3.5 w-3.5 cursor-pointer"
                        style={{ accentColor: 'var(--primary)' }}
                      />
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                          style={{ background: 'var(--bg-subtle)', color: 'var(--text-light)' }}
                        >
                          {r.customerName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="whitespace-normal break-words text-[13px] font-medium" style={{ color: 'var(--text)' }}>{r.customerName}</div>
                          <div className="whitespace-normal break-words text-[11.5px]" style={{ color: 'var(--text-light)' }}>{r.customerEmail}</div>
                        </div>
                      </div>
                    </td>

                    {/* Survey */}
                    <td className="px-5 py-3.5">
                      <div className="whitespace-normal break-words text-[12.5px]" style={{ color: 'var(--text)' }}>{r.surveyTitle}</div>
                    </td>

                    {/* Touchpoint / Branch */}
                    <td className="px-5 py-3.5">
                      <div className="text-[12.5px]" style={{ color: 'var(--text)' }}>{r.touchpoint}</div>
                      <div className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>{r.branch}</div>
                    </td>

                    {/* NPS */}
                    <td className="px-5 py-3.5">
                      <NpsScoreBadge score={r.npsScore} category={r.npsCategory} />
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col items-center gap-0.5">
                        <ResponseStatusBadge status={r.status} />
                        {(r.status === 'actioned' || r.status === 'solved') && r.assignedTo && (
                          <span className="text-[10.5px] font-medium text-center" style={{ color: 'var(--text-light)' }}>
                            {r.assignedTo}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-5 py-3.5 text-[12.5px]" style={{ color: 'var(--text-light)' }}>
                      {formatDate(r.submittedAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <RowMenu
                          response={r}
                          onView={onView}
                          onAssign={onAssign}
                          onDelete={onDelete}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
