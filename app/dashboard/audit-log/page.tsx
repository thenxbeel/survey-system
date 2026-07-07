'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Search, Loader2, History, ChevronLeft, ChevronRight,
  User, Calendar, Activity, Filter, Hash, Clock,
  Link2, CheckCircle2, Settings2, Share2,
} from 'lucide-react'

interface AuditLogEntry {
  id: number
  surveyId: number
  surveyTitle: string | null
  surveySlug: string | null
  action: string
  actionLabel: string
  details: string | null
  metadata: unknown
  ipAddress: string | null
  userAgent: string | null
  actor: { id: number; name: string; email: string } | null
  createdAt: string
}

interface ActionOption { value: string; label: string }

const PAGE_SIZES = [10, 20, 50] as const
const DEFAULT_PAGE_SIZE = 10

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const ACTION_COLORS: Record<string, string> = {
  SURVEY_CREATED: 'text-[#0B4A8B] bg-[#EFF6FF]',
  SURVEY_PUBLISHED: 'text-[#17A673] bg-[#ECFDF5]',
  SURVEY_SCHEDULED: 'text-[#D97706] bg-[#FFFBEB]',
  URL_GENERATED: 'text-[#0B4A8B] bg-[#EFF6FF]',
  QR_GENERATED: 'text-[#0B4A8B] bg-[#EFF6FF]',
  QR_REGENERATED: 'text-[#0B4A8B] bg-[#EFF6FF]',
  URL_SHARED: 'text-[#7C3AED] bg-[#F5F3FF]',
  SURVEY_URL_COPIED: 'text-[#0B4A8B] bg-[#EFF6FF]',
  SURVEY_EDITED: 'text-[#4A5568] bg-[#EBF0F7]',
  SURVEY_ACTIVATED: 'text-[#17A673] bg-[#ECFDF5]',
  SURVEY_DEACTIVATED: 'text-[#E5484D] bg-[#FEF2F2]',
  SURVEY_REACTIVATED: 'text-[#17A673] bg-[#ECFDF5]',
  SURVEY_EXPIRED: 'text-[#E5484D] bg-[#FEF2F2]',
  SURVEY_CLOSED: 'text-[#7C3AED] bg-[#F5F3FF]',
  SURVEY_ARCHIVED: 'text-[#64748B] bg-[#F1F5F9]',
  EXPIRATION_EXTENDED: 'text-[#D97706] bg-[#FFFBEB]',
  RESPONSE_RECEIVED: 'text-[#17A673] bg-[#ECFDF5]',
  LAST_RESPONSE: 'text-[#4A5568] bg-[#EBF0F7]',
  LAST_MODIFIED: 'text-[#4A5568] bg-[#EBF0F7]',
}

const ACTION_ICONS: Record<string, any> = {
  SURVEY_URL_COPIED: Link2,
  URL_GENERATED: Link2,
  URL_SHARED: Share2,
  QR_GENERATED: Hash,
  QR_REGENERATED: Hash,
  RESPONSE_RECEIVED: CheckCircle2,
  LAST_RESPONSE: Clock,
  SURVEY_CREATED: Activity,
  SURVEY_PUBLISHED: CheckCircle2,
  SURVEY_EDITED: Activity,
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [actions, setActions] = useState<ActionOption[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [action, setAction] = useState('all')
  const [surveyId, setSurveyId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // ── Debounce the search input (300ms) so typing/pasting a long URL doesn't
  // fire an API request on every keystroke. Other filters (action, surveyId,
  // date range) apply immediately — only the free-text search is debounced. ──
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (action !== 'all') params.set('action', action)
      if (surveyId) params.set('surveyId', surveyId)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`/api/audit-log?${params}`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setLogs(json.data || [])
        setTotal(json.pagination?.total ?? 0)
        if (json.actions) setActions(json.actions)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedSearch, action, surveyId, dateFrom, dateTo])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // Build visible page numbers (max 7 buttons with ellipsis)
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex flex-col gap-6 p-7">
      {/* Header */}
      <div>
        <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#0D1B2E]">Audit Log</h1>
        <p className="mt-0.5 text-[12.5px] text-[#4A5568]">
          Complete history of survey lifecycle events. Visible to employees and administrators only.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-[14px] border border-[#E2E8F3] bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div 
            className="group flex flex-1 min-w-[200px] items-center gap-2.5 rounded-full border border-[#E2E8F3] bg-white px-3.5 py-2 transition-all duration-200 hover:shadow-md focus-within:border-[#0B4A8B]"
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0 text-[#B0BDCC]" />
            <input
              type="text"
              placeholder="Search by survey URL, slug, code, title, action, or details…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 bg-transparent text-[12px] text-[#0D1B2E] outline-none"
            />
          </div>

          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1) }}
            className="rounded-[8px] border border-[#E2E8F3] bg-white px-3 py-2 text-[12px] text-[#4A5568] outline-none focus:border-[#0B4A8B]">
            <option value="all">All Actions</option>
            {actions.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>

          <input type="number" placeholder="Survey ID" value={surveyId}
            onChange={(e) => { setSurveyId(e.target.value); setPage(1) }}
            className="w-[120px] rounded-[8px] border border-[#E2E8F3] px-3 py-2 text-[12px] text-[#0D1B2E] outline-none focus:border-[#0B4A8B]" />

          <input type="date" value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="rounded-[8px] border border-[#E2E8F3] px-3 py-2 text-[12px] text-[#4A5568] outline-none focus:border-[#0B4A8B]" />
          <span className="text-[11px] text-[#8FA0B5]">to</span>
          <input type="date" value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="rounded-[8px] border border-[#E2E8F3] px-3 py-2 text-[12px] text-[#4A5568] outline-none focus:border-[#0B4A8B]" />
        </div>
      </div>

      {/* Log table */}
      <div className="rounded-[16px] border border-[#E2E8F3] bg-white shadow-sm">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#0B4A8B]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="mb-3 h-10 w-10 text-[#B0BDCC]" />
            <h3 className="mb-1 text-[14px] font-semibold text-[#0D1B2E]">No audit entries</h3>
            <p className="text-[12px] text-[#8FA0B5]">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F3] text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#8FA0B5]">
                  <th className="px-4 py-2.5">Action</th>
                  <th className="px-3 py-2.5">Survey</th>
                  <th className="px-3 py-2.5">Actor</th>
                  <th className="px-3 py-2.5">Details</th>
                  <th className="px-3 py-2.5">IP</th>
                  <th className="px-3 py-2.5"><span className="flex items-center gap-1">Timestamp <Settings2 className="h-3 w-3 opacity-50" /></span></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-[#E2E8F3] text-[12px] hover:bg-[#F8FAFD]">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${ACTION_COLORS[log.action] ?? 'text-[#4A5568] bg-[#EBF0F7]'}`}>
                        {(() => { const AI = ACTION_ICONS[log.action]; return AI ? <AI className="h-3 w-3" /> : null })()}
                        {log.actionLabel}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {log.surveyTitle ? (
                        <Link href={`/dashboard/surveys/${log.surveyId}/published`}
                          className="font-medium text-[#0B4A8B] hover:underline">
                          {log.surveyTitle}
                        </Link>
                      ) : (
                        <span className="text-[#B0BDCC]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {log.actor ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-[#0D1B2E]">{log.actor.name}</span>
                          <span className="text-[10.5px] text-[#8FA0B5]">{log.actor.email}</span>
                        </div>
                      ) : (
                        <span className="text-[#B0BDCC]">System</span>
                      )}
                    </td>
                    <td className="px-3 py-3 max-w-[280px]">
                      <span className="block truncate text-[#4A5568]" title={log.details ?? ''}>
                        {log.details ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-[#8FA0B5]">
                      {log.ipAddress ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-[#4A5568]">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F3] px-5 py-3">
            <p className="text-[11.5px] text-[#8FA0B5]">
              Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              {/* Per-page selector */}
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                className="rounded-[6px] border border-[#E2E8F3] bg-white px-4 py-2.5 text-[11px] text-[#4A5568] outline-none focus:border-[#0B4A8B]"
              >
                {PAGE_SIZES.map(s => (
                  <option key={s} value={s}>{s}/page</option>
                ))}
              </select>

              {/* Prev button */}
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-[6px] border border-[#E2E8F3] p-2.5 text-[#4A5568] disabled:opacity-40 hover:bg-[#F8FAFD]">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {/* Page number buttons */}
              {getPageNumbers().map((n, i) =>
                n === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-[11px] text-[#8FA0B5]">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`min-w-[28px] rounded-[6px] border px-6 py-3 text-[11.5px] font-medium transition-colors ${
                      n === page
                        ? 'border-[#0B4A8B] bg-[#0B4A8B] text-white'
                        : 'border-[#E2E8F3] text-[#4A5568] hover:bg-[#F8FAFD]'
                    }`}
                  >
                    {n}
                  </button>
                )
              )}

              {/* Next button */}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-[6px] border border-[#E2E8F3] p-2.5 text-[#4A5568] disabled:opacity-40 hover:bg-[#F8FAFD]">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
