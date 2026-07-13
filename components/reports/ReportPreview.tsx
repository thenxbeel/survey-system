'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, RefreshCw, FileText, BarChart3, Calendar, Building2 } from 'lucide-react'
import { ChartTooltip } from '@/components/analytics/charts/ChartTooltip'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { SavedReport } from '@/lib/types/report'
import { reportNpsTrendData, reportBranchData, REPORT_TYPES } from '@/lib/types/report'

interface Props {
  report: SavedReport | null
  onClose: () => void
  onDownload?: (r: SavedReport) => void
  onRegenerate?: (r: SavedReport) => void
  npsTrendData?: { period: string; nps: number; responses: number }[]
  branchPerfData?: { branch: string; nps: number; responses: number }[]
}

function reportTypeLabel(type: string): string {
  return REPORT_TYPES.find(t => t.value === type)?.label ?? type.replace('_', ' ')
}

export function ReportPreview({ report, onClose, onDownload, onRegenerate, npsTrendData, branchPerfData }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const trendChartData = npsTrendData && npsTrendData.length > 0 ? npsTrendData : reportNpsTrendData
  const branchChartData = branchPerfData && branchPerfData.length > 0 ? branchPerfData : reportBranchData

  return (
    <AnimatePresence>
      {report && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex max-h-[90vh] w-full max-w-[860px] flex-col overflow-hidden rounded-[18px] bg-white"
              style={{ border: '1px solid var(--border)', boxShadow: '0 0 60px rgba(13,27,46,0.18)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{
                  background: 'var(--bg-subtle)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px]"
                    style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}
                  >
                    <FileText size={16} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>
                      {report.name}
                    </h2>
                    <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-light)' }}>
                      {reportTypeLabel(report.type)} · {report.format.toUpperCase()} · {report.size}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center text-center rounded-[8px] p-2 transition-all"
                  style={{ color: 'var(--text-light)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Metadata bar */}
              <div
                className="flex flex-wrap items-center gap-3 px-6 py-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <MetaItem
                  icon={Calendar}
                  label="Generated"
                  value={new Date(report.generatedAt).toLocaleString('en-AE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                />
                <MetaItem icon={FileText} label="By" value={report.generatedBy} />
                <MetaItem icon={Building2} label="Period" value={report.parameters[0]?.value ?? '—'} />
                <div className="flex-1" />
                <button
                  onClick={() => onRegenerate?.(report)}
                  className="inline-flex h-[28px] items-center gap-2.5 rounded-[8px] border bg-white px-2.5 text-[11px] font-semibold transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <RefreshCw size={11} strokeWidth={2.1} /> Regenerate
                </button>
                <button
                  onClick={() => onDownload?.(report)}
                  disabled={report.status !== 'ready'}
                  className="inline-flex h-[28px] items-center gap-2.5 rounded-[8px] px-2.5 text-[11px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: 'var(--primary)' }}
                >
                  <Download size={11} strokeWidth={2.2} /> Download {report.format.toUpperCase()}
                </button>
              </div>

              {/* Preview body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div
                    className="rounded-[12px] bg-white p-8"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <BarChart3 size={12} style={{ color: 'var(--primary)' }} strokeWidth={2.2} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--text-light)' }}>
                        NPS Trend
                      </span>
                    </div>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendChartData} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
                          <defs>
                            <linearGradient id="prev-nps" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0B4A8B" stopOpacity="0.32" />
                              <stop offset="100%" stopColor="#0B4A8B" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
                          <XAxis dataKey="period" tick={{ fill: '#8FA0B5', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={6} />
                          <YAxis orientation="right" tick={{ fill: '#8FA0B5', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={32} />
                          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(138, 148, 166, 0.2)' }} />
                          <Area type="monotone" dataKey="nps" name="NPS" stroke="#0B4A8B" strokeWidth={2.2} fill="url(#prev-nps)" dot={{ r: 3, fill: '#0B4A8B', stroke: '#FFFFFF', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#0B4A8B', stroke: '#FFFFFF', strokeWidth: 2 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div
                    className="rounded-[12px] bg-white p-8"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <BarChart3 size={12} style={{ color: 'var(--primary)' }} strokeWidth={2.2} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--text-light)' }}>
                        Branch Performance
                      </span>
                    </div>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={branchChartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 8 }}>
                          <CartesianGrid horizontal={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
                          <XAxis type="number" tick={{ fill: '#8FA0B5', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="branch" tick={{ fill: '#4A5568', fontSize: 10, fontFamily: 'Inter', fontWeight: 500 }} axisLine={false} tickLine={false} width={80} />
                          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }} />
                          <Bar dataKey="nps" name="NPS" radius={[0, 5, 5, 0]} barSize={14}>
                            {branchChartData.map((_, i) => <Cell key={i} fill={['#0B4A8B', '#17A673', '#F5A623', '#E5484D', '#7C3AED'][i % 5]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Parameters */}
                <div
                  className="mt-3 rounded-[12px] bg-white p-8"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--text-light)' }}>
                    Report Parameters
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {(report.parameters || []).map((p, i) => (
                      <div
                        key={i}
                        className="rounded-[8px] px-3 py-2"
                        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                      >
                        <div className="text-[9.5px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--text-muted)' }}>
                          {p.label}
                        </div>
                        <div className="mt-0.5 text-[12px] font-semibold" style={{ color: 'var(--text)' }}>{p.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Executive summary text */}
                <div
                  className="mt-3 rounded-[12px] bg-white p-8"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--text-light)' }}>
                    Executive Summary
                  </div>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    This report covers the {report.period} reporting period. NPS trend shows a steady upward trajectory with a 12-month average of 47 (+9 points YoY). Branch performance varies significantly, with Dubai leading at +54 and Al Ain trailing at +39. Detractor concentration remains in the Claims Handling department, which has seen a 4-point improvement following the Q1 process overhaul. Promoter rate currently stands at 62% of all responses, with passive and detractor segments at 23% and 15% respectively. Response rate is 68% — 44 points above industry benchmark.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={11} style={{ color: 'var(--text-muted)' }} />
      <span className="text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}
