'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Upload } from 'lucide-react'
import Button from '@/components/common/Button'
import MetricCard from '@/components/dashboard/MetricCard'
import { type SurveyFilters } from '@/components/dashboard/surveys/SurveyToolbar'
import SurveyTable from '@/components/dashboard/surveys/SurveyTable'
import SurveyDetailDrawer from '@/components/dashboard/surveys/SurveyDetailDrawer'
import { ImportSurveyModal } from '@/components/dashboard/surveys/ImportSurveyModal'
import { useSurveys } from '@/lib/stores/SurveysStore'
import { useToast } from '@/lib/stores/ToastStore'
import type { SurveyRecord } from '@/lib/types/survey'

const PAGE_SIZE = 8

const DEFAULT_FILTERS: SurveyFilters = {
  search: '',
  status: 'all',
  touchpoint: 'all',
  branch: 'all',
  sort: 'updatedAt',
}

export default function SurveysPage() {
  const router = useRouter()
  const { state, duplicate, archive, deleteSurvey, bulkArchive, bulkDelete } = useSurveys()
  const toast = useToast()

  const surveys = state.surveys
  const loading = state.loading
  const [filters, setFilters] = useState<SurveyFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeSurvey, setActiveSurvey] = useState<SurveyRecord | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const stats = useMemo(() => {
    const active = surveys.filter((s) => s.status === 'active').length
    const totalResponses = surveys.reduce((sum, s) => sum + s.responseCount, 0)
    const scored = surveys.filter((s) => s.npsScore !== null)
    const avgNps = scored.length
      ? Math.round(scored.reduce((sum, s) => sum + (s.npsScore ?? 0), 0) / scored.length)
      : 0
    const avgRate = surveys.length
      ? Math.round(surveys.reduce((sum, s) => sum + s.responseRate, 0) / surveys.length)
      : 0
    return [
      { label: 'Total Surveys', value: String(surveys.length), sub: `${active} currently active` },
      { label: 'Total Responses', value: totalResponses.toLocaleString(), sub: 'Across all surveys' },
      { label: 'Avg NPS Score', value: String(avgNps), sub: 'Across scored surveys' },
      { label: 'Avg Response Rate', value: `${avgRate}%`, sub: 'Across all surveys' },
    ]
  }, [surveys])

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase()
    const result = surveys.filter((s) => {
      if (term && !s.title.toLowerCase().includes(term) && !s.id.toLowerCase().includes(term)) return false
      if (filters.status !== 'all') {
        const dbStatus = (s.status || '').toLowerCase()
        const dbLifecycle = (s.lifecycleStatus || '').toLowerCase()
        if (dbStatus !== filters.status.toLowerCase() && dbLifecycle !== filters.status.toLowerCase()) {
          return false
        }
      }
      if (filters.touchpoint !== 'all' && (s.touchpoint || '').toLowerCase() !== filters.touchpoint.toLowerCase()) return false
      if (filters.branch !== 'all' && (s.branch || '').toLowerCase() !== filters.branch.toLowerCase()) return false
      return true
    })

    result.sort((a, b) => {
      switch (filters.sort) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'responseCount':
          return b.responseCount - a.responseCount
        case 'npsScore':
          return (b.npsScore ?? -1) - (a.npsScore ?? -1)
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    return result
  }, [surveys, filters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasActiveFilters = Boolean(
    filters.search || filters.status !== 'all' || filters.touchpoint !== 'all' || filters.branch !== 'all'
  )

  function handleFiltersChange(next: SurveyFilters) {
    setFilters(next)
    setPage(1)
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  function handlePageChange(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages))
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const allOnPageSelected = pageItems.every((s) => prev.has(s.id))
      const next = new Set(prev)
      if (allOnPageSelected) {
        pageItems.forEach((s) => next.delete(s.id))
      } else {
        pageItems.forEach((s) => next.add(s.id))
      }
      return next
    })
  }

  // ─── Action handlers ──────────────────────────────────────────────────────
  // All actions go through the SurveysStore so the list refreshes instantly
  // and the change persists to localStorage. No backend / API is changed.

  function handleView(survey: SurveyRecord) {
    setActiveSurvey(survey)
  }

  function handleEdit(survey: SurveyRecord) {
    // Survey Builder is now the only place to create / edit surveys.
    const editId = survey.numericId ?? survey.id.replace(/^SRV-/, '')
    router.push(`/dashboard/survey-builder?edit=${editId}`)
  }

  function handleDuplicate(survey: SurveyRecord) {
    duplicate(survey.id)
    toast.success('Survey duplicated', `${survey.title} copied as a new draft.`)
  }

  function handleArchive(survey: SurveyRecord) {
    archive(survey.id)
    toast.info('Survey archived', `${survey.title} has been archived.`)
  }

  async function handleDelete(survey: SurveyRecord) {
    try {
      await deleteSurvey(survey.id)
      toast.success('Survey deleted', `${survey.title} has been removed.`)
    } catch (err: any) {
      toast.error('Failed to delete survey', err.message || 'An unexpected error occurred.')
    }
  }

  // ── Copy Survey URL ──
  // Calls PATCH /api/surveys/[id]?action=copy-url which:
  //   1. Generates the public URL using the centralized base URL helper
  //      (NEXT_PUBLIC_APP_URL with LAN IP auto-detection)
  //   2. Records a SURVEY_URL_COPIED audit log entry (survey ID, title,
  //      slug, public URL, actor, timestamp)
  //   3. Returns the URL
  // The client then copies it to the clipboard and shows a success toast.
  async function handleCopyUrl(survey: SurveyRecord) {
    const numericId = survey.numericId ?? survey.id.replace(/^SRV-/, '')
    try {
      const res = await fetch(`/api/surveys/${numericId}?action=copy-url`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        toast.error('Copy failed', json?.error || `HTTP ${res.status}`)
        return
      }
      const url = json.data?.url
      if (!url) {
        toast.error('Copy failed', 'No URL returned by the server.')
        return
      }
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Survey URL copied', url)
      } catch {
        // Clipboard API can fail in non-secure contexts — fall back to a
        // temporary textarea + execCommand('copy')
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        try {
          document.execCommand('copy')
          toast.success('Survey URL copied', url)
        } catch {
          toast.error('Copy failed', 'Please copy this URL manually: ' + url)
        }
        document.body.removeChild(textarea)
      }
    } catch {
      toast.error('Network error', 'Could not reach the server.')
    }
  }

  function handleBulkArchive() {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    bulkArchive(ids)
    toast.info('Bulk archive', `${ids.length} surveys archived.`)
    setSelectedIds(new Set())
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      await bulkDelete(ids)
      toast.success('Bulk delete success', `${ids.length} surveys deleted.`)
      setSelectedIds(new Set())
    } catch (err: any) {
      toast.error('Failed to delete surveys', err.message || 'An unexpected error occurred.')
    }
  }

  return (
    <div className="flex flex-col gap-6 p-7">
      {/* Page header */}
      <div className="animate-fade-up flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-[-0.02em]" style={{ color: 'var(--text)' }}>Survey Management</h1>
          <p className="mt-0.5 text-[12.5px]" style={{ color: 'var(--text-light)' }}>
            Create, distribute, and track NPS surveys across all ADNTC branches.
          </p>
        </div>
        {/* "New Survey" now routes to the Survey Builder — the single creation entry point */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="md" onClick={() => setImportOpen(true)}>
            <Upload size={13} />
            Import
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push('/dashboard/survey-builder')}
            className="!bg-white !text-[var(--primary)] !border-[var(--primary)] hover:!bg-[var(--accent-soft)] hover:!text-[var(--primary-dark)] hover:!border-[var(--primary-dark)] !shadow-[0_3px_10px_rgba(11,74,139,0.15)]"
          >
            <Plus size={13} />
            New Survey
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
            <MetricCard {...s} />
          </div>
        ))}
      </div>

      {/* Table (toolbar lives inside the Card, mirroring ResponseTable) */}
      <SurveyTable
        surveys={pageItems}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onView={handleView}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onCopyUrl={handleCopyUrl}
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
      />

      <SurveyDetailDrawer
        survey={activeSurvey}
        onClose={() => setActiveSurvey(null)}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onCopyUrl={handleCopyUrl}
      />

      {/* Import Survey modal — validates JSON and refreshes the survey list
          via the SurveysStore. */}
      <ImportSurveyModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
