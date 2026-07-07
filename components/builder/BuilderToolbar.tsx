'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Send, ChevronLeft, CheckCircle, AlertCircle, Loader2, LayoutTemplate } from 'lucide-react'
import Button from '@/components/common/Button'
import type { SurveyDraft } from '@/lib/builderTypes'

interface Props {
  draft: SurveyDraft
  showPreview: boolean
  onTogglePreview: () => void
  /** Called when the user clicks Save Draft. Returns an error string OR null.
   *  May be async — the toolbar awaits it before showing the toast. */
  onSaveDraft: () => string | null | Promise<string | null>
  /** Called when the user clicks Publish. Returns an error string OR the
   *  numeric survey ID on success. May be async. */
  onPublish:    () => string | number | null | Promise<string | number | null>
  /** Path to redirect to after a successful publish. Defaults to /dashboard/surveys.
   *  If onPublish returns a number (survey ID), the redirect path is built dynamically
   *  as /dashboard/surveys/${id}/published. */
  publishRedirectPath?: string
  onOpenTemplates?: () => void
}

type ToastType = 'success' | 'error'

export default function BuilderToolbar({
  draft, showPreview, onTogglePreview, onSaveDraft, onPublish,
  publishRedirectPath = '/dashboard/surveys',
  onOpenTemplates,
}: Props) {
  const router = useRouter()
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  function showToast(msg: string, type: ToastType = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSaveDraft() {
    setSaving(true)
    try {
      const err = await onSaveDraft()
      if (err) { showToast(err, 'error'); return }
      showToast('Draft saved successfully.')
    } catch {
      showToast('Failed to save draft.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    setPublishing(true)
    try {
      const result = await onPublish()
      if (typeof result === 'string') { showToast(result, 'error'); return }
      showToast('Survey published! Redirecting…')
      // If onPublish returned a numeric survey ID, redirect to the published page
      // with that ID. Otherwise fall back to the static publishRedirectPath.
      const redirectPath = typeof result === 'number'
        ? `/dashboard/surveys/${result}/published`
        : publishRedirectPath
      setTimeout(() => router.push(redirectPath), 1000)
    } catch {
      showToast('Failed to publish survey.', 'error')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <>
      <div
        className="flex h-auto min-h-[56px] flex-shrink-0 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        style={{
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/surveys')}
            className="flex flex-shrink-0 items-center gap-2.5 rounded-[8px] px-4 py-2.5 text-[12px] font-semibold transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <ChevronLeft size={14} />
            <span className="hidden sm:inline">Surveys</span>
          </button>
          <div className="hidden h-4 w-px sm:block" style={{ background: 'var(--border)' }} />
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="max-w-[160px] truncate text-[13.5px] font-bold sm:max-w-[260px]"
              style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
              title={draft.title || 'Untitled Survey'}
            >
              {draft.title || 'Untitled Survey'}
            </span>
            <span
              className="flex-shrink-0 rounded-[5px] border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]"
              style={{
                background: 'var(--bg-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-light)',
              }}
            >
              Draft
            </span>
          </div>
        </div>

        {/* Right — buttons wrap on mobile, icons-only on very small screens */}
        <div className="flex items-center gap-2">
          {onOpenTemplates && (
            <Button
              variant="ghost"
              onClick={onOpenTemplates}
              size="sm"
              disabled={saving || publishing}
              className="button-full-mobile !flex-1 sm:!flex-none"
              style={{ color: '#6B7A90', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <LayoutTemplate size={12} />
              <span className="hidden sm:inline">Templates</span>
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleSaveDraft}
            size="sm"
            disabled={saving || publishing}
            className="button-full-mobile !flex-1 sm:!flex-none"
            style={{ color: '#6B7A90', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            <span className="hidden sm:inline">{saving ? 'Saving…' : 'Save Draft'}</span>
          </Button>
          <Button
            variant="ghost"
            onClick={onTogglePreview}
            size="sm"
            disabled={publishing}
            className="button-full-mobile !flex-1 sm:!flex-none"
            style={{ color: '#6B7A90', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Eye size={12} />
            <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Preview'}</span>
          </Button>
          <Button
            variant="primary"
            onClick={handlePublish}
            size="sm"
            disabled={saving || publishing}
            className="button-full-mobile !flex-1 sm:!flex-none !border-none transition-all hover:opacity-90"
            style={{ background: '#0B4A8B', color: 'white', boxShadow: '0 4px 12px rgba(11,74,139,0.2)', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {publishing ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {publishing ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 rounded-[10px] border px-4 py-3 text-[13px] font-semibold shadow-xl animate-fade-up ${
            toast.type === 'success'
              ? ''
              : ''
          }`}
          style={{
            background: toast.type === 'success' ? 'var(--tint-emerald)' : 'var(--tint-red)',
            borderColor: toast.type === 'success' ? 'rgba(23,166,115,0.35)' : 'rgba(229,72,77,0.35)',
            color: toast.type === 'success' ? 'var(--emerald)' : 'var(--red)',
          }}
        >
          {toast.type === 'success'
            ? <CheckCircle size={15} />
            : <AlertCircle size={15} />
          }
          {toast.msg}
        </div>
      )}
    </>
  )
}
