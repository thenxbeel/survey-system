'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileJson, Check, AlertCircle } from 'lucide-react'
import { useSurveys } from '@/lib/stores/SurveysStore'
import { useToast }  from '@/lib/stores/ToastStore'
import { useSettings } from '@/lib/stores/SettingsStore'
import type { SurveyRecord } from '@/lib/types/survey'

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * ImportSurveyModal — upload a survey JSON file, validate it, and add it
 * to the SurveysStore so the survey list refreshes immediately.
 *
 * Validation rules (same shape as SurveyRecord):
 *   - must be valid JSON
 *   - must have a non-empty `title` string
 *   - must have a `touchpoint` string
 *   - must have a `branch` string
 *   - status (if present) must be one of: draft | active | closed | archived
 *   - visibility (if present) must be one of: public | private
 *
 * No backend / API is involved — this reuses the existing SurveysStore.
 */
export function ImportSurveyModal({ open, onClose }: Props) {
  const { addSurvey } = useSurveys()
  const toast = useToast()
  const { state: settingsState } = useSettings()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fileName, setFileName] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  if (!open) return null

  function reset() {
    setFileName(null)
    setFileContent(null)
    setError(null)
    setImporting(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setFileContent(String(reader.result ?? ''))
    }
    reader.onerror = () => {
      setError('Could not read the file. Please try again.')
    }
    reader.readAsText(file)
  }

  function validate(raw: string): { ok: true; record: SurveyRecord } | { ok: false; error: string } {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { ok: false, error: 'File is not valid JSON.' }
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { ok: false, error: 'JSON must be a single survey object.' }
    }
    const obj = parsed as Record<string, unknown>
    if (typeof obj.title !== 'string' || !obj.title.trim()) {
      return { ok: false, error: 'Survey "title" is required and must be a non-empty string.' }
    }
    if (typeof obj.touchpoint !== 'string' || !obj.touchpoint.trim()) {
      return { ok: false, error: 'Survey "touchpoint" is required and must be a string.' }
    }
    if (typeof obj.branch !== 'string' || !obj.branch.trim()) {
      return { ok: false, error: 'Survey "branch" is required and must be a string.' }
    }
    const validStatuses = ['draft', 'active', 'closed', 'archived']
    const status = (typeof obj.status === 'string' && validStatuses.includes(obj.status) ? obj.status : 'draft') as SurveyRecord['status']
    const validVis = ['public', 'private']
    const visibility = (typeof obj.visibility === 'string' && validVis.includes(obj.visibility) ? obj.visibility : 'public') as SurveyRecord['visibility']

    const now = new Date().toISOString()
    const record: SurveyRecord = {
      id:            `SRV-${Date.now().toString().slice(-6)}`,
      title:         String(obj.title),
      description:   typeof obj.description === 'string' ? obj.description : '',
      touchpoint:    String(obj.touchpoint),
      status,
      visibility,
      branch:        String(obj.branch),
      questionCount: typeof obj.questionCount === 'number' ? obj.questionCount : 0,
      responseCount: typeof obj.responseCount === 'number' ? obj.responseCount : 0,
      responseRate:  typeof obj.responseRate  === 'number' ? obj.responseRate  : 0,
      npsScore:      typeof obj.npsScore      === 'number' ? obj.npsScore      : null,
      createdBy:     typeof obj.createdBy     === 'string' ? obj.createdBy     : settingsState.profile.fullName,
      createdAt:     typeof obj.createdAt     === 'string' ? obj.createdAt     : now,
      updatedAt:     now,
      expiryDate:    typeof obj.expiryDate    === 'string' ? obj.expiryDate    : null,
    }
    return { ok: true, record }
  }

  function handleImport() {
    if (!fileContent) {
      setError('Please choose a JSON file first.')
      return
    }
    setImporting(true)
    setError(null)
    // Tiny delay so the spinner shows
    setTimeout(async () => {
      const result = validate(fileContent)
      if (!result.ok) {
        setError(result.error)
        setImporting(false)
        return
      }
      // POST to /api/surveys to persist in the database
      try {
        const res = await fetch('/api/surveys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: result.record.title,
            description: result.record.description || undefined,
            touchpoint: result.record.touchpoint,
            visibility: result.record.visibility === 'public' ? 'PUBLIC' : 'PRIVATE',
            isAnonymous: true,
            publish: false,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          setError(err?.error || `Failed to import (HTTP ${res.status})`)
          setImporting(false)
          return
        }
        toast.success('Survey imported', `"${result.record.title}" added to Survey Management.`)
        handleClose()
      } catch (e) {
        setError('Network error during import.')
        setImporting(false)
      }
    }, 400)
  }

  function handleDownloadTemplate() {
    const template = {
      title: 'Q3 Customer Experience',
      description: 'Quarterly pulse survey sent after any branch interaction.',
      touchpoint: 'Customer Support',
      branch: 'All Branches',
      status: 'draft',
      visibility: 'public',
      questionCount: 8,
    }
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'adntc-survey-template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={handleClose}
    >
      <div
        className="flex w-full max-w-[480px] flex-col overflow-hidden rounded-[18px] bg-white"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px]"
              style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}
            >
              <Upload size={15} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>
                Import Survey
              </h2>
              <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>
                Upload a survey JSON file to add it to Survey Management
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center text-center rounded-[8px] p-2 transition-all"
            style={{ color: 'var(--text-light)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 p-6">
          {/* Drop zone */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed py-8 transition-all"
            style={{
              borderColor: fileName ? 'var(--primary)' : 'var(--border)',
              background: fileName ? 'var(--accent-soft)' : 'transparent',
            }}
            onMouseEnter={(e) => { if (!fileName) e.currentTarget.style.borderColor = 'var(--border-strong)' }}
            onMouseLeave={(e) => { if (!fileName) e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <div
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px]"
              style={{ background: 'var(--bg-subtle)', color: fileName ? 'var(--primary)' : 'var(--text-light)' }}
            >
              {fileName ? <Check size={20} strokeWidth={2.2} /> : <FileJson size={20} strokeWidth={2} />}
            </div>
            <div className="text-center">
              <div className="text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>
                {fileName ?? 'Click to choose a JSON file'}
              </div>
              <div className="mt-0.5 text-[10.5px]" style={{ color: 'var(--text-light)' }}>
                {fileName ? 'Click to replace' : 'Accepts .json · max 1MB'}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFile}
              className="hidden"
            />
          </button>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-[10px] px-3 py-2.5"
              style={{ background: 'var(--tint-red)', border: '1px solid rgba(229,72,77,0.3)' }}
            >
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--red)' }} />
              <p className="text-[11.5px] font-medium" style={{ color: 'var(--red)' }}>{error}</p>
            </div>
          )}

          {/* Template download */}
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center justify-center text-center self-start text-[11px] font-semibold transition-opacity hover:opacity-80"
            style={{ color: 'var(--primary)' }}
          >
            ↓ Download JSON template
          </button>

          {/* Validation rules */}
          <div
            className="rounded-[10px] p-3"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <div className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-light)' }}>
              Required Fields
            </div>
            <ul className="flex flex-col gap-1 text-[10.5px]" style={{ color: 'var(--text-secondary)' }}>
              <li>• <code className="font-mono">title</code> — non-empty string</li>
              <li>• <code className="font-mono">touchpoint</code> — string</li>
              <li>• <code className="font-mono">branch</code> — string</li>
              <li>• Optional: <code className="font-mono">status</code>, <code className="font-mono">visibility</code>, <code className="font-mono">description</code></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={handleClose}
            className="inline-flex h-[36px] items-center rounded-[9px] border bg-white px-3 text-[11.5px] font-semibold transition-all items-center justify-center text-center"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!fileContent || importing}
            className="inline-flex h-[36px] items-center gap-2.5 rounded-[9px] px-3 text-[11.5px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 items-center justify-center text-center"
            style={{ background: 'var(--primary)' }}
          >
            {importing
              ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Importing…</>
              : <><Upload size={12} strokeWidth={2.2} /> Import Survey</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
