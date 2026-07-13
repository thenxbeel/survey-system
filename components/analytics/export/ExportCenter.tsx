'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  FileText, FileSpreadsheet, Image as ImageIcon, Mail, CheckCircle2, Loader2, X, Search,
} from 'lucide-react'
import { useAnalytics } from '../state/useAnalytics'

type ExportFormat = 'pdf' | 'csv' | 'png' | 'excel' | 'all'
type ExportStatus = 'idle' | 'exporting' | 'success'

const formats = [
  { id: 'pdf' as ExportFormat,      name: 'PDF Document',  desc: 'Comprehensive visual report with charts',  icon: FileText,       color: '#E5484D' },
  { id: 'excel' as ExportFormat,    name: 'Excel Report',  desc: 'Analytics charts and raw data',            icon: FileSpreadsheet,color: '#17A673' },
  { id: 'csv' as ExportFormat,      name: 'CSV Spreadsheet',desc: 'Raw response data (all columns)',          icon: FileSpreadsheet,color: '#17A673' },
  { id: 'png' as ExportFormat,      name: 'PNG Snapshot',  desc: 'Dashboard image (current view)',            icon: ImageIcon,     color: '#0B4A8B' },
  { id: 'all' as ExportFormat,      name: 'Export All',    desc: 'Download PDF, CSV, and PNG instantly',      icon: CheckCircle2,  color: '#F5A623' },
]

export function ExportCenter() {
  const { state, dispatch } = useAnalytics()
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [format,  setFormat]  = useState<ExportFormat | null>(null)
  const [search,  setSearch]  = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const open = state.modals.export
  if (!open || !mounted) return null

  function close() {
    dispatch({ type: 'CLOSE_MODAL', modal: 'export' })
    setTimeout(() => { setStatus('idle'); setFormat(null); setSearch('') }, 200)
  }

  async function handleExport(selectedFormat: ExportFormat) {
    if (selectedFormat === 'pdf') {
      close()
      setTimeout(() => window.print(), 300)
      return
    }

    setFormat(selectedFormat)
    setStatus('exporting')

    try {
      if (selectedFormat === 'csv' || selectedFormat === 'all') {
        const query = new URLSearchParams(state.filters as any)
        query.set('format', 'csv')
        query.set('type', 'responses')
        // Redirect to the actual backend CSV export route
        window.open(`/api/reports/export?${query.toString()}`, '_blank')
      }

      if (selectedFormat === 'excel') {
        // Close modal immediately so it's not captured
        close()
        await new Promise(r => setTimeout(r, 400))
        
        document.documentElement.classList.add('export-png-mode')
        await new Promise(r => setTimeout(r, 100))
        
        const html2canvas = (await import('html2canvas-pro')).default
        const target = document.querySelector('.desktop-sidebar-offset') || document.body
        const canvas = await html2canvas(target as HTMLElement, { useCORS: true, scale: 2 })
        
        document.documentElement.classList.remove('export-png-mode')
        
        const imgData = canvas.toDataURL('image/png')
        const ExcelJS = (await import('exceljs')).default
        const { saveAs } = await import('file-saver')
        
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Dashboard')
        
        const imageId = workbook.addImage({ base64: imgData, extension: 'png' })
        
        worksheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          ext: { width: canvas.width / 2, height: canvas.height / 2 }
        })
        
        try {
          const query = new URLSearchParams(state.filters as any)
          query.set('format', 'csv')
          query.set('type', 'responses')
          const res = await fetch(`/api/reports/export?${query.toString()}`)
          if (res.ok) {
            const csvText = await res.text()
            const dataSheet = workbook.addWorksheet('Raw Data')
            const rows = csvText.trim().split('\n').map(row => {
              const cells = []
              let inQuotes = false
              let currentCell = ''
              for (let i = 0; i < row.length; i++) {
                const char = row[i]
                if (char === '"' && row[i+1] === '"') { currentCell += '"'; i++ }
                else if (char === '"') { inQuotes = !inQuotes }
                else if (char === ',' && !inQuotes) { cells.push(currentCell); currentCell = '' }
                else { currentCell += char }
              }
              cells.push(currentCell)
              return cells
            })
            dataSheet.addRows(rows)
            
            // Format headers
            dataSheet.getRow(1).font = { bold: true }
          }
        } catch (e) {
          console.error('Failed to fetch raw data for Excel', e)
        }
        
        const buffer = await workbook.xlsx.writeBuffer()
        saveAs(new Blob([buffer]), `analytics_dashboard_${new Date().toISOString().slice(0,10)}.xlsx`)
        return
      }

      if (selectedFormat === 'png' || selectedFormat === 'all') {
        // Only close modal early if just PNG so it doesn't get captured in the screenshot
        if (selectedFormat === 'png') close()
        
        // Wait for modal to animate out
        await new Promise(r => setTimeout(r, 400))
        
        // Add class to expand layout to natural height
        document.documentElement.classList.add('export-png-mode')
        await new Promise(r => setTimeout(r, 100)) // Wait for repaint
        
        const html2canvas = (await import('html2canvas-pro')).default
        const target = document.querySelector('.desktop-sidebar-offset') || document.body
        const canvas = await html2canvas(target as HTMLElement, { useCORS: true, scale: 2 })
        
        // Remove layout expansion class
        document.documentElement.classList.remove('export-png-mode')
        
        const imgData = canvas.toDataURL('image/png')
        
        const link = document.createElement('a')
        link.download = `analytics_dashboard_${new Date().toISOString().slice(0,10)}.png`
        link.href = imgData
        link.click()
      }

      if (selectedFormat === 'all') {
        setTimeout(() => window.print(), 1000)
      } else if (selectedFormat !== 'png') {
        setStatus('success')
        setTimeout(close, 1300)
      }
    } catch (err) {
      console.error(err)
      setStatus('idle')
    }
  }

  const filteredFormats = formats.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.desc.toLowerCase().includes(search.toLowerCase())
  )

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[8vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-[440px] overflow-hidden rounded-[12px] border border-[#E6EDF3] bg-[#F5F7FA] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6EDF3] px-4 py-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[#333333]">Export Analytics</h2>
            <p className="text-[11px] text-[#8A94A6]">Choose format · current filters apply</p>
          </div>
          <button
            onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#8A94A6] transition-all hover:bg-[#F5F7FA] hover:text-[#333333]"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {status === 'idle' && (
          <>
            {/* Search */}
            <div className="border-b border-[#E6EDF3] p-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B8C4]" />
                <input
                  placeholder="Search export formats…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-9 w-full rounded-full border border-[#E6EDF3] bg-[#FFFFFF] pl-9 pr-3 text-[12px] text-[#333333] placeholder:text-[#B0B8C4] focus:border-[#0B4A8B] focus:outline-none"
                />
              </div>
            </div>

            {/* Formats */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              <p className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B0B8C4]">Formats</p>
              {filteredFormats.map(f => {
                const Icon = f.icon
                return (
                  <button
                    key={f.id}
                    onClick={() => handleExport(f.id)}
                    className="flex w-full items-center gap-3 rounded-[7px] px-2 py-2 text-left transition-all hover:bg-[#F5F7FA]"
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[6px]"
                      style={{ background: `${f.color}1A` }}
                    >
                      <Icon size={14} style={{ color: f.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-medium text-[#333333]">{f.name}</div>
                      <div className="truncate text-[11px] text-[#8A94A6]">{f.desc}</div>
                    </div>
                  </button>
                )
              })}
              {filteredFormats.length === 0 && (
                <div className="py-8 text-center text-[11px] text-[#B0B8C4]">No formats match "{search}"</div>
              )}
            </div>

            <div className="border-t border-[#E6EDF3] px-6 py-3 text-[10px] text-[#B0B8C4]">
              <kbd className="rounded-[3px] border border-[#E6EDF3] bg-[#F5F7FA] px-1 py-0.5 font-mono text-[9px] text-[#8A94A6]">Esc</kbd>{' '}
              to close
            </div>
          </>
        )}

        {(status === 'exporting' || status === 'success') && (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-8">
            {status === 'exporting' ? (
              <>
                <Loader2 size={36} className="animate-spin text-[#0B4A8B]" />
                <div className="text-center">
                  <p className="text-[13px] font-medium text-[#333333]">Generating {format?.toUpperCase()} file…</p>
                  <p className="mt-1 text-[11px] text-[#8A94A6]">Preparing your analytics data with current filters</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(23, 166, 115,0.12)]">
                  <CheckCircle2 size={28} className="text-[#17A673]" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-[#333333]">Export successful</p>
                  <p className="mt-1 text-[11px] text-[#8A94A6]">Your {format?.toUpperCase()} file download has started.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  , document.body)
}
