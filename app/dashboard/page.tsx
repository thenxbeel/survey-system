'use client'

import { useMemo, useState, useCallback } from 'react'
import KPICards from '@/components/dashboard/KPICards'
import GreetingHero from '@/components/dashboard/GreetingHero'
import { TrendChart } from '@/components/charts/TrendChart'
import ResponseTable from '@/components/dashboard/ResponseTable'
import BottomAnalytics from '@/components/dashboard/BottomAnalytics'
import { ExportModal } from '@/components/dashboard/ExportModal'
import { useToast } from '@/lib/stores/ToastStore'
import { useGlobalSearch } from '@/lib/stores/GlobalSearchStore'
import { useBranchOptions } from '@/lib/hooks/useBranches'
import { Download } from 'lucide-react'

/**
 * Dashboard — fully connected to live backend:
 *   - Range selector (7d/30d/90d/1y) drives KPIs + chart + table refresh
 *   - Search bar filters dashboard content (uses GlobalSearchStore)
 *   - Refresh button re-mounts the chart + refetches data
 */
type RangeKey = '7d' | '30d' | '90d' | '1y'

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '7d',  label: '7d'  },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
  { key: '1y',  label: '1y'  },
]

export default function DashboardPage() {
  const toast = useToast()
  const { query: globalSearch } = useGlobalSearch()
  const branchOptions = useBranchOptions()
  const [range, setRange] = useState<RangeKey>('30d')
  const [branch, setBranch] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [chartKey, setChartKey] = useState(0)
  const [exportOpen, setExportOpen] = useState(false)

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setChartKey(k => k + 1)
    setTimeout(() => {
      setRefreshing(false)
      toast.success('Dashboard refreshed', `Latest data for the ${range} range loaded.`)
    }, 700)
  }, [range, toast])

  const handleRangeChange = useCallback((next: RangeKey) => {
    setRange(next)
    setChartKey(k => k + 1)
  }, [])

  const trendSubtitle = useMemo(() => {
    switch (range) {
      case '7d':  return 'Last 7 days · daily NPS'
      case '30d': return 'Last 30 days · weekly NPS'
      case '90d': return 'Last 90 days · monthly NPS'
      case '1y':  return 'Last 12 months · monthly NPS'
    }
  }, [range])

  return (
    <div className="flex flex-col gap-6 p-7 animate-fade-up">
      <GreetingHero />

      {/* ─── Dashboard filter bar ─── */}
      <div
        className="flex flex-wrap items-center gap-4 rounded-[18px] bg-white px-6 py-4"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        {/* Range selector */}
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] font-bold uppercase tracking-[0.06em] sm:inline" style={{ color: 'var(--text-light)' }}>
            Period
          </span>
          <div
            className="flex items-center gap-0.5 rounded-[9px] p-0.5"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            {RANGES.map(r => {
              const active = range === r.key
              return (
                <button
                  key={r.key}
                  onClick={() => handleRangeChange(r.key)}
                  className="rounded-[7px] text-[11.5px] font-semibold transition-all duration-150"
                  style={active
                    ? { background: '#fff', color: 'var(--primary)', boxShadow: 'var(--shadow-xs)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                    : { color: 'var(--text-light)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                  }
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-light)' }}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Global search indicator */}
        {globalSearch && (
          <div
            className="flex items-center gap-2.5 rounded-[8px] text-[11px] font-semibold"
            style={{ background: 'var(--accent-soft)', color: 'var(--primary)', padding: '10px 16px' }}
          >
            <span>Search: &quot;{globalSearch}&quot;</span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('clear-global-search'))}
              className="ml-1 transition-opacity hover:opacity-70"
              aria-label="Clear search"
            >
              ✕
            </button>
          </div>
        )}

        {/* Branch selector */}
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] font-bold uppercase tracking-[0.06em] sm:inline" style={{ color: 'var(--text-light)' }}>
            Branch
          </span>
          <div className="relative">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="appearance-none rounded-[9px] border bg-white py-2 pl-3 pr-9 text-[11.5px] font-semibold outline-none transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-subtle)' }}
            >
              {branchOptions.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px]"
              style={{ color: 'var(--text-light)' }}
            >
              ▼
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="ml-auto flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center text-center icon-btn rounded-[8px]"
            aria-label="Refresh dashboard"
            title="Refresh"
            disabled={refreshing}
            style={{ border: '1px solid var(--border)', background: 'var(--bg-subtle)', padding: '10px' }}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={refreshing ? 'animate-spin' : ''}
              style={{ color: 'var(--text-secondary)' }}
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>

          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center justify-center gap-2 rounded-[8px] px-4 py-2.5 text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99]"
            style={{ background: 'var(--primary)', boxShadow: 'var(--shadow-xs)' }}
          >
            <Download size={13} />
            Export
          </button>

        </div>
      </div>

      {/* KPI cards — fetch live data, keyed by range+branch to refetch on filter change */}
      <div key={`kpi-${range}-${branch}`}>
        <KPICards range={range} branch={branch} />
      </div>

      {/* NPS Trend — with working period selector + refresh */}
      <div
        className="rounded-[18px] bg-white"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h3 className="text-[14px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>
              NPS Trend
            </h3>
            <p className="mt-1 text-[11.5px]" style={{ color: 'var(--text-light)' }}>{trendSubtitle}</p>
          </div>
        </div>
        <div className="p-6 pt-2">
          <TrendChart key={chartKey} range={range} branch={branch} />
        </div>
      </div>

      <ResponseTable key={`resp-${chartKey}`} range={range} branch={branch} />
      <BottomAnalytics key={`bottom-${chartKey}`} range={range} branch={branch} />

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        range={range}
        branch={branch}
      />

    </div>
  )
}
