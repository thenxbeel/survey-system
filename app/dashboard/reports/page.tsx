'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import {
  type SavedReport, type ScheduledReport, type QuickReportConfig, type ScheduleFreq,
  computeReportStats, REPORT_TEMPLATES,
} from '@/lib/types/report'
import { ReportHeader } from '@/components/reports/ReportHeader'
import { ReportStatsCards } from '@/components/reports/ReportStatsCards'
import { ReportLibrary } from '@/components/reports/ReportLibrary'
import { QuickReportGenerator } from '@/components/reports/QuickReportGenerator'
import { CustomReportBuilder } from '@/components/reports/CustomReportBuilder'
import { ReportPreview } from '@/components/reports/ReportPreview'
import { ExecutivePanel } from '@/components/analytics/overview/ExecutivePanel'
import { NpsTrendChart } from '@/components/reports/charts/NpsTrendChart'
import { ReportHeatmap } from '@/components/reports/charts/ReportHeatmap'
import { TrendingUp, Grid3x3 } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'info' | 'warning'
  title: string
  message: string
  at: number
}

const TOAST_ICONS = { success: CheckCircle2, info: Info, warning: AlertTriangle }
const TOAST_COLORS = { success: '#17A673', info: '#0B4A8B', warning: '#F5A623' }

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = TOAST_ICONS[t.type]
          const color = TOAST_COLORS[t.type]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex w-[340px] items-start gap-3 rounded-[12px] bg-white p-8"
              style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px]" style={{ background: `${color}1A` }}>
                <Icon size={14} style={{ color }} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>{t.title}</div>
                <div className="mt-0.5 text-[11.5px]" style={{ color: 'var(--text-light)' }}>{t.message}</div>
              </div>
              <button
                onClick={() => onDismiss(t.id)}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[5px] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Dismiss"
              >
                <X size={12} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default function ReportsPage() {
  const [loading, setLoading]             = useState(true)
  const [savedReports, setSavedReports]   = useState<SavedReport[]>([])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [previewReport, setPreviewReport] = useState<SavedReport | null>(null)
  const [toasts, setToasts]               = useState<Toast[]>([])
  const [activeBuilderTab, setActiveBuilderTab] = useState<'quick' | 'custom'>('quick')

  // ── Live chart data from analytics API ──
  const [npsTrendData, setNpsTrendData] = useState<any[]>([])
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [branchPerfData, setBranchPerfData] = useState<any[]>([])

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/reports', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setSavedReports(data.savedReports || [])
        setScheduledReports(data.scheduledReports || [])
      }
    } catch {
      // ignore
    }
  }, [])

  const loadAllData = useCallback(async () => {
    setLoading(true)
    try {
      const [trends, heatmap, overview] = await Promise.all([
        fetch('/api/analytics/trends?period=monthly', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
        fetch('/api/analytics/heatmap', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
        fetch('/api/analytics/overview?period=1y', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
        fetchReports()
      ])
      
      if (trends?.data) {
        setNpsTrendData(
          trends.data.map((item: any) => ({
            period: item.date,
            nps: item.npsScore,
            responses: item.responses,
          }))
        )
      }
      if (heatmap?.data) setHeatmapData(heatmap.data)
      if (overview?.data?.branchPerf) {
        setBranchPerfData(
          overview.data.branchPerf.map((b: any) => ({
            branch: b.branchName,
            nps: b.nps,
            responses: b.responseCount
          }))
        )
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [fetchReports])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  const stats = useMemo(() => computeReportStats(savedReports, scheduledReports, REPORT_TEMPLATES), [savedReports, scheduledReports])

  const pushToast = useCallback((type: Toast['type'], title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setToasts(prev => [...prev, { id, type, title, message, at: Date.now() }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  function handleNotify(n: { type: 'success' | 'info' | 'warning'; title: string; message: string }) { pushToast(n.type, n.title, n.message) }

  // ── Download a report by hitting the live /api/reports/export endpoint ──
  function handleDownload(r: SavedReport) {
    const branchParam = r.parameters?.find(p => p.label === 'Branch')?.value || 'All'
    const deptParam = r.parameters?.find(p => p.label === 'Department')?.value || 'All'
    const periodParam = r.period || 'all'
    const url = `/api/reports/export?format=${r.format || 'csv'}&type=${r.type}&branch=${encodeURIComponent(branchParam)}&department=${encodeURIComponent(deptParam)}&period=${periodParam}`
    window.open(url, '_blank')
    pushToast('success', 'Download started', `${r.name} (${(r.format || 'csv').toUpperCase()}) is downloading.`)
  }

  function handleRegenerate(r: SavedReport) {
    const branchParam = r.parameters?.find(p => p.label === 'Branch')?.value || 'All'
    const deptParam = r.parameters?.find(p => p.label === 'Department')?.value || 'All'
    const periodParam = r.period || 'all'
    const url = `/api/reports/export?format=${r.format || 'csv'}&type=${r.type}&branch=${encodeURIComponent(branchParam)}&department=${encodeURIComponent(deptParam)}&period=${periodParam}`
    window.open(url, '_blank')
    pushToast('info', 'Regenerating', `${r.name} regenerated.`)
  }

  async function handleDelete(r: SavedReport) {
    try {
      await fetch(`/api/reports/saved/${r.id}`, { method: 'DELETE' })
      setSavedReports(prev => prev.filter(x => x.id !== r.id))
      pushToast('info', 'Report deleted', `${r.name} removed from library.`)
    } catch {
      pushToast('warning', 'Error', 'Failed to delete report.')
    }
  }

  // ── Generate a report: trigger the live export AND add a library entry ──
  async function handleGenerate(config: QuickReportConfig) {
    const template = REPORT_TEMPLATES.find(t => t.type === config.type)
    const payload = {
      id: `rpt_${Date.now()}`,
      name: `${template?.name ?? 'Custom Report'} — ${new Date().toLocaleDateString('en-AE', { day: '2-digit', month: 'short' })}`,
      type: config.type,
      format: config.format,
      size: '—',
      status: 'ready',
      period: config.period,
      parameters: [
        { label: 'Branch', value: config.branch },
        { label: 'Department', value: config.department },
        { label: 'Charts', value: config.includeCharts ? 'Included' : 'Excluded' },
      ],
      description: template?.description,
    }
    
    try {
      await fetch('/api/reports/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      fetchReports() // refresh from DB
      // Immediately trigger the real multi-format download/preview
      const url = `/api/reports/export?format=${config.format}&type=${config.type}&branch=${encodeURIComponent(config.branch)}&department=${encodeURIComponent(config.department)}&period=${config.period}`
      window.open(url, '_blank')
      pushToast('success', 'Report generated', `${payload.name} saved to library and downloading.`)
    } catch {
      pushToast('warning', 'Error', 'Failed to save report.')
    }
  }

  async function handleSchedule(config: QuickReportConfig, freq: ScheduleFreq) {
    const payload = {
      id: `sch_${Date.now()}`,
      name: `${REPORT_TEMPLATES.find(t => t.type === config.type)?.name ?? 'Custom'} (${freq})`,
      type: config.type,
      frequency: freq,
      nextRunAt: new Date(Date.now() + (freq === 'daily' ? 86400000 : freq === 'weekly' ? 7 * 86400000 : 30 * 86400000)).toISOString(),
      recipients: ['cx-director@adntc.ae'],
      format: config.format,
    }
    try {
      await fetch('/api/reports/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      fetchReports() // refresh from DB
      pushToast('success', 'Schedule created', `${payload.name} scheduled ${freq}.`)
    } catch {
      pushToast('warning', 'Error', 'Failed to create schedule.')
    }
  }

  async function handleSaveCustomReport(customConfig: any) {
    const typeMap: Record<string, string> = {
      trend: 'nps_trend',
      bar: 'branch_performance',
      pie: 'promoter_analysis',
      radar: 'department_performance',
      heatmap: 'executive_summary'
    }
    const tags: string[] = customConfig.tags ?? []
    const payload = {
      id: `rpt_${Date.now()}`,
      name: customConfig.name,
      type: typeMap[customConfig.chartType] || 'executive_summary',
      format: 'pdf',
      size: '—',
      status: 'ready',
      period: customConfig.period,
      parameters: [
        { label: 'Metric', value: customConfig.metric },
        { label: 'Group By', value: customConfig.groupBy },
        ...(tags.length > 0 ? [{ label: 'Tags', value: tags.join(', ') }] : []),
      ],
      description: `Custom report builder output grouped by ${customConfig.groupBy} tracking ${customConfig.metric}.`,
    }

    try {
      const res = await fetch('/api/reports/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        pushToast('warning', 'Error', err?.error || 'Failed to save custom report.')
        return
      }
      await fetchReports() // refresh library
      pushToast('success', 'Custom Report saved', `${payload.name} saved to library.`)
    } catch {
      pushToast('warning', 'Error', 'Failed to save custom report.')
    }
  }

  function handleExportCustomReport(customConfig: any) {
    const typeMap: Record<string, string> = {
      trend: 'nps_trend',
      bar: 'branch_performance',
      pie: 'promoter_analysis',
      radar: 'department_performance',
      heatmap: 'executive_summary'
    }
    const type = typeMap[customConfig.chartType] || 'executive_summary'
    const url = `/api/reports/export?format=pdf&type=${type}&period=${customConfig.period}&branch=All&department=All`
    window.open(url, '_blank')
    pushToast('success', 'Export started', `Opening printable ${customConfig.name} (PDF).`)
  }

  async function handleToggleSchedule(r: ScheduledReport) {
    const next = r.status === 'active' ? 'paused' : 'active'
    try {
      await fetch(`/api/reports/scheduled/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next })
      })
      setScheduledReports(prev => prev.map(s => s.id === r.id ? { ...s, status: next } : s))
      pushToast(next === 'active' ? 'success' : 'warning', next === 'active' ? 'Schedule resumed' : 'Schedule paused', `${r.name} is now ${next}.`)
    } catch {
      pushToast('warning', 'Error', 'Failed to update schedule.')
    }
  }

  function handleRunSchedule(r: ScheduledReport) {
    window.open(`/api/reports/export?format=csv&type=${r.type}`, '_blank')
    pushToast('info', 'Running now', `${r.name} triggered manually.`)
  }

  async function handleDeleteSchedule(r: ScheduledReport) {
    try {
      await fetch(`/api/reports/scheduled/${r.id}`, { method: 'DELETE' })
      setScheduledReports(prev => prev.filter(s => s.id !== r.id))
      pushToast('info', 'Schedule deleted', `${r.name} removed.`)
    } catch {
      pushToast('warning', 'Error', 'Failed to delete schedule.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 p-7"
    >
      {/* Header */}
      <ReportHeader
        totalReports={stats.totalReports}
        scheduledCount={stats.totalScheduled}
        onRefresh={() => {
          loadAllData()
          pushToast('info', 'Refreshing', 'Reports data is being refreshed...')
        }}
        onExport={() => {
          window.open('/api/reports/export?format=csv&type=executive', '_blank')
          pushToast('success', 'Export started', 'Executive report CSV is downloading.')
        }}
        onNew={() => {
          setActiveBuilderTab('custom')
          setTimeout(() => {
            const el = document.getElementById('report-generator-tools')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }, 50)
        }}
        onSchedule={() => {
          setActiveBuilderTab('quick')
          setTimeout(() => {
            const el = document.getElementById('report-generator-tools')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }, 50)
        }}
      />

      {/* KPI Cards */}
      <ReportStatsCards stats={stats} />

      {/* Charts row — Executive Panels (live data) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ExecutivePanel
          title="NPS Trend (12 months)"
          description="Monthly NPS score across all surveys"
          icon={<TrendingUp size={14} strokeWidth={2.2} />}
          accent="#0B4A8B"
          delay={0.05}
          className="lg:col-span-2"
        >
          <div className="min-h-[340px]">
            <NpsTrendChart data={npsTrendData} />
          </div>
        </ExecutivePanel>

        <ExecutivePanel
          title="Activity Heatmap"
          description="Response volume by day × hour"
          icon={<Grid3x3 size={14} strokeWidth={2.2} />}
          accent="#0B4A8B"
          delay={0.1}
        >
          <div className="min-h-[340px]">
            <ReportHeatmap data={heatmapData} />
          </div>
        </ExecutivePanel>
      </div>

      {/* Report library + scheduled */}
      <ReportLibrary
        savedReports={savedReports}
        scheduledReports={scheduledReports}
        onDownload={handleDownload}
        onRegenerate={handleRegenerate}
        onDelete={handleDelete}
        onPreview={r => setPreviewReport(r)}
        onToggleSchedule={handleToggleSchedule}
        onRunSchedule={handleRunSchedule}
        onDeleteSchedule={handleDeleteSchedule}
      />

      {/* Builder Tools (Tabs) */}
      <div id="report-generator-tools" className="flex flex-col gap-4">
        <div className="flex border-b border-[var(--border)]">
          <button
            onClick={() => setActiveBuilderTab('quick')}
            className={`px-4 py-2.5 text-[13px] font-bold transition-all border-b-2 ${activeBuilderTab === 'quick' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-light)]'}`}
          >
            Quick Report Generator
          </button>
          <button
            onClick={() => setActiveBuilderTab('custom')}
            className={`px-4 py-2.5 text-[13px] font-bold transition-all border-b-2 ${activeBuilderTab === 'custom' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-light)]'}`}
          >
            Custom Report Builder
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeBuilderTab === 'quick' ? (
            <motion.div
              key="quick"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              id="quick-report-generator"
            >
              <QuickReportGenerator onGenerate={handleGenerate} onSchedule={handleSchedule} savedReports={savedReports} />
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              id="custom-report-builder"
            >
              <CustomReportBuilder
                onSave={handleSaveCustomReport}
                onExport={handleExportCustomReport}
                onNotify={handleNotify}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview modal */}
      <ReportPreview
        report={previewReport}
        onClose={() => setPreviewReport(null)}
        onDownload={handleDownload}
        onRegenerate={handleRegenerate}
        npsTrendData={npsTrendData}
        branchPerfData={branchPerfData}
      />

      {/* Notification toasts */}
      <ToastStack toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />
    </motion.div>
  )
}
