'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Download
} from 'lucide-react'
import Button from '@/components/common/Button'
import ResponseStatsCards from '@/components/responses/ResponseStatsCards'
import ResponseTable from '@/components/responses/ResponseTable'
import ResponseDetailDrawer from '@/components/responses/ResponseDetailDrawer'
import { AssignModal } from '@/components/responses/AssignModal'
import { DEFAULT_FILTERS, type ResponseFilters } from '@/components/responses/ResponseToolbar'
import type { ResponseRecord, NpsCategory, ResponseStatus, Sentiment } from '@/lib/types/response'

const PAGE_SIZE = 10

interface ApiResponse {
  id: string
  numericId: number
  respondentName: string
  respondentEmail: string
  respondentPhone: string
  surveyId: number
  surveyTitle: string
  surveyUrl: string | null
  surveySlug: string | null
  surveyCode: string | null
  touchpoint: string
  surveyBranch?: string
  createdById: number | null
  createdByName: string | null
  createdByEmployeeId: string | null
  createdByDepartment: string | null
  campaign: { id: number; name: string; channel: string } | null
  distributionChannel: string
  channel: string
  npsScore: number | null
  npsCategory: string
  csatScore: number | null
  cesScore: number | null
  feedback: string | null
  status: string
  deviceType: string | null
  browser: string | null
  operatingSystem: string | null
  ipAddress: string | null
  country: string | null
  city: string | null
  submittedAt: string
  submissionDate: string
  submissionTime: string
}

function mapApiResponse(r: ApiResponse): ResponseRecord {
  const score = r.npsScore ?? 0
  const cat: NpsCategory = (r.npsCategory as NpsCategory) ?? (score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor')
  const sent: Sentiment = score >= 9 ? 'positive' : score >= 7 ? 'neutral' : 'negative'
  return {
    id: r.id,
    customerName: r.respondentName || 'Anonymous',
    customerEmail: r.respondentEmail || '',
    customerPhone: r.respondentPhone || undefined,
    surveyId: String(r.surveyId),
    surveyTitle: r.surveyTitle,
    touchpoint: r.touchpoint,
    branch: r.surveyBranch ?? '—',
    department: r.createdByDepartment ?? '—',
    npsScore: r.npsScore ?? 0,
    npsCategory: cat,
    sentiment: sent,
    status: (r.status as ResponseStatus) ?? 'new',
    assignedTo: (r as any).assignedToName ?? null,
    submittedAt: r.submittedAt,
    answers: [],
    comments: r.feedback ?? '',
    timeline: [],
  }
}

export default function ResponsesPage() {
  const [filters, setFilters] = useState<ResponseFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeResponse, setActiveResponse] = useState<ResponseRecord | null>(null)

  const [responses, setResponses] = useState<ResponseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // ── Debounce the search input (300ms) so typing/pasting a long URL doesn't
  // fire an API request on every keystroke. Other filters (category, status,
  // date range, survey/touchpoint/branch/department selects) apply
  // immediately — only the free-text search is debounced. ──
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300)
    return () => clearTimeout(t)
  }, [filters.search])

  // ── Fetch responses from API with server-side pagination + filtering ───────
  const fetchResponses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      })
      // Use the debounced search value for the API call
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (filters.category !== 'all') params.set('npsCategory', filters.category)
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.scoreMin) params.set('scoreMin', filters.scoreMin)
      if (filters.scoreMax) params.set('scoreMax', filters.scoreMax)
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.set('dateTo', filters.dateTo)
      // Send survey filter as surveyId
      if (filters.survey !== 'All') params.set('surveyId', filters.survey)
      // Send touchpoint filter
      if (filters.touchpoint !== 'All') params.set('touchpoint', filters.touchpoint)
      // Send branch filter
      if (filters.branch !== 'All') params.set('branch', filters.branch)
      // Send department filter
      if (filters.department !== 'All') params.set('department', filters.department)
      // Send assignment filter
      if (filters.assignedFilter === 'new') {
        params.set('status', 'new')
      } else if (filters.assignedFilter !== 'all') {
        params.set('assignedToId', filters.assignedFilter)
      }

      const res = await fetch(`/api/responses?${params}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const mapped = (json.data || []).map(mapApiResponse)
      setResponses(mapped)
      setTotal(json.pagination?.total ?? 0)
      setTotalPages(json.pagination?.totalPages ?? 1)
    } catch {
      setResponses([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, filters.category, filters.status, filters.scoreMin,
      filters.scoreMax, filters.dateFrom, filters.dateTo, filters.survey,
      filters.touchpoint, filters.branch, filters.department, filters.assignedFilter])

  useEffect(() => { fetchResponses() }, [fetchResponses])

  // ── Stats (computed from the analytics overview API) ──
  const [stats, setStats] = useState({
    total: 0, promoters: 0, passives: 0, detractors: 0,
    nps: 0, avgScore: 0, responseRate: 0,
  })

  useEffect(() => {
    fetch('/api/analytics/overview?period=1y', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const d = json.data
        const b = d.npsBreakdown ?? {}
        const k = d.kpis ?? {}
        const total = b.promoters + b.passives + b.detractors
        setStats({
          total: k.totalResponses ?? total,
          promoters: b.promoters ?? 0,
          passives: b.passives ?? 0,
          detractors: b.detractors ?? 0,
          nps: k.npsScore ?? 0,
          avgScore: b.promoters + b.passives + b.detractors > 0
            ? Math.round(((b.promoters ?? 0) * 9.5 + (b.passives ?? 0) * 7.5 + (b.detractors ?? 0) * 3) / Math.max(total, 1) * 10) / 10
            : 0,
          responseRate: k.responseRate ?? 0,
        })
      })
      .catch(() => { /* ignore */ })
  }, [])

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.survey !== 'All' ||
    filters.touchpoint !== 'All' ||
    filters.branch !== 'All' ||
    filters.department !== 'All' ||
    filters.assignedFilter !== 'all' ||
    filters.scoreMin ||
    filters.scoreMax ||
    filters.dateFrom ||
    filters.dateTo
  )

  // ── Handlers ──

  function handleFiltersChange(next: ResponseFilters) {
    setFilters(next)
    setPage(1)
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const allSelected = responses.every((r) => prev.has(r.id))
      const next = new Set(prev)
      if (allSelected) {
        responses.forEach((r) => next.delete(r.id))
      } else {
        responses.forEach((r) => next.add(r.id))
      }
      return next
    })
  }

  function handleBulkExport() {
    const query = new URLSearchParams()
    query.set('format', 'csv')
    query.set('type', 'responses')
    
    // Add all active filters
    if (debouncedSearch) query.set('search', debouncedSearch)
    if (filters.survey && filters.survey !== 'All') query.set('survey', filters.survey)
    if (filters.touchpoint && filters.touchpoint !== 'All') query.set('touchpoint', filters.touchpoint)
    if (filters.branch && filters.branch !== 'All') query.set('branch', filters.branch)
    if (filters.department && filters.department !== 'All') query.set('department', filters.department)
    if (filters.scoreMin) query.set('scoreMin', filters.scoreMin)
    if (filters.scoreMax) query.set('scoreMax', filters.scoreMax)
    if (filters.status && filters.status !== 'all') query.set('status', filters.status)
    if (filters.dateFrom) query.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) query.set('dateTo', filters.dateTo)
    if (filters.category && filters.category !== 'all') query.set('category', filters.category)
    if (filters.assignedFilter && filters.assignedFilter !== 'all') query.set('assignedFilter', filters.assignedFilter)

    window.open(`/api/reports/export?${query.toString()}`, '_blank')
    setSelectedIds(new Set())
  }

  function handleBulkAssign() {
    setSelectedIds(new Set())
  }

  async function handleBulkDelete() {
    await Promise.all(Array.from(selectedIds).map(id => {
      const numericId = id.replace(/^RSP-/, '')
      return fetch(`/api/responses/${numericId}`, { method: 'DELETE' })
    }))
    setSelectedIds(new Set())
    fetchResponses()
  }

  const [assignResponse, setAssignResponse] = useState<ResponseRecord | null>(null)

  async function handleDelete(r: ResponseRecord) {
    const numericId = r.id.replace(/^RSP-/, '')
    await fetch(`/api/responses/${numericId}`, { method: 'DELETE' })
    fetchResponses()
  }

  function handleAssign(r: ResponseRecord) {
    setAssignResponse(r)
  }

  // ── Render ──

  return (
    <div className="flex flex-col gap-6 p-7 animate-fade-up">
      {/* Page header */}
      <div className="animate-fade-up flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-[-0.02em]" style={{ color: 'var(--text)' }}>
            Survey Responses
          </h1>
          <p className="mt-0.5 text-[12.5px]" style={{ color: 'var(--text-light)' }}>
            Review survey feedback, NPS scores, and response status across all surveys.
          </p>
        </div>
        <Button variant="secondary" onClick={handleBulkExport}>
          <Download size={13} />
          Export All
        </Button>
      </div>

      {/* Stats */}
      <ResponseStatsCards {...stats} />

      {/* Table */}
      <ResponseTable
        responses={responses}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onView={setActiveResponse}
        onAssign={handleAssign}
        onDelete={handleDelete}
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={PAGE_SIZE}
        onPageChange={(p) => setPage(Math.min(Math.max(1, p), totalPages))}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onBulkExport={handleBulkExport}
        onBulkAssign={handleBulkAssign}
        onBulkDelete={handleBulkDelete}
      />

      {/* Detail drawer */}
      <ResponseDetailDrawer
        response={activeResponse}
        onClose={() => setActiveResponse(null)}
      />

      {/* Assign Modal */}
      <AssignModal
        open={!!assignResponse}
        onClose={() => setAssignResponse(null)}
        responseId={assignResponse?.id ?? null}
        onAssigned={() => {
          setAssignResponse(null)
          fetchResponses()
        }}
      />
    </div>
  )
}
