'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { useToast } from '@/lib/stores/ToastStore'

interface Props {
  open: boolean
  onClose: () => void
  range: string
  branch: string
}

export function ExportModal({ open, onClose, range, branch }: Props) {
  const toast = useToast()
  const filtersRef = useRef<HTMLDivElement | null>(null)
  const [exporting, setExporting] = useState(false)
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv')
  const [reportType, setReportType] = useState<'executive' | 'responses' | 'surveys'>('executive')

  useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => {
        filtersRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
      })
    }
  }, [open])

  async function handleExport() {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        format,
        type: reportType,
        range,
        branch,
      })
      // Trigger download via the existing reports/export API
      window.open(`/api/reports/export?${params.toString()}`, '_blank')
      toast.success('Export started', `${reportType} report downloading as ${format.toUpperCase()} (${range}).`)
      onClose()
    } catch {
      toast.error('Export failed', 'Could not generate the report.')
    } finally {
      setExporting(false)
    }
  }

  const labelCls = 'block text-[10.5px] font-bold uppercase tracking-[0.08em] mb-1.5'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-[440px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px] bg-white"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px]" style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}>
                  <Download size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-[15px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>Export Dashboard</h2>
                  <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>Download filtered data as CSV</p>
                </div>
              </div>
              <button onClick={onClose} className="flex items-center justify-center text-center rounded-[8px] p-2 transition-all " style={{ color: 'var(--text-light)' }} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col gap-5">
                {/* Applied filters summary */}
                <div
                  ref={filtersRef}
                  className="rounded-[10px] border p-3"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
                >
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-light)' }}>Applied Filters</p>
                  <div className="flex flex-wrap gap-2.5">
                    <span className="rounded-[5px] bg-white px-2 py-0.5 text-[10.5px] font-medium" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      Period: {range}
                    </span>
                    <span className="rounded-[5px] bg-white px-2 py-0.5 text-[10.5px] font-medium" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      Branch: {branch === 'all' ? 'All Branches' : branch}
                    </span>
                  </div>
                </div>

                {/* Report type */}
                <div>
                  <label className={labelCls} style={{ color: 'var(--text-light)' }}>Report Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'executive', label: 'Executive Summary', icon: '📊' },
                      { value: 'responses', label: 'All Responses', icon: '💬' },
                      { value: 'surveys', label: 'Survey Performance', icon: '📋' },
                    ] as const).map(r => (
                      <button
                        key={r.value}
                        onClick={() => setReportType(r.value)}
                        className="flex items-center gap-2 rounded-[10px] border-2 px-3 py-2.5 text-left text-[11.5px] font-semibold transition-all"
                        style={reportType === r.value
                          ? { borderColor: 'var(--primary)', background: 'var(--accent-soft)', color: 'var(--primary)' }
                          : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                        }
                      >
                        <span>{r.icon}</span>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div>
                  <label className={labelCls} style={{ color: 'var(--text-light)' }}>Format</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormat('csv')}
                      className="flex flex-1 items-center gap-2 rounded-[10px] border-2 px-3 py-2.5 text-[12px] font-semibold transition-all"
                      style={format === 'csv'
                        ? { borderColor: 'var(--primary)', background: 'var(--accent-soft)', color: 'var(--primary)' }
                        : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                      }
                    >
                      <FileText size={14} />
                      CSV
                    </button>
                    <button
                      onClick={() => setFormat('pdf')}
                      className="flex flex-1 items-center gap-2 rounded-[10px] border-2 px-3 py-2.5 text-[12px] font-semibold transition-all"
                      style={format === 'pdf'
                        ? { borderColor: 'var(--primary)', background: 'var(--accent-soft)', color: 'var(--primary)' }
                        : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                      }
                    >
                      <FileText size={14} />
                      PDF
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
              <button onClick={onClose} className="flex items-center justify-center text-center rounded-[9px] border px-6 py-3 text-[12px] font-semibold transition-all" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center justify-center text-center gap-2.5 rounded-[9px] px-6 py-3 text-[12px] font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'var(--primary)' }}
              >
                {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                {exporting ? 'Exporting…' : 'Download'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
