'use client'

import { useCallback, useEffect, useState } from 'react'
import ExpandableResponseRow, { type ResponseRecord } from './ExpandableResponseRow'
import { Filter, ArrowUpDown } from 'lucide-react'
import { useToast } from '@/lib/stores/ToastStore'

type SegmentFilter = 'all' | 'promoter' | 'passive' | 'detractor'
type SortKey = 'recent' | 'score_high' | 'score_low'

const COLS = ['Score', 'Respondent', 'Comment', 'Segment', 'Survey', 'Channel', 'Date']

const SEGMENT_OPTIONS: { value: SegmentFilter; label: string }[] = [
  { value: 'all',       label: 'All Segments'   },
  { value: 'promoter',  label: 'Promoters'      },
  { value: 'passive',   label: 'Passives'       },
  { value: 'detractor', label: 'Detractors'     },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent',     label: 'Recent'          },
  { value: 'score_high', label: 'Highest Score'   },
  { value: 'score_low',  label: 'Lowest Score'    },
]

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function ResponseTable({ range = '30d', branch = 'all' }: { range?: string; branch?: string }) {
  const toast = useToast()
  const [responses, setResponses] = useState<ResponseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [segment, setSegment] = useState<SegmentFilter>('all')
  const [sort, setSort] = useState<SortKey>('recent')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.user?.id) setCurrentUserId(json.user.id)
      })
      .catch(() => { /* ignore */ })
  }, [])

  const loadResponses = useCallback(async () => {
    setLoading(true)

    // Compute date range
    const now = new Date()
    const since = new Date()
    switch (range) {
      case '7d':  since.setDate(now.getDate() - 7); break
      case '30d': since.setDate(now.getDate() - 30); break
      case '90d': since.setDate(now.getDate() - 90); break
      case '1y':  since.setFullYear(now.getFullYear() - 1); break
    }
    const dateFrom = since.toISOString().split('T')[0]

    let url = `/api/responses?pageSize=8&branch=${encodeURIComponent(branch)}&dateFrom=${dateFrom}`
    if (segment !== 'all') url += `&npsCategory=${segment}`
    if (sort === 'score_high') url += '&sort=npsScore&sortDir=desc'
    if (sort === 'score_low') url += '&sort=npsScore&sortDir=asc'

    fetch(url, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        type ApiResponseRow = {
          id: string
          surveyId: number
          npsScore?: number | null
          respondentName?: string | null
          respondentEmail?: string | null
          feedback?: string | null
          surveyTitle?: string | null
          touchpoint?: string | null
          surveyBranch?: string | null
          submittedAt: string
          assignedToId?: number | null
          assignedToName?: string | null
          assignedAt?: string | null
        }
        const mapped: ResponseRecord[] = (json.data as ApiResponseRow[]).map((r) => {
          const score = r.npsScore ?? 0
          const seg: ResponseRecord['segment'] = score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor'
          return {
            id: r.id,
            surveyId: r.surveyId,
            score,
            name: r.respondentName || 'Anonymous',
            company: r.respondentEmail || '—',
            comment: r.feedback || r.surveyTitle || '',
            segment: seg,
            product: r.surveyTitle || r.touchpoint || '—',
            branch: r.surveyBranch || '—',
            date: timeAgo(r.submittedAt),
            assignedToId: r.assignedToId ?? null,
            assignedToName: r.assignedToName ?? null,
            assignedAt: r.assignedAt ?? null,
          }
        })
        setResponses(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [range, branch, segment, sort])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadResponses()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadResponses])

  async function handleAssign(row: ResponseRecord) {
    if (!currentUserId) {
      toast.error('Cannot assign', 'Please sign in again and try once more.')
      return
    }
    try {
      const res = await fetch(`/api/responses/${row.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: currentUserId }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        toast.error('Assign failed', json?.error || 'Could not assign this response.')
        return
      }
      const json = await res.json()
      setResponses(prev => prev.map(r => r.id === row.id ? {
        ...r,
        assignedToId: json.data?.assignedToId ?? currentUserId,
        assignedToName: json.data?.assignedToName ?? 'You',
        assignedAt: json.data?.assignedAt ?? new Date().toISOString(),
      } : r))
      toast.success('Response assigned', 'The response is now assigned to you.')
    } catch {
      toast.error('Assign failed', 'Could not assign this response.')
    }
  }

  async function handleArchiveSurvey(row: ResponseRecord) {
    try {
      const res = await fetch(`/api/surveys/${row.surveyId}?action=archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        toast.error('Archive failed', json?.error || 'Could not archive the survey.')
        return
      }
      toast.success('Survey archived', `${row.product} was archived.`)
    } catch {
      toast.error('Archive failed', 'Could not archive the survey.')
    }
  }

  const filtered = responses

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-700 text-base" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Recent Responses</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${filtered.length} recent responses`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segment filter */}
          <div className="relative">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value as SegmentFilter)}
              className="appearance-none rounded-[8px] border bg-white py-1.5 pl-7 pr-8 text-xs font-medium outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {SEGMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none rounded-[8px] border bg-white py-1.5 pl-7 pr-8 text-xs font-medium outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {COLS.map(col => (
                <th key={col} className="whitespace-nowrap px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLS.length} className="py-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Loading responses…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={COLS.length} className="py-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  No responses found.
                </td>
              </tr>
            ) : (
              filtered.map(r => (
                <ExpandableResponseRow
                  key={r.id}
                  row={r}
                  isExpanded={expandedId === r.id}
                  onToggle={(id) => setExpandedId(prev => prev === id ? null : id)}
                  currentUserId={currentUserId}
                  onAssign={handleAssign}
                  onArchiveSurvey={handleArchiveSurvey}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
