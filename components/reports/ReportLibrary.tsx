'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import {
  Download, RefreshCw, Trash2, MoreHorizontal, Calendar, FileText, Mail, Play, Pause,
} from 'lucide-react'
import type { SavedReport, ScheduledReport, ReportType, ReportFormat } from '@/lib/types/report'
import { REPORT_TYPES, REPORT_FORMATS } from '@/lib/types/report'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (day > 0) return `${day}d ago`
  if (hr > 0) return `${hr}h ago`
  if (min > 0) return `${min}m ago`
  return 'just now'
}

function formatFuture(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const day = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hr = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (day > 0) return `in ${day}d ${hr}h`
  if (hr > 0) return `in ${hr}h`
  return 'soon'
}

function reportTypeLabel(type: ReportType): string {
  return REPORT_TYPES.find(t => t.value === type)?.label ?? type.replace('_', ' ')
}

function reportFormatMeta(format: ReportFormat) {
  return REPORT_FORMATS.find(f => f.value === format) ?? REPORT_FORMATS[0]
}

function resolveIcon(name: string): Icons.LucideIcon {
  return (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? FileText
}

// ─── Status badge ───────────────────────────────────────────────────────────

function ReportStatusBadge({ status }: { status: SavedReport['status'] }) {
  const map: Record<SavedReport['status'], { cls: string; dot: string; label: string }> = {
    ready:      { cls: 'bg-[var(--tint-emerald)] border-[rgba(23,166,115,0.3)] text-[var(--emerald)]', dot: 'var(--emerald)', label: 'Ready' },
    generating: { cls: 'bg-[var(--tint-blue)] border-[rgba(11,74,139,0.3)] text-[var(--primary)]',    dot: 'var(--primary)', label: 'Generating' },
    scheduled:  { cls: 'bg-[var(--tint-amber)] border-[rgba(245,166,35,0.3)] text-[var(--tint-amber-fg)]', dot: '#F5A623', label: 'Scheduled' },
    failed:     { cls: 'bg-[var(--tint-red)] border-[rgba(229,72,77,0.3)] text-[var(--red)]',           dot: 'var(--red)', label: 'Failed' },
  }
  const cfg = map[status]
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-[5px] border px-2 py-0.5 text-[11px] font-semibold ${cfg.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

// ─── Saved report card ──────────────────────────────────────────────────────

function SavedReportCard({ report, onDownload, onRegenerate, onDelete, onPreview, delay = 0 }: {
  report: SavedReport
  onDownload: (r: SavedReport) => void
  onRegenerate: (r: SavedReport) => void
  onDelete: (r: SavedReport) => void
  onPreview: (r: SavedReport) => void
  delay?: number
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const fmt = reportFormatMeta(report.format)
  const FormatIcon = resolveIcon(fmt.icon)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="group flex flex-col rounded-[14px] bg-white p-8.5 transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(13,27,46,0.08)]"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: `${fmt.color}1A`, color: fmt.color }}
        >
          <FormatIcon size={15} strokeWidth={2.1} />
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex h-[24px] w-[24px] items-center justify-center rounded-[5px] opacity-0 transition-all group-hover:opacity-100"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            aria-label="More"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-7 z-50 w-40 overflow-hidden rounded-[10px] border bg-white py-1"
                style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow-lg)' }}
              >
                <button
                  onClick={() => { onPreview(report); setMenuOpen(false) }}
                  className="flex w-full items-center gap-2 px-6 py-3 text-[11px] font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <FileText size={11} /> Preview
                </button>
                <button
                  onClick={() => { onRegenerate(report); setMenuOpen(false) }}
                  className="flex w-full items-center gap-2 px-6 py-3 text-[11px] font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <RefreshCw size={11} /> Regenerate
                </button>
                <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
                <button
                  onClick={() => { onDelete(report); setMenuOpen(false) }}
                  className="flex w-full items-center gap-2 px-6 py-3 text-[11px] font-medium transition-colors"
                  style={{ color: 'var(--red)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--tint-red)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <Trash2 size={11} /> Delete
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <button onClick={() => onPreview(report)} className="mt-2.5 cursor-pointer text-left">
        <div className="line-clamp-2 text-[12.5px] font-bold leading-tight" style={{ color: 'var(--text)' }}>{report.name}</div>
        <div className="mt-0.5 truncate text-[10.5px]" style={{ color: 'var(--text-light)' }}>{reportTypeLabel(report.type)}</div>
      </button>

      <div className="mt-2.5 flex items-center gap-2">
        <ReportStatusBadge status={report.status} />
        <span className="text-[10px] font-semibold tabular" style={{ color: 'var(--text-muted)' }}>{report.size}</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {report.parameters.slice(0, 2).map((p, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-[4px] border px-1.5 py-0.5 text-[9.5px] font-medium"
            style={{
              background: 'var(--bg-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-light)',
            }}
          >
            {p.label}: {p.value}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-2.5" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {formatTimeAgo(report.generatedAt)} · {report.generatedBy}
        </span>
        <button
          onClick={() => onDownload(report)}
          disabled={report.status !== 'ready'}
          className="inline-flex h-[26px] items-center gap-1 rounded-[6px] px-2 text-[10.5px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: 'var(--primary)' }}
        >
          <Download size={10} strokeWidth={2.2} /> Download
        </button>
      </div>
    </motion.div>
  )
}

// ─── Scheduled report row ───────────────────────────────────────────────────

function ScheduledReportRow({ report, onToggle, onRunNow, onDelete, delay = 0 }: {
  report: ScheduledReport
  onToggle: (r: ScheduledReport) => void
  onRunNow: (r: ScheduledReport) => void
  onDelete: (r: ScheduledReport) => void
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-between gap-3 rounded-[12px] bg-white px-3.5 py-3 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(13,27,46,0.06)]"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[10px]"
          style={report.status === 'active'
            ? { background: 'var(--tint-emerald)', color: 'var(--emerald)' }
            : { background: 'var(--bg-subtle)', color: 'var(--text-light)' }
          }
        >
          <Calendar size={14} strokeWidth={2.1} />
        </div>
        <div className="min-w-0">
          <div className="line-clamp-2 text-[12.5px] font-bold leading-tight" style={{ color: 'var(--text)' }}>{report.name}</div>
          <div className="text-[10.5px]" style={{ color: 'var(--text-light)' }}>
            {reportTypeLabel(report.type)} · <span className="font-semibold capitalize">{report.frequency}</span> · {report.format.toUpperCase()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>
            {report.status === 'active' ? `Next: ${formatFuture(report.nextRunAt)}` : 'Paused'}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {report.lastRunAt ? `Last: ${formatTimeAgo(report.lastRunAt)}` : 'Not yet run'}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-0.5 text-[9.5px] font-semibold"
            style={{
              background: 'var(--bg-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-light)',
            }}
            title={`${report.recipients.length} recipients`}
          >
            <Mail size={9} /> {report.recipients.length}
          </span>
          <button
            onClick={() => onRunNow(report)}
            disabled={report.status !== 'active'}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] transition-all disabled:opacity-30"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            title="Run now"
          >
            <Play size={11} strokeWidth={2.2} />
          </button>
          <button
            onClick={() => onToggle(report)}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] transition-all"
            style={report.status === 'active'
              ? { color: 'var(--tint-amber-fg)' }
              : { color: 'var(--emerald)' }
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.background = report.status === 'active' ? 'var(--tint-amber)' : 'var(--tint-emerald)'
            }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            title={report.status === 'active' ? 'Pause' : 'Resume'}
          >
            {report.status === 'active' ? <Pause size={11} strokeWidth={2.2} /> : <Play size={11} strokeWidth={2.2} />}
          </button>
          <button
            onClick={() => onDelete(report)}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--tint-red)'; e.currentTarget.style.color = 'var(--red)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            title="Delete schedule"
          >
            <Trash2 size={11} strokeWidth={2.1} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main library ───────────────────────────────────────────────────────────

interface Props {
  savedReports: SavedReport[]
  scheduledReports: ScheduledReport[]
  onDownload: (r: SavedReport) => void
  onRegenerate: (r: SavedReport) => void
  onDelete: (r: SavedReport) => void
  onPreview: (r: SavedReport) => void
  onToggleSchedule: (r: ScheduledReport) => void
  onRunSchedule: (r: ScheduledReport) => void
  onDeleteSchedule: (r: ScheduledReport) => void
}

export function ReportLibrary({ savedReports, scheduledReports, onDownload, onRegenerate, onDelete, onPreview, onToggleSchedule, onRunSchedule, onDeleteSchedule }: Props) {
  const [tab, setTab] = useState<'library' | 'scheduled'>('library')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[28px] w-[28px] items-center justify-center rounded-[9px]"
            style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}
          >
            <FileText size={14} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-[14.5px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>
              Report Library
            </h2>
            <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>
              Saved reports and scheduled jobs
            </p>
          </div>
        </div>
        <div
          className="inline-flex items-center gap-0.5 rounded-[10px] p-0.5"
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
          }}
        >
          <button
            onClick={() => setTab('library')}
            className="inline-flex h-[30px] items-center gap-2.5 rounded-[8px] px-3 text-[11.5px] font-semibold transition-all"
            style={tab === 'library'
              ? { background: '#fff', color: 'var(--primary)', boxShadow: 'var(--shadow-xs)' }
              : { color: 'var(--text-light)' }
            }
            onMouseEnter={(e) => { if (tab !== 'library') e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e) => { if (tab !== 'library') e.currentTarget.style.color = 'var(--text-light)' }}
          >
            <FileText size={12} strokeWidth={2.2} /> Library
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular"
              style={{
                background: tab === 'library' ? 'var(--tint-blue)' : 'var(--bg-subtle)',
                color: tab === 'library' ? 'var(--primary)' : 'var(--text-light)',
              }}
            >
              {savedReports.length}
            </span>
          </button>
          <button
            onClick={() => setTab('scheduled')}
            className="inline-flex h-[30px] items-center gap-2.5 rounded-[8px] px-3 text-[11.5px] font-semibold transition-all"
            style={tab === 'scheduled'
              ? { background: '#fff', color: 'var(--primary)', boxShadow: 'var(--shadow-xs)' }
              : { color: 'var(--text-light)' }
            }
            onMouseEnter={(e) => { if (tab !== 'scheduled') e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e) => { if (tab !== 'scheduled') e.currentTarget.style.color = 'var(--text-light)' }}
          >
            <Calendar size={12} strokeWidth={2.2} /> Scheduled
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular"
              style={{
                background: tab === 'scheduled' ? 'var(--tint-amber)' : 'var(--bg-subtle)',
                color: tab === 'scheduled' ? 'var(--tint-amber-fg)' : 'var(--text-light)',
              }}
            >
              {scheduledReports.length}
            </span>
          </button>
        </div>
      </div>

      {tab === 'library' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {savedReports.map((r, i) => (
            <SavedReportCard
              key={r.id}
              report={r}
              onDownload={onDownload}
              onRegenerate={onRegenerate}
              onDelete={onDelete}
              onPreview={onPreview}
              delay={i * 0.04}
            />
          ))}
          {savedReports.length === 0 && (
            <div
              className="col-span-full flex min-h-[200px] items-center justify-center rounded-[12px] border border-dashed text-[11px] font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              No saved reports yet — generate one from the templates below
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {scheduledReports.map((r, i) => (
            <ScheduledReportRow
              key={r.id}
              report={r}
              onToggle={onToggleSchedule}
              onRunNow={onRunSchedule}
              onDelete={onDeleteSchedule}
              delay={i * 0.04}
            />
          ))}
          {scheduledReports.length === 0 && (
            <div
              className="flex min-h-[200px] items-center justify-center rounded-[12px] border border-dashed text-[11px] font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              No scheduled reports yet — schedule one from the Quick Report Generator
            </div>
          )}
        </div>
      )}
    </div>
  )
}
