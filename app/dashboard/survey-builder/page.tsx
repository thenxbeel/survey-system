'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { QuestionType, SurveyDraft, SurveyQuestion } from '@/lib/builderTypes'
import { EMPTY_DRAFT } from '@/lib/builderTypes'
import BuilderToolbar from '@/components/builder/BuilderToolbar'
import SurveyInfoPanel from '@/components/builder/SurveyInfoPanel'
import QuestionList from '@/components/builder/QuestionList'
import PreviewPanel from '@/components/builder/PreviewPanel'
import TemplatesModal from '@/components/builder/TemplatesModal'
import type { SurveyTemplate } from '@/lib/survey-templates'

// Extended draft that carries the new availability + anonymity options
interface ExtendedDraft extends SurveyDraft {
  isAnonymous?: boolean
  availabilityMode?: 'always' | 'expires' | 'custom'
  expiresInDays?: number
  campaignId?: number
  distributionChannel?: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'QR_CODE' | 'DIRECT_LINK'
}

type LoadedSurveyQuestion = {
  id: string
  type: SurveyQuestion['type']
  question: string
  required: boolean
  options?: { id: string; value: string }[]
}

type LoadedSurvey = {
  numericId: number
  title?: string | null
  description?: string | null
  touchpoint?: string | null
  department?: string | null
  branch?: string | null
  visibility?: 'public' | 'private' | null
  expiryDate?: string | null
  expirationDate?: string | null
  requireContactInfo?: boolean | null
  isAnonymous?: boolean | null
  questions?: LoadedSurveyQuestion[] | null
}

const EXPIRY_PRESETS = [
  { label: 'Always Active', value: 'always' },
  { label: '1 Day', value: '1' },
  { label: '3 Days', value: '3' },
  { label: '7 Days', value: '7' },
  { label: '14 Days', value: '14' },
  { label: '30 Days', value: '30' },
  { label: '60 Days', value: '60' },
  { label: '90 Days', value: '90' },
]

export default function SurveyBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-[12px] text-[#8FA0B5]">Loading survey builder…</div>
      </div>
    }>
      <SurveyBuilderContent />
    </Suspense>
  )
}

function SurveyBuilderContent() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [draft, setDraft] = useState<ExtendedDraft>({ ...EMPTY_DRAFT, isAnonymous: false, availabilityMode: 'always' })
  const [showPreview, setShowPreview] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'questions' | 'availability'>('info')
  const [loadedSurveyId, setLoadedSurveyId] = useState<number | null>(null)
  const [loading, setLoading] = useState(() => Boolean(editId))
  const [templatesModalOpen, setTemplatesModalOpen] = useState(!editId)
  const createdIdRef = useRef<number | null>(null)

  const handleSelectTemplate = useCallback((template: SurveyTemplate) => {
    setDraft({
      title: template.title,
      description: template.description,
      touchpoint: template.touchpoint,
      department: '',
      branch: 'All Branches',
      visibility: 'public',
      expiryDate: '',
      requireContactInfo: false,
      isAnonymous: false,
      availabilityMode: 'always',
      questions: template.questions.map((q, idx) => ({
        id: `q_temp_${idx}_${Date.now()}`,
        type: q.type as QuestionType,
        title: q.title,
        helpText: '',
        required: q.required,
        options: (q.options ?? []).map((opt, optIdx) => ({
          id: `opt_temp_${idx}_${optIdx}_${Date.now()}`,
          label: opt,
        })),
      })),
    })
    setTemplatesModalOpen(false)
    // Switch to questions tab to showcase the populated questions
    setActiveTab('questions')
  }, [])

  // ── Load existing survey when ?edit=<id> is present ──
  useEffect(() => {
    if (!editId) return
    fetch(`/api/surveys/${editId}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const s = json.data as LoadedSurvey
        setLoadedSurveyId(s.numericId)
        // Map the DB survey back into a SurveyDraft
        setDraft({
          title: s.title ?? '',
          description: s.description ?? '',
          touchpoint: s.touchpoint ?? '',
          department: s.department ?? '',
          branch: s.branch ?? 'All Branches',
          visibility: s.visibility === 'public' ? 'public' : 'private',
          expiryDate: s.expiryDate ? s.expiryDate.split('T')[0] : '',
          requireContactInfo: s.requireContactInfo ?? false,
          isAnonymous: s.isAnonymous ?? false,
          availabilityMode: s.expirationDate ? 'custom' : 'always',
          questions: (s.questions ?? []).map((q) => ({
            id: `q_${q.id}`,
            type: q.type,
            title: q.question,
            helpText: '',
            required: q.required,
            options: (q.options ?? []).map((o) => ({ id: `opt_${o.id}`, label: o.value })),
          })),
        })
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [editId])

  function updateDraft(patch: Partial<ExtendedDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  // ── Save as draft (creates or updates without publishing) ──
  const handleSaveDraft = useCallback(async (): Promise<string | null> => {
    if (!draft.title.trim()) return 'Please enter a survey title.'
    if (!draft.touchpoint) return 'Please select a touchpoint.'
    if (draft.questions.length === 0) return 'Please add at least one question.'

    const payload = buildPayload(draft, false)

    try {
      if (loadedSurveyId) {
        // Update existing survey
        const res = await fetch(`/api/surveys/${loadedSurveyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const json = await res.json().catch(() => null)
          return json?.error || 'Failed to save draft.'
        }
        createdIdRef.current = loadedSurveyId
      } else {
        // Create new survey (draft)
        const res = await fetch('/api/surveys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const json = await res.json().catch(() => null)
          return json?.error || 'Failed to save draft.'
        }
        const json = await res.json()
        createdIdRef.current = json.data.id
        setLoadedSurveyId(json.data.id)
      }
      return null
    } catch {
      return 'Network error. Please try again.'
    }
  }, [draft, loadedSurveyId])

  // ── Publish (creates URL + QR + transitions to ACTIVE) ──
  // Returns: error string on failure, or the numeric survey ID on success.
  const handlePublish = useCallback(async (): Promise<string | number | null> => {
    if (!draft.title.trim()) return 'Please enter a survey title.'
    if (!draft.touchpoint) return 'Please select a touchpoint.'
    if (draft.questions.length === 0) return 'Please add at least one question.'

    const payload = buildPayload(draft, true)

    try {
      if (loadedSurveyId) {
        // Update + publish existing survey via PATCH ?action=publish
        const putRes = await fetch(`/api/surveys/${loadedSurveyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, lifecycleStatus: 'ACTIVE', status: 'published' }),
        })
        if (!putRes.ok) {
          const json = await putRes.json().catch(() => null)
          return json?.error || 'Failed to update survey before publish.'
        }

        const pubRes = await fetch(`/api/surveys/${loadedSurveyId}?action=publish`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            availabilityMode: payload.availabilityMode,
            expiresInDays: payload.expiresInDays,
            expirationDate: payload.expiryDate,
            distributionChannel: payload.distributionChannel,
            regenerateUrl: false,
            regenerateQr: true,
          }),
        })
        if (!pubRes.ok) {
          const json = await pubRes.json().catch(() => null)
          return json?.error || 'Failed to publish survey.'
        }
        return loadedSurveyId
      } else {
        // Create + publish in one call
        const res = await fetch('/api/surveys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const json = await res.json().catch(() => null)
          return json?.error || 'Failed to publish survey.'
        }
        const json = await res.json()
        const newId = json.data.id
        createdIdRef.current = newId
        setLoadedSurveyId(newId)
        return newId
      }
    } catch {
      return 'Network error. Please try again.'
    }
  }, [draft, loadedSurveyId])

  // Fallback redirect path (used only if onPublish doesn't return a numeric ID)
  const publishRedirectPath = '/dashboard/surveys'

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-[12px] text-[#8FA0B5]">Loading survey…</div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: 'calc(100vh - 60px)' }}
    >
      <BuilderToolbar
        draft={draft}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((v) => !v)}
        onSaveDraft={handleSaveDraft}
        onPublish={async () => {
          const result = await handlePublish()
          // Pass through: error string → toolbar shows error toast;
          // numeric ID → toolbar redirects to /dashboard/surveys/${id}/published
          return result
        }}
        publishRedirectPath={publishRedirectPath}
        onOpenTemplates={() => setTemplatesModalOpen(true)}
      />

      {/* Body */}
      <div className="flex flex-1 flex-col min-h-0 lg:flex-row">
        {/* ── Left: Editor ── */}
        <div className="flex w-full flex-col overflow-y-auto border-b border-[#E6EDF3] bg-white lg:w-[55%] lg:border-b-0 lg:border-r">

          {/* Tab bar */}
          <div className="flex border-b border-[#E6EDF3] px-6 py-4 gap-2">
            {(['info', 'questions', 'availability'] as const).map((tab) => {
              const active = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold transition-all ${
                    active
                      ? 'bg-[#EFF6FF] text-[#0B4A8B]'
                      : 'bg-transparent text-[#6B7A90] hover:bg-[#F4F7FB]'
                  }`}
                >
                  <span className="flex items-center justify-center text-[14px]">
                    {tab === 'info' ? '📋' : tab === 'questions' ? '❓' : '⚙️'}
                  </span>
                  <span>
                    {tab === 'info' ? 'Survey Info' : tab === 'questions' ? `Questions (${draft.questions.length})` : 'Availability'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {activeTab === 'info' ? (
              <SurveyInfoPanel draft={draft} onChange={updateDraft} />
            ) : activeTab === 'questions' ? (
              <QuestionList
                questions={draft.questions}
                onChange={(questions) => updateDraft({ questions })}
              />
            ) : (
              <AvailabilityPanel draft={draft} onChange={updateDraft} />
            )}
          </div>

          {/* Progress footer */}
          <div className="flex-shrink-0 border-t border-[#E6EDF3] px-6 py-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#8A94A6] uppercase tracking-wider">Completion</span>
              <span className="font-mono text-[12px] font-medium text-[#0B4A8B]">
                {draft.questions.length} question{draft.questions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Title set',          done: Boolean(draft.title.trim()) },
                { label: 'Touchpoint chosen',  done: Boolean(draft.touchpoint) },
                { label: 'Has questions',      done: draft.questions.length > 0 },
                { label: 'All questions titled',done: draft.questions.length > 0 && draft.questions.every((q) => q.title.trim()) },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${done ? 'bg-[#17A673]' : 'bg-[#E2E8F3]'}`} />
                  <span className={`text-[11.5px] font-medium ${done ? 'text-[#17A673]' : 'text-[#8A94A6]'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Preview ── */}
        {showPreview && (
          <div className="flex flex-1 flex-col overflow-y-auto bg-[#F5F7FA] px-8 py-6">
            <PreviewPanel draft={draft} />
          </div>
        )}

        {/* ── No preview: empty state ── */}
        {!showPreview && (
          <div className="flex flex-1 items-center justify-center bg-[#F5F7FA]">
            <div className="text-center">
              <div className="mb-2 text-3xl opacity-20">👁</div>
              <div className="text-[12px] text-[#B0B8C4]">Preview hidden — click Preview to show</div>
            </div>
          </div>
        )}
      </div>

      <TemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  )
}

// ─── Availability panel (anonymous + expiration + distribution channel) ──

function AvailabilityPanel({
  draft, onChange,
}: {
  draft: ExtendedDraft
  onChange: (patch: Partial<ExtendedDraft>) => void
}) {
  const sectionHeaderCls = 'text-[10.5px] font-bold uppercase tracking-widest text-[#0D1B2E] mb-3 mt-6 first:mt-0'
  const labelCls = 'block text-[11px] font-bold text-[#333333] mb-1.5'

  return (
    <div className="flex flex-col">
      {/* RESPONSE MODE */}
      <h3 className={sectionHeaderCls}>Response Mode</h3>
      <div className="mb-2">
        <label className={labelCls}>Identity Collection</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ isAnonymous: false })}
            className="flex-1 rounded-[8px] border py-2 text-[12px] font-semibold transition-all"
            style={!draft.isAnonymous
              ? { borderColor: '#EFF6FF', background: '#EFF6FF', color: '#0B4A8B' }
              : { borderColor: '#E6EDF3', background: 'transparent', color: '#6B7A90' }}
          >
            👤 Identified
          </button>
          <button
            type="button"
            onClick={() => onChange({ isAnonymous: true })}
            className="flex-1 rounded-[8px] border py-2 text-[12px] font-semibold transition-all"
            style={draft.isAnonymous
              ? { borderColor: '#EFF6FF', background: '#EFF6FF', color: '#0B4A8B' }
              : { borderColor: '#E6EDF3', background: 'transparent', color: '#6B7A90' }}
          >
            🕶️ Anonymous
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[#8FA0B5]">
          {draft.isAnonymous
            ? 'Responses will not be linked to any customer profile. No PII collected unless the survey explicitly asks.'
            : 'Responses will be linked to existing or new customer profiles via email / phone / policy number.'}
        </p>
      </div>

      {/* REQUIRE CONTACT INFO — only visible for identified surveys */}
      {!draft.isAnonymous && (
        <div className="mb-2">
          <label className={labelCls}>Contact Info</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ requireContactInfo: true })}
              className="flex-1 rounded-[8px] border py-2 text-[12px] font-semibold transition-all"
              style={draft.requireContactInfo
                ? { borderColor: '#EFF6FF', background: '#EFF6FF', color: '#0B4A8B' }
                : { borderColor: '#E6EDF3', background: 'transparent', color: '#6B7A90' }}
            >
              ✅ Required
            </button>
            <button
              type="button"
              onClick={() => onChange({ requireContactInfo: false })}
              className="flex-1 rounded-[8px] border py-2 text-[12px] font-semibold transition-all"
              style={!draft.requireContactInfo
                ? { borderColor: '#EFF6FF', background: '#EFF6FF', color: '#0B4A8B' }
                : { borderColor: '#E6EDF3', background: 'transparent', color: '#6B7A90' }}
            >
              ⬜ Optional
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#8FA0B5]">
            {draft.requireContactInfo
              ? 'Respondents must provide at least one contact method (email or phone) to submit.'
              : 'Contact details are optional — respondents can submit without providing them.'}
          </p>
        </div>
      )}

      {/* AVAILABILITY SCHEDULE */}
      <h3 className={sectionHeaderCls}>Availability Schedule</h3>
      <div className="mb-2">
        <label className={labelCls}>Duration</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EXPIRY_PRESETS.map(preset => {
            const isActive =
              preset.value === 'always'
                ? draft.availabilityMode === 'always'
                : draft.availabilityMode === 'expires' && String(draft.expiresInDays) === preset.value
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange({
                  availabilityMode: preset.value === 'always' ? 'always' : 'expires',
                  expiresInDays: preset.value === 'always' ? undefined : parseInt(preset.value, 10),
                  expiryDate: '',
                })}
                className="rounded-[8px] border py-2 text-[11px] font-semibold transition-all"
                style={isActive
                  ? { borderColor: '#EFF6FF', background: '#EFF6FF', color: '#0B4A8B' }
                  : { borderColor: '#E6EDF3', background: 'transparent', color: '#6B7A90' }}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-2">
        <label className={labelCls}>Custom Expiration Date (Optional)</label>
        <input
          type="datetime-local"
          value={draft.expiryDate || ''}
          onChange={(e) => onChange({
            expiryDate: e.target.value,
            availabilityMode: e.target.value ? 'custom' : 'always',
            expiresInDays: undefined,
          })}
          className="w-full rounded-[8px] border border-[#E6EDF3] bg-white px-3 py-2 text-[12.5px] font-medium text-[#333333] outline-none transition-all focus:border-[#0B4A8B] focus:ring-2 focus:ring-[#0B4A8B]/10"
        />
      </div>

      {/* DISTRIBUTION */}
      <h3 className={sectionHeaderCls}>Distribution</h3>
      <div>
        <label className={labelCls}>Primary Channel</label>
        <select
          value={draft.distributionChannel ?? 'DIRECT_LINK'}
          onChange={(e) => onChange({ distributionChannel: e.target.value as ExtendedDraft['distributionChannel'] })}
          className="w-full cursor-pointer rounded-[8px] border border-[#E6EDF3] bg-white px-3 py-2 text-[12.5px] font-medium text-[#333333] outline-none transition-all focus:border-[#0B4A8B] focus:ring-2 focus:ring-[#0B4A8B]/10"
        >
          <option value="DIRECT_LINK">Direct Link</option>
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="QR_CODE">QR Code</option>
        </select>
        <p className="mt-2 text-[11px] leading-relaxed text-[#8FA0B5]">
          Used as the default channel for response attribution. Can be overridden per-share link.
        </p>
      </div>
      
      <div className="mt-8"></div>
    </div>
  )
}

// ─── Payload builder ────────────────────────────────────────────────────────

function buildPayload(draft: ExtendedDraft, publish: boolean) {
  // Determine the expiration date based on availability mode
  let expirationDate: string | undefined
  if (draft.availabilityMode === 'expires' && draft.expiresInDays) {
    const d = new Date(Date.now() + draft.expiresInDays * 86400000)
    expirationDate = d.toISOString()
  } else if (draft.availabilityMode === 'custom' && draft.expiryDate) {
    // Treat the date-only input as end-of-day
    expirationDate = new Date(draft.expiryDate + (draft.expiryDate.includes('T') ? '' : 'T23:59:59')).toISOString()
  }

  return {
    title: draft.title.trim(),
    description: draft.description.trim() || undefined,
    touchpoint: draft.touchpoint,
    department: draft.department || undefined,
    branch: draft.branch === 'All Branches' ? undefined : (draft.branch || undefined),
    visibility: draft.visibility === 'public' ? 'PUBLIC' : 'PRIVATE',
    expiryDate: expirationDate,
    requireContactInfo: draft.requireContactInfo ?? false,
    isAnonymous: draft.isAnonymous ?? false,
    availabilityMode: draft.availabilityMode ?? 'always',
    expiresInDays: draft.expiresInDays,
    distributionChannel: draft.distributionChannel ?? 'DIRECT_LINK',
    publish,
    questions: draft.questions.map((q, i) => ({
      question: q.title,
      type: q.type,
      required: q.required,
      displayOrder: i,
      options: q.options.length > 0 ? q.options.map(o => ({ value: o.label })) : undefined,
    })),
  }
}
