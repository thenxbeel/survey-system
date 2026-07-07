'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ExternalLink, Copy, User, Clock, Globe, Monitor,
  Smartphone, MapPin, Hash, Mail, Phone, Building2, Activity,
  Star, MessageSquare, AlertCircle, Loader2,
} from 'lucide-react'
import { useToast } from '@/lib/stores/ToastStore'

interface ResponseDetail {
  numericId: number
  id: string
  surveyInfo: {
    surveyName: string
    surveyUrl: string | null
    surveySlug: string | null
    surveyCode: string | null
    surveyId: string
    surveyNumericId: number
    campaignName: string | null
    campaignId: number | null
    distributionChannel: string
    createdDate: string
    submittedDate: string
    surveyStatus: string
    touchpoint: string
  }
  responseInfo: {
    responseId: string
    npsScore: number | null
    npsCategory: string
    csatScore: number | null
    cesScore: number | null
    feedback: string | null
    submissionTimestamp: string
    submissionDate: string
    submissionTime: string
    device: string | null
    browser: string | null
    operatingSystem: string | null
    ipAddress: string | null
    country: string | null
    city: string | null
  }
  respondentName: string
  respondentEmail: string
  respondentPhone: string
  owner: {
    id: number
    name: string
    email: string
    employeeId: string
    department: string | null
    role: string | null
  } | null
  status: string
  channel: string
  answers: Array<{ questionId: number; question: string; type: string; answer: string }>
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const NPS_COLORS: Record<string, string> = {
  promoter: 'bg-[#ECFDF5] text-[#17A673] border-[#A7F3D0]',
  passive: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  detractor: 'bg-[#FEF2F2] text-[#E5484D] border-[#FECACA]',
}

export default function ResponseDetailPage() {
  const params = useParams<{ id: string; responseId: string }>()
  const router = useRouter()
  const toast = useToast()
  const [data, setData] = useState<ResponseDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchResponse = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/responses/${params.responseId}`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setData(json.data)
      }
    } catch {
      toast.error('Failed to load response', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }, [params.responseId, toast])

  useEffect(() => { fetchResponse() }, [fetchResponse])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0B4A8B]" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-[#E5484D]" />
        <h1 className="mb-2 text-[18px] font-bold">Response not found</h1>
        <Link href="/dashboard/responses" className="text-[12.5px] font-semibold text-[#0B4A8B]">
          ← Back to Responses
        </Link>
      </div>
    )
  }

  async function copyUrl(url: string | null) {
    if (!url) return
    await navigator.clipboard.writeText(url)
    toast.success('URL copied', 'Survey link is in your clipboard.')
  }

  const hasRespondentInfo = Boolean(data.respondentName || data.respondentEmail || data.respondentPhone)

  return (
    <div className="flex flex-col gap-6 p-7">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="mb-2 flex items-center gap-2.5 text-[11.5px] font-medium text-[#8FA0B5] transition-colors hover:text-[#0D1B2E]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Responses
        </button>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="font-mono text-[11px] text-[#8FA0B5]">{data.id}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${NPS_COLORS[data.responseInfo.npsCategory]}`}>
            {data.responseInfo.npsCategory}
          </span>
          <span className="rounded-full bg-[#EBF0F7] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-[#4A5568]">
            {data.status}
          </span>
        </div>
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#0D1B2E]">
          Response Details
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Survey Information */}
        <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[#4A5568]">
            <Hash className="h-4 w-4" />
            Survey Information
          </h2>

          <div className="flex flex-col gap-3">
            <InfoRow icon={MessageSquare} label="Survey Name" value={data.surveyInfo.surveyName} />
            <div>
              <div className="mb-1 flex items-center gap-2 text-[11.5px] text-[#8FA0B5]">
                <ExternalLink className="h-3 w-3" />
                Survey URL
              </div>
              {data.surveyInfo.surveyUrl ? (
                <div className="flex items-stretch gap-2.5">
                  <Link
                    href={data.surveyInfo.surveyUrl}
                    target="_blank"
                    className="flex-1 truncate rounded-[8px] border border-[#E2E8F3] bg-[#F8FAFD] px-6 py-3 font-mono text-[11.5px] text-[#0B4A8B] hover:bg-[#EFF6FF]"
                  >
                    {data.surveyInfo.surveyUrl}
                  </Link>
                  <button onClick={() => copyUrl(data.surveyInfo.surveyUrl)}
                    className="flex items-center gap-1 rounded-[8px] border border-[#E2E8F3] px-2 text-[11px] font-semibold text-[#0B4A8B] hover:bg-[#EFF6FF]">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <p className="text-[12px] text-[#B0BDCC]">—</p>
              )}
            </div>
            <InfoRow icon={Hash} label="Survey ID" value={data.surveyInfo.surveyId} mono />
            <InfoRow icon={Activity} label="Campaign" value={data.surveyInfo.campaignName ?? '—'} />
            <InfoRow icon={Globe} label="Distribution Channel" value={data.surveyInfo.distributionChannel} />
            <InfoRow icon={Clock} label="Created Date" value={formatDateTime(data.surveyInfo.createdDate)} />
            <InfoRow icon={Clock} label="Submitted Date" value={formatDateTime(data.surveyInfo.submittedDate)} />
            <InfoRow icon={Activity} label="Survey Status" value={data.surveyInfo.surveyStatus} />
            <InfoRow icon={Building2} label="Touchpoint" value={data.surveyInfo.touchpoint} />
          </div>
        </div>

        {/* Response Information */}
        <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[#4A5568]">
            <Star className="h-4 w-4" />
            Response Information
          </h2>

          <div className="flex flex-col gap-3">
            <InfoRow icon={Hash} label="Response ID" value={data.responseInfo.responseId} mono />

            {data.responseInfo.npsScore !== null && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11.5px] text-[#8FA0B5]">
                  <Star className="h-3 w-3" />
                  NPS Score
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[12px] font-bold ${NPS_COLORS[data.responseInfo.npsCategory]}`}>
                    {data.responseInfo.npsScore} / 10
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#4A5568]">
                    {data.responseInfo.npsCategory}
                  </span>
                </div>
              </div>
            )}

            {data.responseInfo.csatScore !== null && (
              <InfoRow icon={Star} label="CSAT" value={`${data.responseInfo.csatScore} / 5`} />
            )}
            {data.responseInfo.cesScore !== null && (
              <InfoRow icon={Star} label="CES" value={`${data.responseInfo.cesScore} / 5`} />
            )}
            <InfoRow icon={Clock} label="Submission Timestamp" value={formatDateTime(data.responseInfo.submissionTimestamp)} />
            <InfoRow icon={Clock} label="Submission Date" value={data.responseInfo.submissionDate} />
            <InfoRow icon={Clock} label="Submission Time" value={data.responseInfo.submissionTime} />
            <InfoRow
              icon={data.responseInfo.device === 'mobile' ? Smartphone : Monitor}
              label="Device"
              value={data.responseInfo.device ?? '—'}
            />
            <InfoRow icon={Globe} label="Browser" value={data.responseInfo.browser ?? '—'} />
            <InfoRow icon={Monitor} label="Operating System" value={data.responseInfo.operatingSystem ?? '—'} />
            <InfoRow icon={Hash} label="IP Address" value={data.responseInfo.ipAddress ?? '—'} mono />
            <InfoRow icon={MapPin} label="Location" value={
              [data.responseInfo.city, data.responseInfo.country].filter(Boolean).join(', ') || '—'
            } />
          </div>
        </div>
      </div>

      {/* Respondent & Owner */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Respondent */}
        <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[#4A5568]">
            <User className="h-4 w-4" />
            Respondent
          </h2>
          {hasRespondentInfo ? (
            <div className="flex flex-col gap-3">
              {data.respondentName && <InfoRow icon={User} label="Name" value={data.respondentName} />}
              {data.respondentEmail && <InfoRow icon={Mail} label="Email" value={data.respondentEmail} />}
              {data.respondentPhone && <InfoRow icon={Phone} label="Phone" value={data.respondentPhone} />}
            </div>
          ) : (
            <div className="rounded-[10px] bg-[#F8FAFD] p-4 text-center">
              <p className="text-[12px] font-medium text-[#4A5568]">Anonymous Response</p>
              <p className="mt-1 text-[11px] text-[#8FA0B5]">
                No respondent information was provided with this submission.
              </p>
            </div>
          )}
        </div>

        {/* Owner */}
        <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[#4A5568]">
            <User className="h-4 w-4" />
            Survey Owner
          </h2>
          {data.owner ? (
            <div className="flex flex-col gap-3">
              <InfoRow icon={User} label="Name" value={data.owner.name} />
              <InfoRow icon={Hash} label="Employee ID" value={data.owner.employeeId} mono />
              <InfoRow icon={Mail} label="Email" value={data.owner.email} />
              <InfoRow icon={Building2} label="Department" value={data.owner.department ?? '—'} />
              <InfoRow icon={Activity} label="Role" value={data.owner.role ?? '—'} />
            </div>
          ) : (
            <p className="text-[12px] text-[#B0BDCC]">No owner assigned.</p>
          )}
        </div>
      </div>

      {/* Feedback */}
      {data.responseInfo.feedback && (
        <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-6 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[#4A5568]">
            <MessageSquare className="h-4 w-4" />
            Respondent Feedback
          </h2>
          <blockquote className="rounded-[10px] border-l-[3px] border-[#0B4A8B] bg-[#F8FAFD] px-4 py-3 text-[13.5px] italic leading-relaxed text-[#0D1B2E]">
            "{data.responseInfo.feedback}"
          </blockquote>
        </div>
      )}

      {/* Answers */}
      {data.answers.length > 0 && (
        <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[#4A5568]">
            <MessageSquare className="h-4 w-4" />
            Survey Answers
          </h2>
          <div className="flex flex-col gap-3">
            {data.answers.map((a, idx) => (
              <div key={a.questionId} className="rounded-[10px] border border-[#E2E8F3] p-3">
                <div className="mb-1.5 flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0B4A8B] text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-[12.5px] font-semibold text-[#0D1B2E]">{a.question}</p>
                    <p className="mt-0.5 text-[10.5px] uppercase tracking-wide text-[#8FA0B5]">{a.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <p className="ml-7 text-[13px] text-[#0D1B2E]">
                  {a.answer || <span className="text-[#B0BDCC]">— No answer —</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({
  icon: Icon, label, value, mono,
}: {
  icon: typeof Hash
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-[11.5px] text-[#8FA0B5]">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <span className={`text-[12px] font-medium text-[#0D1B2E] text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
