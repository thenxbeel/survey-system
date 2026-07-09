'use client'

import { motion } from 'framer-motion'
import { FileBarChart, Download, Plus, CalendarClock, RefreshCw } from 'lucide-react'
import Button from '@/components/common/Button'

interface Props {
  totalReports: number
  scheduledCount: number
  onExport?: () => void
  onNew?: () => void
  onSchedule?: () => void
  onRefresh?: () => void
}

/**
 * ReportHeader — premium hero banner matching the enterprise design system.
 */
export function ReportHeader({ totalReports, scheduledCount, onExport, onNew, onSchedule, onRefresh }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col gap-4 overflow-hidden rounded-[22px] p-8 lg:flex-row lg:items-center lg:justify-between"
      style={{
        background: 'linear-gradient(135deg, #0B4A8B 0%, #083a70 60%, #052d58 100%)',
        boxShadow: '0 10px 40px rgba(11,74,139,0.32), 0 2px 8px rgba(11,74,139,0.16)',
        minHeight: 110, /* hero should always feel substantial */
      }}
    >
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
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
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(45deg,  #fff 0 1px, transparent 1px 44px)',
            'repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 44px)',
          ].join(','),
        }}
      />

      {/* Left: Title */}
      <div className="relative z-[1] flex min-w-0 items-center gap-3">
        <div
          className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-[13px]"
          style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          <FileBarChart size={20} color="#fff" />
        </div>
        <div className="min-w-0">
          <h1
            className="break-words text-[20px] font-extrabold text-white"
            style={{ letterSpacing: '-0.025em', lineHeight: 1.2 }}
          >
            Reports &amp; Export Center
          </h1>
          <p className="mt-0.5 break-words text-[12px]" style={{ color: 'rgba(255,255,255,0.62)' }}>
            Executive reporting, scheduled exports, and custom report builder.
          </p>
        </div>
      </div>

      {/* Right: Live counters + actions */}
      <div className="relative z-[1] flex flex-wrap items-center gap-2">
        {/* Total counter */}
        <div
          className="flex items-center gap-2.5 rounded-[10px] px-3.5 py-2"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Reports
            </div>
            <div className="text-[18px] font-extrabold leading-none text-white tabular" style={{ letterSpacing: '-0.03em' }}>
              {totalReports}
            </div>
          </div>
        </div>

        {/* Scheduled counter */}
        <div
          className="flex items-center gap-2.5 rounded-[10px] px-3.5 py-2"
          style={{
            background: 'rgba(245,166,35,0.18)',
            border: '1px solid rgba(245,166,35,0.3)',
          }}
        >
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: 'rgba(255,220,160,0.85)' }}>
              Scheduled
            </div>
            <div className="text-[18px] font-extrabold leading-none tabular" style={{ color: '#FBBF24', letterSpacing: '-0.03em' }}>
              {scheduledCount}
            </div>
          </div>
        </div>

        {/* Refresh */}
        <Button
          onClick={onRefresh}
          variant="ghost"
          size="md"
          aria-label="Refresh reports"
          className="!text-white !border-[rgba(255,255,255,0.15)] hover:!bg-[rgba(255,255,255,0.15)] !bg-[rgba(255,255,255,0.1)]"
        >
          <RefreshCw size={13} className="active:animate-spin" />
        </Button>

        {/* Schedule */}
        <Button
          onClick={onSchedule}
          variant="ghost"
          size="md"
          className="!text-white !border-[rgba(255,255,255,0.15)] hover:!bg-[rgba(255,255,255,0.15)] !bg-[rgba(255,255,255,0.1)]"
        >
          <CalendarClock size={13} />
          <span className="hidden md:inline">Schedule</span>
        </Button>

        {/* Export All */}
        <Button
          onClick={onExport}
          variant="ghost"
          size="md"
          className="!text-white !border-[rgba(255,255,255,0.15)] hover:!bg-[rgba(255,255,255,0.15)] !bg-[rgba(255,255,255,0.1)]"
        >
          <Download size={13} />
          <span className="hidden md:inline">Export All</span>
        </Button>

        {/* New Report */}
        <Button
          onClick={onNew}
          variant="secondary"
          size="md"
          className="!bg-white !text-[#0B4A8B] hover:!bg-[#f7fafc] !shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span className="hidden md:inline">New Report</span>
        </Button>
      </div>
    </motion.div>
  )
}
