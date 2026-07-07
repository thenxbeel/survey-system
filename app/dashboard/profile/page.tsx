'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, ExternalLink, Copy, Download, BarChart3, Pencil,
  Power, Calendar, Clock, Activity, User, Mail, Building2, Hash,
  Loader2, ChevronLeft, ChevronRight, Eye, Star, MessageSquare,
} from 'lucide-react'
import { useToast } from '@/lib/stores/ToastStore'

interface MySurvey {
  id: string
  numericId: number
  title: string
  touchpoint: string
  status: string
  lifecycleStatus: string
  visibility: string
  isAnonymous: boolean
  questionCount: number
  responseCount: number
  responseRate: number
  npsScore: number | null
  npsResponseCount: number
  lastResponseAt: string | null
  slug: string | null
  publicUrl: string | null
  qrCode: string | null
  surveyCode: string | null
  activationDate: string | null
  expirationDate: string | null
  remainingMs: number | null
  campaign: { id: number; name: string; channel: string } | null
  createdAt: string
  updatedAt: string
}

interface UserProfile {
  id: number
  name: string
  email: string
  employeeId: string
  role: string
  department: string | null
  branch: string | null
}

const PAGE_SIZE = 8

const LIFECYCLE_LABELS: Record<string, string> = {
  draft: 'Draft', scheduled: 'Scheduled', active: 'Active',
  expired: 'Expired', closed: 'Closed', archived: 'Archived',
}

const LIFECYCLE_COLORS: Record<string, string> = {
  draft: 'bg-[#EBF0F7] text-[#4A5568] border-[#C8D4E3]',
  scheduled: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  active: 'bg-[#ECFDF5] text-[#17A673] border-[#A7F3D0]',
  expired: 'bg-[#FEF2F2] text-[#E5484D] border-[#FECACA]',
  closed: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
  archived: 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatRemaining(ms: number | null): string {
  if (ms === null) return '—'
  if (ms <= 0) return 'Expired'
  const seconds = Math.floor(ms / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

export default function ProfilePage() {
  const router = useRouter()
  const toast = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [surveys, setSurveys] = useState<MySurvey[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<'updatedAt' | 'title' | 'responseCount' | 'createdAt' | 'npsScore'>('updatedAt')

  // ── Live stats from /api/me/stats ──
  // Fetched from the API (not computed from the paginated survey list) so the
  // counts reflect ALL the user's surveys, not just the current page.
  const [stats, setStats] = useState({
    surveysManaged: 0,
    active: 0,
    draft: 0,
    expired: 0,
    scheduled: 0,
    closed: 0,
    archived: 0,
    published: 0,
    totalResponses: 0,
    casesHandled: 0,
    averageNps: null as number | null,
    npsResponseCount: 0,
    teamMembers: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  // Bump this counter to trigger a stats refetch (cache invalidation after
  // survey create/publish/delete).
  const [statsVersion, setStatsVersion] = useState(0)
  const refreshStats = () => setStatsVersion(v => v + 1)

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/me/stats', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.data) setStats(json.data)
    } catch {
      // keep previous stats — non-fatal
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats, statsVersion])

  // ── Auto-refresh stats when the user returns to this tab ──
  // This catches the case where the user creates/publishes/deletes a survey
  // in another tab or via the Survey Builder, then returns to the Profile.
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        refreshStats()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // ── Auto-refresh stats when the page regains focus (e.g. after returning
  // from the Survey Builder via the browser back button) ──
  useEffect(() => {
    function onFocus() { refreshStats() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const fetchSurveys = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort,
        sortDir: 'desc',
      })
      if (search) params.set('search', search)
      if (status !== 'all') params.set('lifecycle', status)

      const [meRes, sRes] = await Promise.all([
        fetch('/api/auth/me', { cache: 'no-store' }),
        fetch(`/api/me/surveys?${params}`, { cache: 'no-store' }),
      ])
      if (meRes.ok) {
        const json = await meRes.json()
        setProfile(json.user ?? json.data ?? null)
      }
      if (sRes.ok) {
        const json = await sRes.json()
        setSurveys(json.data || [])
        setTotal(json.pagination?.total ?? 0)
      }
    } catch {
      toast.error('Failed to load profile', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }, [page, search, status, sort, toast])

  useEffect(() => { fetchSurveys() }, [fetchSurveys])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Stats are now fetched from /api/me/stats (see fetchStats above) — not
  // computed from the paginated survey list. This ensures the counts reflect
  // ALL the user's surveys, not just the current page.

  function copyUrl(url: string | null) {
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL copied', 'Survey link is in your clipboard.')
    })
  }

  function downloadQr(qrCode: string | null, code: string | null) {
    if (!qrCode) {
      toast.error('No QR code available', 'Generate one first.')
      return
    }
    const link = document.createElement('a')
    link.href = qrCode
    link.download = `qr-${code || 'survey'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-6 p-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#0D1B2E]">My Profile</h1>
          <p className="mt-0.5 text-[12.5px] text-[#4A5568]">
            View your surveys, performance, and account details.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/survey-builder')}
          className="flex items-center gap-2.5 rounded-[10px] bg-[#0B4A8B] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#06386F]"
        >
          <Plus className="h-3.5 w-3.5" />
          New Survey
        </button>
      </div>

      {/* Profile card */}
      <div className="rounded-[16px] border border-[#E2E8F3] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0B4A8B] to-[#06386F] text-[28px] font-bold text-white">
              {profile?.name ? profile.name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase() : 'U'}
            </div>
            <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-[#17A673]" />
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ProfileField icon={User} label="Name" value={profile?.name ?? '—'} />
            <ProfileField icon={Mail} label="Email" value={profile?.email ?? '—'} />
            <ProfileField icon={Hash} label="Employee ID" value={profile?.employeeId ?? '—'} />
            <ProfileField icon={Activity} label="Role" value={profile?.role ?? '—'} />
            <ProfileField icon={Building2} label="Department" value={profile?.department ?? '—'} />
            <ProfileField icon={Building2} label="Branch" value={profile?.branch ?? '—'} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Surveys" value={statsLoading ? '…' : String(stats.surveysManaged)} icon={BarChart3} color="text-[#0B4A8B]" bgColor="bg-[#EFF6FF]" />
        <StatCard label="Active" value={statsLoading ? '…' : String(stats.active)} icon={Activity} color="text-[#17A673]" bgColor="bg-[#ECFDF5]" />
        <StatCard label="Drafts" value={statsLoading ? '…' : String(stats.draft)} icon={Pencil} color="text-[#D97706]" bgColor="bg-[#FFFBEB]" />
        <StatCard label="Expired" value={statsLoading ? '…' : String(stats.expired)} icon={Clock} color="text-[#E5484D]" bgColor="bg-[#FEF2F2]" />
        <StatCard label="Responses" value={statsLoading ? '…' : String(stats.totalResponses)} icon={MessageSquare} color="text-[#0B4A8B]" bgColor="bg-[#EFF6FF]" />
        <StatCard label="Avg NPS" value={statsLoading ? '…' : (stats.averageNps !== null ? String(stats.averageNps) : '—')} icon={Star} color="text-[#F59E0B]" bgColor="bg-[#FFFBEB]" />
      </div>

      {/* Created Surveys */}
      <div className="rounded-[16px] border border-[#E2E8F3] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E2E8F3] p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[14px] font-bold text-[#0D1B2E]">Created Surveys</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div 
              className="group flex sm:w-[220px] items-center gap-2.5 rounded-full border border-[#E2E8F3] bg-white px-6 py-3 transition-all duration-200 hover:shadow-md focus-within:border-[#0B4A8B]"
            >
              <Search className="h-3.5 w-3.5 flex-shrink-0 text-[#B0BDCC]" />
              <input
                type="text"
                placeholder="Search surveys…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="flex-1 bg-transparent text-[12px] text-[#0D1B2E] outline-none"
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="rounded-[8px] border border-[#E2E8F3] bg-white px-4 py-2.5 text-[12px] text-[#4A5568] outline-none focus:border-[#0B4A8B]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="rounded-[8px] border border-[#E2E8F3] bg-white px-4 py-2.5 text-[12px] text-[#4A5568] outline-none focus:border-[#0B4A8B]"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
              <option value="responseCount">Response Count</option>
              <option value="npsScore">NPS Score</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#0B4A8B]" />
          </div>
        ) : surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="mb-3 h-10 w-10 text-[#B0BDCC]" />
            <h3 className="mb-1 text-[14px] font-semibold text-[#0D1B2E]">No surveys yet</h3>
            <p className="mb-4 text-[12px] text-[#8FA0B5]">Create your first survey to see it here.</p>
            <button onClick={() => router.push('/dashboard/survey-builder')}
              className="flex items-center gap-2.5 rounded-[10px] bg-[#0B4A8B] px-6 py-3 text-[12px] font-semibold text-white hover:bg-[#06386F]">
              <Plus className="h-3.5 w-3.5" /> Create Survey
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F3] text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#8FA0B5]">
                  <th className="px-4 py-2.5">Survey</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Responses</th>
                  <th className="px-3 py-2.5 text-right">NPS</th>
                  <th className="px-3 py-2.5">Created</th>
                  <th className="px-3 py-2.5">Expires</th>
                  <th className="px-3 py-2.5">Remaining</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map(s => (
                  <tr key={s.id} className="border-b border-[#E2E8F3] text-[12px] hover:bg-[#F8FAFD]">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <Link href={`/dashboard/surveys/${s.numericId}/published`}
                          className="font-semibold text-[#0D1B2E] hover:text-[#0B4A8B]">
                          {s.title}
                        </Link>
                        <span className="font-mono text-[10.5px] text-[#8FA0B5]">
                          {s.id} {s.surveyCode ? `· ${s.surveyCode}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${LIFECYCLE_COLORS[s.lifecycleStatus]}`}>
                        {LIFECYCLE_LABELS[s.lifecycleStatus] ?? s.lifecycleStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-[#0D1B2E]">{s.responseCount}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-[#0B4A8B]">{s.npsScore ?? '—'}</td>
                    <td className="px-3 py-3 text-[#4A5568]">{formatDate(s.createdAt)}</td>
                    <td className="px-3 py-3 text-[#4A5568]">{formatDate(s.expirationDate)}</td>
                    <td className="px-3 py-3 text-[#4A5568]">{formatRemaining(s.remainingMs)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {s.publicUrl && (
                          <button onClick={() => window.open(s.publicUrl!, '_blank')}
                            title="Open Survey" className="rounded-[6px] p-2.5 text-[#4A5568] hover:bg-[#EFF6FF] hover:text-[#0B4A8B]">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {s.publicUrl && (
                          <button onClick={() => copyUrl(s.publicUrl)}
                            title="Copy URL" className="rounded-[6px] p-2.5 text-[#4A5568] hover:bg-[#EFF6FF] hover:text-[#0B4A8B]">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {s.qrCode && (
                          <button onClick={() => downloadQr(s.qrCode, s.surveyCode)}
                            title="Download QR" className="rounded-[6px] p-2.5 text-[#4A5568] hover:bg-[#EFF6FF] hover:text-[#0B4A8B]">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <Link href={`/dashboard/responses?surveyId=${s.id}`}
                          title="View Responses" className="rounded-[6px] p-2.5 text-[#4A5568] hover:bg-[#EFF6FF] hover:text-[#0B4A8B]">
                          <BarChart3 className="h-3.5 w-3.5" />
                        </Link>
                        <Link href={`/dashboard/analytics?surveyId=${s.numericId}`}
                          title="Analytics" className="rounded-[6px] p-2.5 text-[#4A5568] hover:bg-[#EFF6FF] hover:text-[#0B4A8B]">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link href={`/dashboard/survey-builder?edit=${s.numericId}`}
                          title="Edit" className="rounded-[6px] p-2.5 text-[#4A5568] hover:bg-[#EFF6FF] hover:text-[#0B4A8B]">
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && surveys.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F3] px-5 py-3">
            <p className="text-[11.5px] text-[#8FA0B5]">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-[6px] border border-[#E2E8F3] p-2.5 text-[#4A5568] disabled:opacity-40 hover:bg-[#F8FAFD]"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[28px] rounded-[6px] px-1.5 py-1 text-[11.5px] font-medium ${
                    p === page
                      ? 'bg-[#0B4A8B] text-white'
                      : 'text-[#4A5568] hover:bg-[#F8FAFD]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-[6px] border border-[#E2E8F3] p-2.5 text-[#4A5568] disabled:opacity-40 hover:bg-[#F8FAFD]"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <span className="mx-1 text-[11px] text-[#B0BDCC]">|</span>
              <span className="rounded-[6px] border border-[#E2E8F3] px-6 py-3 text-[11px] text-[#4A5568]">
                {PAGE_SIZE}/page
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileField({
  icon: Icon, label, value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#8FA0B5]">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span className="text-[13px] font-medium text-[#0D1B2E]">{value}</span>
    </div>
  )
}

function StatCard({
  label, value, icon: Icon, color = 'text-[#0D1B2E]', bgColor = 'bg-[#EFF6FF]',
}: {
  label: string
  value: string
  icon: typeof BarChart3
  color?: string
  bgColor?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-[12px] border border-[#E2E8F3] bg-white p-8 min-h-[160px]">
      <div className={`mb-4 flex h-[40px] w-[40px] items-center justify-center rounded-[10px] ${bgColor}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="text-[28px] font-bold text-[#0D1B2E] mb-1">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8FA0B5]">{label}</p>
    </div>
  )
}
