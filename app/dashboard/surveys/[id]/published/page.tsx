'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Copy, Download, ExternalLink, Mail, MessageSquare,
  Share2, RefreshCw, Clock, Power, PowerOff, Pencil, BarChart3,
  CheckCircle2, AlertTriangle, QrCode, Loader2, History, User,
  Calendar, Hash, Activity,
} from 'lucide-react'
import { useToast } from '@/lib/stores/ToastStore'

// ─── Types ──────────────────────────────────────────────────────────────────

interface SurveyDetail {
  numericId: number
  id: string
  title: string
  description: string | null
  touchpoint: string
  category: string | null
  status: string
  lifecycleStatus: string
  visibility: string
  isAnonymous: boolean
  questionCount: number
  responseCount: number
  npsScore: number | null
  npsResponseCount: number
  lastResponseAt: string | null
  createdById: number
  createdByName: string
  createdByEmail: string
  createdByEmployeeId: string
  createdByDepartment: string | null
  createdByRole: string | null
  lastModifiedById: number | null
  lastModifiedByName: string | null
  slug: string | null
  publicUrl: string | null
  qrCode: string | null
  surveyCode: string | null
  activationDate: string | null
  expirationDate: string | null
  closedAt: string | null
  remainingMs: number | null
  campaign: { id: number; name: string; channel: string } | null
  createdAt: string
  updatedAt: string
}

interface AuditLogEntry {
  id: number
  action: string
  details: string | null
  actor: { id: number; name: string; email: string } | null
  createdAt: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatRemaining(ms: number | null): string {
  if (ms === null) return 'No expiration'
  if (ms <= 0) return 'Expired'
  const seconds = Math.floor(ms / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const LIFECYCLE_LABELS: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  active: 'Active',
  expired: 'Expired',
  closed: 'Closed',
  archived: 'Archived',
}

const LIFECYCLE_COLORS: Record<string, string> = {
  draft: 'bg-[#EBF0F7] text-[#4A5568] border-[#C8D4E3]',
  scheduled: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  active: 'bg-[#ECFDF5] text-[#17A673] border-[#A7F3D0]',
  expired: 'bg-[#FEF2F2] text-[#E5484D] border-[#FECACA]',
  closed: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
  archived: 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]',
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SurveyPublishedPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const toast = useToast()
  const id = params.id

  const [survey, setSurvey] = useState<SurveyDetail | null>(null)
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchSurvey = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, aRes] = await Promise.all([
        fetch(`/api/surveys/${id}`, { cache: 'no-store' }),
        fetch(`/api/surveys/${id}/audit-log?pageSize=20`, { cache: 'no-store' }),
      ])
      if (sRes.ok) {
        const json = await sRes.json()
        setSurvey(json.data)
      }
      if (aRes.ok) {
        const json = await aRes.json()
        setAuditLog(json.data || [])
      }
    } catch {
      toast.error('Failed to load survey', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => { fetchSurvey() }, [fetchSurvey])

  // Re-derive remaining time every 30s
  const [, setTick] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(i)
  }, [])

  const remainingMs = useMemo(() => {
    if (!survey?.expirationDate) return null
    const diff = new Date(survey.expirationDate).getTime() - Date.now()
    return diff > 0 ? diff : 0
  }, [survey?.expirationDate])

  // ── Actions ──

  async function copyUrl() {
    if (!survey?.publicUrl) return
    try {
      await navigator.clipboard.writeText(survey.publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('URL copied', 'Survey link is in your clipboard.')
      // Record share audit
      fetch(`/api/surveys/${id}?action=share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'DIRECT_LINK' }),
      })
    } catch {
      toast.error('Copy failed', 'Please copy the URL manually.')
    }
  }

  function openSurvey() {
    if (!survey?.publicUrl) return
    window.open(survey.publicUrl, '_blank', 'noopener,noreferrer')
  }

  function downloadQr() {
    if (!survey?.qrCode) {
      toast.error('No QR code', 'Generate one first.')
      return
    }
    const link = document.createElement('a')
    link.href = survey.qrCode
    link.download = `qr-${survey.surveyCode || survey.slug}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR downloaded', 'PNG file saved.')
  }

  function copyQrImage() {
    if (!survey?.qrCode) return
    // Copy QR data URL to clipboard as text (most browsers can't copy image data directly without Permissions API)
    navigator.clipboard.writeText(survey.qrCode).then(() => {
      toast.success('QR copied', 'QR data URL is in your clipboard.')
    }).catch(() => {
      toast.error('Copy failed', 'Could not copy QR code.')
    })
  }

  function shareViaEmail() {
    if (!survey?.publicUrl) return
    const subject = encodeURIComponent(`Your feedback is requested: ${survey.title}`)
    const body = encodeURIComponent(
      `You've been invited to share your feedback: "${survey.title}".\n\nPlease take 2 minutes to complete this short survey:\n${survey.publicUrl}\n\nThank you — your input helps us improve.`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    fetch(`/api/surveys/${id}?action=share`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'EMAIL' }),
    })
  }

  function shareViaSms() {
    if (!survey?.publicUrl) return
    const body = encodeURIComponent(`You've been invited to share your feedback: "${survey.title}". ${survey.publicUrl}`)
    window.location.href = `sms:?&body=${body}`
    fetch(`/api/surveys/${id}?action=share`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'SMS' }),
    })
  }

  function shareViaWhatsapp() {
    if (!survey?.publicUrl) return
    const text = encodeURIComponent(`You've been invited to share your feedback: "${survey.title}". ${survey.publicUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
    fetch(`/api/surveys/${id}?action=share`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'WHATSAPP' }),
    })
  }

  async function regenerateQr() {
    setActionLoading('qr')
    try {
      const res = await fetch(`/api/surveys/${id}?action=regenerate-qr`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('QR regenerated', 'A new QR code has been generated.')
        await fetchSurvey()
      } else {
        toast.error('Failed', 'Could not regenerate QR code.')
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function deactivate() {
    if (!confirm('Deactivate this survey? Customers will see the "no longer accepting responses" message.')) return
    setActionLoading('deactivate')
    try {
      const res = await fetch(`/api/surveys/${id}?action=deactivate`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Survey deactivated', 'The survey is now closed to new responses.')
        await fetchSurvey()
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function reactivate() {
    if (!confirm('Reactivate this survey? Customers will be able to submit responses again.')) return
    setActionLoading('reactivate')
    try {
      const res = await fetch(`/api/surveys/${id}?action=reactivate`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Survey reactivated', 'The survey is now accepting responses.')
        await fetchSurvey()
      }
    } finally {
      setActionLoading(null)
    }
  }

  // ── Render ──

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0B4A8B]" />
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-[#E5484D]" />
        <h1 className="mb-2 text-[18px] font-bold">Survey not found</h1>
        <Link href="/dashboard/surveys" className="text-[12.5px] font-semibold text-[#0B4A8B]">
          ← Back to Surveys
        </Link>
      </div>
    )
  }

  const isActive = survey.lifecycleStatus === 'active'
  const isExpired = survey.lifecycleStatus === 'expired'
  const isClosed = survey.lifecycleStatus === 'closed'
  const isDraft = survey.lifecycleStatus === 'draft'

  return (
    <div className="flex flex-col gap-6 p-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-2.5 text-[11.5px] font-medium text-[#8FA0B5] transition-colors hover:text-[#0D1B2E]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#8FA0B5]">{survey.id}</span>
            {survey.surveyCode && (
              <span className="rounded-[5px] bg-[#EBF0F7] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#0B4A8B]">
                {survey.surveyCode}
              </span>
            )}
            <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${LIFECYCLE_COLORS[survey.lifecycleStatus]}`}>
              {LIFECYCLE_LABELS[survey.lifecycleStatus] ?? survey.lifecycleStatus}
            </span>
          </div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#0D1B2E]">{survey.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/survey-builder?edit=${survey.id}`}
            className="flex items-center gap-2.5 rounded-[10px] border border-[#E2E8F3] px-3 py-2 text-[12px] font-medium text-[#4A5568] transition-colors hover:bg-[#F8FAFD]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <Link
            href={`/dashboard/responses?surveyId=${survey.id}`}
            className="flex items-center gap-2.5 rounded-[10px] bg-[#0B4A8B] px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#06386F]"
            style={{ color: '#FFFFFF' }}
          >
            <BarChart3 className="h-3.5 w-3.5" color="#FFFFFF" />
            View Responses
          </Link>
        </div>
      </div>

      {/* Success banner */}
      {!isDraft && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-[14px] border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3"
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#17A673]" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[#0F6866]">Survey Created Successfully</p>
            <p className="text-[11.5px] text-[#0F6866]/80">
              Your survey is now {isActive ? 'accepting responses' : isExpired ? 'expired' : isClosed ? 'closed' : 'published'}.
              Share the link or QR code below to start collecting feedback.
            </p>
          </div>
        </motion.div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: URL + QR */}
        <div className="lg:col-span-2">
          <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-[13px] font-bold uppercase tracking-wide text-[#4A5568]">
              Distribution
            </h2>

            {/* Public URL */}
            <div className="mb-5">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#8FA0B5]">
                Public Survey URL
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  readOnly
                  value={survey.publicUrl ?? '—'}
                  className="flex-1 rounded-[10px] border border-[#E2E8F3] bg-[#F8FAFD] px-3 py-2.5 font-mono text-[12px] text-[#0D1B2E] outline-none"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={copyUrl}
                  disabled={!survey.publicUrl}
                  className="flex items-center gap-2.5 rounded-[10px] border border-[#E2E8F3] bg-white px-3 py-2.5 text-[12px] font-semibold text-[#0B4A8B] transition-colors hover:bg-[#EFF6FF] disabled:opacity-50 items-center justify-center text-center"
                >
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-[#17A673]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={openSurvey}
                  disabled={!survey.publicUrl}
                  className="flex items-center gap-2.5 rounded-[10px] bg-[#0B4A8B] px-3 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#06386F] disabled:opacity-50 items-center justify-center text-center"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px,1fr]">
              <div className="flex flex-col items-center">
                <div className="mb-2 rounded-[12px] border border-[#E2E8F3] bg-white p-3">
                  {survey.qrCode ? (
                    <img src={survey.qrCode} alt="QR Code" className="h-[150px] w-[150px]" />
                  ) : (
                    <div className="flex h-[150px] w-[150px] items-center justify-center text-[#B0BDCC]">
                      <QrCode className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <span className="font-mono text-[10px] text-[#8FA0B5]">
                  {survey.surveyCode ?? '—'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={downloadQr}
                  disabled={!survey.qrCode}
                  className="flex items-center gap-2 rounded-[10px] border border-[#E2E8F3] bg-white px-3 py-2 text-[12px] font-medium text-[#4A5568] transition-colors hover:bg-[#F8FAFD] disabled:opacity-50 items-center justify-center text-center"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download QR
                </button>
                <button
                  onClick={copyQrImage}
                  disabled={!survey.qrCode}
                  className="flex items-center gap-2 rounded-[10px] border border-[#E2E8F3] bg-white px-3 py-2 text-[12px] font-medium text-[#4A5568] transition-colors hover:bg-[#F8FAFD] disabled:opacity-50 items-center justify-center text-center"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy QR Image
                </button>
                <button
                  onClick={regenerateQr}
                  disabled={actionLoading === 'qr'}
                  className="flex items-center gap-2 rounded-[10px] border border-[#E2E8F3] bg-white px-3 py-2 text-[12px] font-medium text-[#4A5568] transition-colors hover:bg-[#F8FAFD] disabled:opacity-50 items-center justify-center text-center"
                >
                  {actionLoading === 'qr' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Regenerate QR
                </button>
              </div>
            </div>

            {/* Share actions */}
            <div className="mt-5 border-t border-[#E2E8F3] pt-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[#8FA0B5]">
                Share via
              </label>
              <div className="flex flex-wrap gap-2">
                <button onClick={shareViaEmail} disabled={!survey.publicUrl}
                  className="flex items-center gap-2.5 rounded-[10px] bg-[#EFF6FF] px-3 py-2 text-[12px] font-medium text-[#0B4A8B] transition-colors hover:bg-[#DBEAFE] disabled:opacity-50 items-center justify-center text-center">
                  <Mail className="h-3.5 w-3.5" /> Email
                </button>
                <button onClick={shareViaSms} disabled={!survey.publicUrl}
                  className="flex items-center gap-2.5 rounded-[10px] bg-[#ECFDF5] px-3 py-2 text-[12px] font-medium text-[#17A673] transition-colors hover:bg-[#D1FAE5] disabled:opacity-50 items-center justify-center text-center">
                  <MessageSquare className="h-3.5 w-3.5" /> SMS
                </button>
                <button onClick={shareViaWhatsapp} disabled={!survey.publicUrl}
                  className="flex items-center gap-2.5 rounded-[10px] bg-[#ECFDF5] px-3 py-2 text-[12px] font-medium text-[#0F6866] transition-colors hover:bg-[#D1FAE5] disabled:opacity-50 items-center justify-center text-center">
                  <Share2 className="h-3.5 w-3.5" /> WhatsApp
                </button>
              </div>
            </div>

            {/* Lifecycle actions */}
            <div className="mt-5 border-t border-[#E2E8F3] pt-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[#8FA0B5]">
                Lifecycle
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowExtendModal(true)}
                  disabled={isDraft}
                  className="flex items-center gap-2.5 rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[12px] font-medium text-[#D97706] transition-colors hover:bg-[#FEF3C7] disabled:opacity-50"
                >
                  <Clock className="h-3.5 w-3.5" /> Extend Expiration
                </button>
                {isActive && (
                  <button
                    onClick={deactivate}
                    disabled={actionLoading === 'deactivate'}
                    className="flex items-center gap-2.5 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] font-medium text-[#E5484D] transition-colors hover:bg-[#FEE2E2] disabled:opacity-50 items-center justify-center text-center"
                  >
                    {actionLoading === 'deactivate' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PowerOff className="h-3.5 w-3.5" />}
                    Deactivate Survey
                  </button>
                )}
                {(isExpired || isClosed) && (
                  <button
                    onClick={reactivate}
                    disabled={actionLoading === 'reactivate'}
                    className="flex items-center gap-2.5 rounded-[10px] border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-2 text-[12px] font-medium text-[#17A673] transition-colors hover:bg-[#D1FAE5] disabled:opacity-50 items-center justify-center text-center"
                  >
                    {actionLoading === 'reactivate' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
                    Reactivate Survey
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Metadata + Stats */}
        <div className="flex flex-col gap-4">
          {/* Quick stats */}
          <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#4A5568]">Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="Responses" value={String(survey.responseCount)} />
              <StatBlock label="NPS" value={survey.npsScore !== null ? String(survey.npsScore) : '—'} />
              <StatBlock label="Questions" value={String(survey.questionCount)} />
              <StatBlock label="NPS Count" value={String(survey.npsResponseCount)} />
            </div>
          </div>

          {/* Availability */}
          <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#4A5568]">Availability</h2>
            <div className="flex flex-col gap-2.5">
              <DetailRow icon={Calendar} label="Activated" value={formatDateTime(survey.activationDate)} />
              <DetailRow icon={Calendar} label="Expires" value={formatDateTime(survey.expirationDate)} />
              <DetailRow icon={Clock} label="Remaining" value={formatRemaining(remainingMs)}
                highlight={isActive && remainingMs !== null && remainingMs > 0} />
              <DetailRow icon={Activity} label="Status" value={LIFECYCLE_LABELS[survey.lifecycleStatus] ?? survey.lifecycleStatus} />
              <DetailRow icon={Calendar} label="Last Response" value={formatDateTime(survey.lastResponseAt)} />
            </div>
          </div>

          {/* Ownership */}
          <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#4A5568]">Ownership</h2>
            <div className="flex flex-col gap-2.5">
              <DetailRow icon={User} label="Created By" value={survey.createdByName} />
              <DetailRow icon={Hash} label="Employee ID" value={survey.createdByEmployeeId} />
              <DetailRow icon={User} label="Department" value={survey.createdByDepartment ?? '—'} />
              <DetailRow icon={Calendar} label="Created" value={formatDateTime(survey.createdAt)} />
              <DetailRow icon={User} label="Last Modified By" value={survey.lastModifiedByName ?? '—'} />
              <DetailRow icon={Calendar} label="Last Modified" value={formatDateTime(survey.updatedAt)} />
            </div>
          </div>
        </div>
      </div>

      {/* Audit log */}
      <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[#4A5568]">
            <History className="h-4 w-4" />
            Survey Audit Log
          </h2>
          <Link
            href={`/dashboard/audit-log?surveyId=${survey.numericId}`}
            className="text-[11.5px] font-semibold text-[#0B4A8B] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          {auditLog.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-[#8FA0B5]">No activity recorded yet.</p>
          ) : (
            auditLog.slice(0, 10).map((log, idx) => (
              <div key={log.id} className="flex items-start gap-3 rounded-[8px] px-3 py-2 hover:bg-[#F8FAFD]">
                <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0B4A8B]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#0D1B2E]">
                    {log.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  {log.details && (
                    <p className="text-[11px] text-[#4A5568]">{log.details}</p>
                  )}
                  <p className="text-[10.5px] text-[#8FA0B5]">
                    {formatDateTime(log.createdAt)} · {log.actor?.name ?? 'System'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Extend Expiration Modal */}
      {showExtendModal && (
        <ExtendExpirationModal
          survey={survey}
          onClose={() => setShowExtendModal(false)}
          onExtended={() => { setShowExtendModal(false); fetchSurvey() }}
        />
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-[#F8FAFD] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8FA0B5]">{label}</p>
      <p className="mt-0.5 text-[18px] font-bold text-[#0D1B2E]">{value}</p>
    </div>
  )
}

function DetailRow({
  icon: Icon, label, value, highlight,
}: {
  icon: typeof Calendar
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-[11.5px] text-[#8FA0B5]">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <span className={`text-[12px] font-medium ${highlight ? 'text-[#17A673]' : 'text-[#0D1B2E]'}`}>{value}</span>
    </div>
  )
}

function ExtendExpirationModal({
  survey, onClose, onExtended,
}: {
  survey: SurveyDetail
  onClose: () => void
  onExtended: () => void
}) {
  const toast = useToast()
  const [addDays, setAddDays] = useState(7)
  const [loading, setLoading] = useState(false)

  const presets = [1, 3, 7, 14, 30, 60, 90]

  async function handleExtend() {
    setLoading(true)
    try {
      const res = await fetch(`/api/surveys/${survey.numericId}?action=extend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addDays }),
      })
      if (res.ok) {
        toast.success('Expiration extended', `Added ${addDays} days.`)
        onExtended()
      } else {
        const json = await res.json().catch(() => null)
        toast.error('Failed', json?.error || 'Could not extend expiration.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h3 className="text-[16px] font-bold text-[#0D1B2E]">Extend Expiration</h3>
          <p className="mt-1 text-[12px] text-[#4A5568]">
            Current expiration: {survey.expirationDate ? formatDateTime(survey.expirationDate) : 'No expiration set'}
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[#8FA0B5]">
            Add days
          </label>
          <div className="grid grid-cols-4 gap-2">
            {presets.map(d => (
              <button
                key={d}
                onClick={() => setAddDays(d)}
                className={`rounded-[8px] border-2 py-2 text-[12px] font-semibold transition-all ${
                  addDays === d ? 'border-[#0B4A8B] bg-[#EFF6FF] text-[#0B4A8B]' : 'border-[#E2E8F3] text-[#4A5568] hover:border-[#C8D4E3]'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 rounded-[10px] bg-[#F8FAFD] p-3">
          <p className="text-[11px] text-[#4A5568]">
            New expiration: <span className="font-semibold text-[#0D1B2E]">
              {(() => {
                const base = survey.expirationDate ? new Date(survey.expirationDate) : new Date()
                base.setTime(base.getTime() + addDays * 86400000)
                return formatDateTime(base.toISOString())
              })()}
            </span>
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}
            className="flex items-center justify-center text-center rounded-[10px] border border-[#E2E8F3] px-6 py-3 text-[12px] font-medium text-[#4A5568] hover:bg-[#F8FAFD]">
            Cancel
          </button>
          <button onClick={handleExtend} disabled={loading}
            className="flex items-center gap-2.5 rounded-[10px] bg-[#0B4A8B] px-6 py-3 text-[12px] font-semibold text-white hover:bg-[#06386F] disabled:opacity-50 items-center justify-center text-center">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
            Extend
          </button>
        </div>
      </motion.div>
    </div>
  )
}
