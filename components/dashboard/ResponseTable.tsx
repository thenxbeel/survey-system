'use client'

import { useEffect, useMemo, useState } from 'react'
import ExpandableResponseRow, { type ResponseRecord } from './ExpandableResponseRow'
import { Filter, ArrowUpDown } from 'lucide-react'

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
  { value: 'recent',     label: 'Most Recent'     },
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
  const [responses, setResponses] = useState<ResponseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [segment, setSegment] = useState<SegmentFilter>('all')
  const [sort, setSort] = useState<SortKey>('recent')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)

    // Compute date range
    const now = new Date()
    let since = new Date()
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
        const mapped: ResponseRecord[] = json.data.map((r: any) => {
          const score = r.npsScore ?? 0
          const seg: ResponseRecord['segment'] = score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor'
          return {
            id: r.id,
            score,
            name: r.respondentName || 'Anonymous',
            company: r.respondentEmail || '—',
            comment: r.feedback || r.surveyTitle || '',
            segment: seg,
            product: r.surveyTitle || r.touchpoint || '—',
            branch: r.surveyBranch || '—',
            date: timeAgo(r.submittedAt),
          }
        })
        setResponses(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [range, branch, segment, sort])

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
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
