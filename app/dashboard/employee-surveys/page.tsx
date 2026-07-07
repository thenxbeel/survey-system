'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Search, Loader2, ChevronDown, ChevronRight, User, Mail, Building2,
  Hash, Activity, BarChart3, ExternalLink, Star, Calendar, Users,
} from 'lucide-react'
import { looksLikeSurveySearch } from '@/lib/survey-search'

interface SurveyCounts {
  total: number
  active: number
  draft: number
  expired: number
  scheduled: number
  closed: number
  archived: number
}

interface Employee {
  id: number
  employeeId: string
  name: string
  email: string
  phone: string | null
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  role: string
  roleId: number
  department: string | null
  departmentId: number | null
  branch: string | null
  branchId: number | null
  surveyCounts: SurveyCounts
}

interface EmployeeSurvey {
  id: string
  numericId: number
  title: string
  status: string
  lifecycleStatus: string
  publicUrl: string | null
  slug: string | null
  surveyCode: string | null
  createdAt: string
  expirationDate: string | null
  remainingMs: number | null
  responseCount: number
  questionCount: number
  npsScore: number | null
  npsResponseCount: number
}

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
  const days = Math.floor(ms / 86400000)
  return `${days}d`
}

export default function EmployeeSurveysPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [expandedSurveys, setExpandedSurveys] = useState<EmployeeSurvey[]>([])
  const [loadingSurveys, setLoadingSurveys] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const PAGE_SIZE = 10

  // ── Debounce the search input (300ms) to avoid unnecessary API requests
  // while the user is typing or pasting a long URL. ──
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      })
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/users?${params}`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setEmployees(json.data || [])
        setTotal(json.pagination?.total ?? 0)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  // ── Auto-expand the first (and likely only) employee when the search
  // looks like a survey-targeted query (URL, slug, code, or numeric ID).
  // This makes the matching survey "immediately appear" without the user
  // having to click the expand chevron. ──
  const autoExpandedRef = useRef<string>('')
  useEffect(() => {
    if (!looksLikeSurveySearch(debouncedSearch)) {
      autoExpandedRef.current = ''
      return
    }
    // Only auto-expand once per search term (avoid re-triggering on re-renders)
    if (autoExpandedRef.current === debouncedSearch) return
    if (employees.length === 0) return
    autoExpandedRef.current = debouncedSearch
    // If there's exactly one match (or the first match), expand it
    const firstId = employees[0].id
    if (expandedId !== firstId) {
      toggleExpand(firstId)
    }
  }, [debouncedSearch, employees])

  async function toggleExpand(empId: number) {
    if (expandedId === empId) {
      setExpandedId(null)
      setExpandedSurveys([])
      return
    }
    setExpandedId(empId)
    setExpandedSurveys([])
    setLoadingSurveys(true)
    try {
      // Pass the current search term so the expanded survey list is also
      // filtered — when searching by URL/slug, only the matching survey
      // appears in the expanded section.
      const params = new URLSearchParams({ pageSize: '50' })
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/users/${empId}/surveys?${params}`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setExpandedSurveys(json.data || [])
      }
    } catch {
      // ignore
    } finally {
      setLoadingSurveys(false)
    }
  }

  // ── When the debounced search changes and an employee is currently
  // expanded, re-fetch their surveys with the new search filter so the
  // expanded view stays in sync with the search box. ──
  useEffect(() => {
    if (expandedId === null) return
    let cancelled = false
    async function refetchExpanded() {
      setLoadingSurveys(true)
      try {
        const params = new URLSearchParams({ pageSize: '50' })
        if (debouncedSearch) params.set('search', debouncedSearch)
        const res = await fetch(`/api/users/${expandedId}/surveys?${params}`, { cache: 'no-store' })
        if (res.ok && !cancelled) {
          const json = await res.json()
          setExpandedSurveys(json.data || [])
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoadingSurveys(false)
      }
    }
    refetchExpanded()
    return () => { cancelled = true }
  }, [debouncedSearch, expandedId])

  return (
    <div className="flex flex-col gap-6 p-7">
      {/* Header */}
      <div>
        <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#0D1B2E]">
          Employee Survey Ownership
        </h1>
        <p className="mt-0.5 text-[12.5px] text-[#4A5568]">
          View every employee's surveys, response counts, and average NPS. Admin-only view.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Employees" value={String(total)} icon={Users} />
        <SummaryCard label="Total Surveys" value={String(employees.reduce((s, e) => s + e.surveyCounts.total, 0))} icon={BarChart3} />
        <SummaryCard label="Active Surveys" value={String(employees.reduce((s, e) => s + e.surveyCounts.active, 0))} icon={Activity} color="text-[#17A673]" />
        <SummaryCard label="Expired Surveys" value={String(employees.reduce((s, e) => s + e.surveyCounts.expired, 0))} icon={Calendar} color="text-[#E5484D]" />
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div 
          className="group flex flex-1 min-w-[200px] items-center gap-2.5 rounded-full border border-[#E2E8F3] bg-white px-3.5 py-2 transition-all duration-200 hover:shadow-md focus-within:border-[#0B4A8B]"
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0 text-[#B0BDCC]" />
          <input
            type="text"
            placeholder="Search by name, email, survey URL, slug, code, title, touchpoint, campaign, or status…"
            value={search}
            onChange={(e) => { setSearch(e.target.value) }}
            className="flex-1 bg-transparent text-[12px] text-[#0D1B2E] outline-none"
          />
        </div>
      </div>

      {/* Employee table */}
      <div className="rounded-[16px] border border-[#E2E8F3] bg-white shadow-sm">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#0B4A8B]" />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-[#B0BDCC]" />
            <h3 className="mb-1 text-[14px] font-semibold text-[#0D1B2E]">No employees found</h3>
            <p className="text-[12px] text-[#8FA0B5]">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F3] text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#8FA0B5]">
                  <th className="px-3 py-2.5 w-8"></th>
                  <th className="px-3 py-2.5">Employee</th>
                  <th className="px-3 py-2.5">Department</th>
                  <th className="px-3 py-2.5">Role</th>
                  <th className="px-3 py-2.5 text-right">Total</th>
                  <th className="px-3 py-2.5 text-right">Active</th>
                  <th className="px-3 py-2.5 text-right">Draft</th>
                  <th className="px-3 py-2.5 text-right">Expired</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <Fragment key={emp.id}>
                    <tr
                      onClick={() => toggleExpand(emp.id)}
                      className="cursor-pointer border-b border-[#E2E8F3] text-[12px] hover:bg-[#F8FAFD]"
                    >
                      <td className="px-3 py-3">
                        {expandedId === emp.id
                          ? <ChevronDown className="h-3.5 w-3.5 text-[#4A5568]" />
                          : <ChevronRight className="h-3.5 w-3.5 text-[#4A5568]" />}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#0D1B2E]">{emp.name}</span>
                          <span className="text-[10.5px] text-[#8FA0B5]">{emp.employeeId} · {emp.email}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#4A5568]">{emp.department ?? '—'}</td>
                      <td className="px-3 py-3 text-[#4A5568]">{emp.role}</td>
                      <td className="px-3 py-3 text-right tabular-nums font-semibold text-[#0D1B2E]">{emp.surveyCounts.total}</td>
                      <td className="px-3 py-3 text-right tabular-nums font-semibold text-[#17A673]">{emp.surveyCounts.active}</td>
                      <td className="px-3 py-3 text-right tabular-nums font-semibold text-[#4A5568]">{emp.surveyCounts.draft}</td>
                      <td className="px-3 py-3 text-right tabular-nums font-semibold text-[#E5484D]">{emp.surveyCounts.expired}</td>
                    </tr>
                    {expandedId === emp.id && (
                      <tr className="border-b border-[#E2E8F3] bg-[#F8FAFD]">
                        <td colSpan={8} className="px-6 py-4">
                          {loadingSurveys ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="h-4 w-4 animate-spin text-[#0B4A8B]" />
                            </div>
                          ) : expandedSurveys.length === 0 ? (
                            <p className="py-4 text-center text-[12px] text-[#8FA0B5]">
                              No surveys created by this employee yet.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-[11.5px]">
                                <thead>
                                  <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8FA0B5]">
                                    <th className="px-2 py-2">Survey Name</th>
                                    <th className="px-2 py-2">Survey ID</th>
                                    <th className="px-2 py-2">Status</th>
                                    <th className="px-2 py-2 text-right">Responses</th>
                                    <th className="px-2 py-2 text-right">Avg NPS</th>
                                    <th className="px-2 py-2">Created</th>
                                    <th className="px-2 py-2 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expandedSurveys.map(s => (
                                    <tr key={s.id} className="border-t border-[#E2E8F3]">
                                      <td className="px-2 py-2 font-medium text-[#0D1B2E]">{s.title}</td>
                                      <td className="px-2 py-2 font-mono text-[10.5px] text-[#8FA0B5]">{s.id}</td>
                                      <td className="px-2 py-2">
                                        <span className={`rounded-full border px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide ${LIFECYCLE_COLORS[s.lifecycleStatus]}`}>
                                          {LIFECYCLE_LABELS[s.lifecycleStatus] ?? s.lifecycleStatus}
                                        </span>
                                      </td>
                                      <td className="px-2 py-2 text-right tabular-nums">{s.responseCount}</td>
                                      <td className="px-2 py-2 text-right tabular-nums font-semibold text-[#0B4A8B]">{s.npsScore ?? '—'}</td>
                                      <td className="px-2 py-2 text-[#4A5568]">{formatDate(s.createdAt)}</td>
                                      <td className="px-2 py-2 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <Link
                                            href={`/dashboard/surveys/${s.numericId}/published`}
                                            className="rounded-[6px] p-1 text-[#4A5568] hover:bg-[#EFF6FF] hover:text-[#0B4A8B]"
                                            title="View Published Page"
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                          </Link>
                                          <Link
                                            href={`/dashboard/responses?surveyId=${s.id}`}
                                            className="rounded-[6px] p-1 text-[#4A5568] hover:bg-[#EFF6FF] hover:text-[#0B4A8B]"
                                            title="View Responses"
                                          >
                                            <BarChart3 className="h-3 w-3" />
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && employees.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F3] px-5 py-3">
            <p className="text-[11.5px] text-[#8FA0B5]">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-[6px] border border-[#E2E8F3] p-2.5 text-[#4A5568] disabled:opacity-40 hover:bg-[#F8FAFD]">
                ‹
              </button>
              <span className="px-3 text-[11.5px] font-medium text-[#0D1B2E]">{page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * PAGE_SIZE >= total}
                className="rounded-[6px] border border-[#E2E8F3] p-2.5 text-[#4A5568] disabled:opacity-40 hover:bg-[#F8FAFD]">
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  label, value, icon: Icon, color = 'text-[#0D1B2E]',
}: {
  label: string
  value: string
  icon: typeof Users
  color?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-[12px] border border-[#E2E8F3] bg-white p-8 min-h-[160px]">
      <div className={`mb-4 flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-[#EFF6FF]`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="text-[28px] font-extrabold text-[#0D1B2E] leading-tight">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#8FA0B5]">{label}</p>
    </div>
  )
}
