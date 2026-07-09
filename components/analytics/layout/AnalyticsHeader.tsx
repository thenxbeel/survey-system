'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download, Sparkles, Plus, RefreshCw, CalendarRange, ChevronDown,
  SlidersHorizontal, type LucideIcon,
} from 'lucide-react'
import { useAnalytics } from '../state/useAnalytics'
import Button from '@/components/common/Button'

const dateRanges = [
  { value: '7d',  label: 'Last 7 days'   },
  { value: '30d', label: 'Last 30 days'  },
  { value: '90d', label: 'Last 90 days'  },
  { value: 'qtr', label: 'This Quarter'  },
  { value: 'ytd', label: 'Year to Date'  },
  { value: 'all', label: 'All Time'      },
]

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const [open, setOpen] = useState(false)
  const ref = useState<T | null>(null)
  return { open, setOpen, ref }
}

export function AnalyticsHeader() {
  const { dispatch, state } = useAnalytics()
  const [dateOpen, setDateOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 900)
  }

  const currentRange = dateRanges.find(r => r.value === state.filters.period) ?? dateRanges[1]

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col gap-4 rounded-[22px] p-8 lg:flex-row lg:items-center lg:justify-between"
      style={{
        background: 'var(--hero-bg)',
        boxShadow: '0 10px 40px rgba(11,74,139,0.32), 0 2px 8px rgba(11,74,139,0.16)',
        minHeight: 110,
      }}
    >
      {/* Background decorations clipped to rounded corners */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
        {/* Ambient glows */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(11,107,196,0.22) 0%, transparent 70%)',
              'radial-gradient(ellipse 40% 60% at 100% 80%, rgba(4,37,78,0.4) 0%, transparent 60%)',
            ].join(','),
          }}
        />
        {/* Geometric pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: [
              'repeating-linear-gradient(45deg,  #fff 0 1px, transparent 1px 44px)',
              'repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 44px)',
            ].join(','),
          }}
        />
      </div>

      {/* ── Left: Title + subtitle ── */}
      <div className="relative z-[1] flex min-w-0 items-center gap-3">
        <div
          className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-[13px]"
          style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          <Sparkles size={20} color="#fff" />
        </div>
        <div className="min-w-0">
          <h1
            className="break-words text-[20px] font-extrabold text-white"
            style={{ letterSpacing: '-0.025em', lineHeight: 1.2 }}
          >
            Executive Analytics
          </h1>
          <p className="mt-0.5 break-words text-[12px]" style={{ color: 'rgba(255,255,255,0.62)' }}>
            Comprehensive insights, trends, and metrics across all ADNTC branches.
          </p>
        </div>
      </div>

      {/* ── Right: action cluster ── */}
      <div className="relative z-[1] flex flex-wrap items-center gap-2">
        {/* Date range selector */}
        <div className="relative">
          <Button
            onClick={() => setDateOpen(o => !o)}
            variant="ghost"
            size="md"
            className="!text-white !border-[rgba(255,255,255,0.15)] hover:!bg-[rgba(255,255,255,0.15)] !bg-[rgba(255,255,255,0.1)]"
          >
            <CalendarRange size={13} />
            <span className="hidden sm:inline">{currentRange.label}</span>
            <span className="sm:hidden">{currentRange.value}</span>
            <ChevronDown size={12} className={`transition-transform ${dateOpen ? 'rotate-180' : ''}`} />
          </Button>
          {dateOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDateOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[180px] overflow-hidden rounded-[10px] border border-[var(--border)] bg-white py-1"
                style={{ boxShadow: 'var(--shadow-lg)' }}
              >
                {dateRanges.map(r => {
                  const active = r.value === state.filters.period
                  return (
                    <button
                      key={r.value}
                      onClick={() => {
                        dispatch({ type: 'SET_FILTER', key: 'period', value: r.value })
                        setDateOpen(false)
                      }}
                      className="flex w-full items-center justify-between px-6 py-3 text-[12px] transition-colors"
                      style={{
                        background: active ? 'var(--tint-blue)' : 'transparent',
                        color: active ? 'var(--primary)' : 'var(--text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.background = 'var(--bg-subtle)'
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <span>{r.label}</span>
                      {active && <span className="text-[10px] font-bold">●</span>}
                    </button>
                  )
                })}
              </motion.div>
            </>
          )}
        </div>



        {/* Refresh */}
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="md"
          aria-label="Refresh analytics"
          className="!text-white !border-[rgba(255,255,255,0.15)] hover:!bg-[rgba(255,255,255,0.15)] !bg-[rgba(255,255,255,0.1)]"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
        </Button>

        {/* Export */}
        <Button
          onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'export' })}
          variant="ghost"
          size="md"
          className="!text-white !border-[rgba(255,255,255,0.15)] hover:!bg-[rgba(255,255,255,0.15)] !bg-[rgba(255,255,255,0.1)]"
        >
          <Download size={13} />
          Export
        </Button>

        {/* Ask Analytics */}
        <Button
          onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'ask' })}
          variant="ghost"
          size="md"
          className="!text-white !border-transparent hover:!opacity-95 !bg-gradient-to-r !from-[rgba(245,158,11,0.95)] !to-[rgba(239,68,68,0.95)] !shadow-[0_4px_12px_rgba(239,68,68,0.25)]"
        >
          <Sparkles size={13} />
          <span className="hidden md:inline">AI Analysis ✨</span>
        </Button>

        {/* New visualization */}
        <Button
          onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'vizBuilder' })}
          variant="secondary"
          size="md"
          className="!bg-white !text-[#0B4A8B] hover:!bg-[#f7fafc] !shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span className="hidden md:inline">New Dashboard</span>
        </Button>
      </div>
    </motion.div>
  )
}
