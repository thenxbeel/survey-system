'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import {
  computeUserStats, applyUserFilters, applyUserSort, hasActiveUserFilters,
  DEFAULT_USER_FILTERS, type UserFilters, type AppUser, type UserSortKey,
  type UserRole,
} from '@/lib/types/user'
import { UserHeader } from '@/components/users/UserHeader'
import { UserStatsCards } from '@/components/users/UserStatsCards'
import { UserToolbar } from '@/components/users/UserToolbar'
import { UserTable } from '@/components/users/UserTable'
import { UserDetailDrawer } from '@/components/users/UserDetailDrawer'
import { UserInsights } from '@/components/users/UserInsights'
import { CreateUserModal } from '@/components/users/CreateUserModal'

const PAGE_SIZE = 10

interface Toast {
  id: string
  type: 'success' | 'info' | 'warning'
  title: string
  message: string
  at: number
}

const TOAST_ICONS = { success: CheckCircle2, info: Info, warning: AlertTriangle }
const TOAST_COLORS = { success: '#17A673', info: '#0B4A8B', warning: '#F5A623' }

// Avatar color picker — deterministic based on name
const AVATAR_COLORS = ['#0B4A8B', '#7C3AED', '#0F6866', '#D97706', '#E5484D', '#3B82F6']
function pickAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

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
              style={{
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px]"
                style={{ background: `${color}1A` }}
              >
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
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
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

// Map a /api/users record → AppUser shape that the existing components expect
function mapApiUser(u: any): AppUser {
  const role = (u.role as UserRole) ?? 'Viewer'
  const status = u.isActive ? 'active' : 'suspended'
  const surveyCounts = u.surveyCounts ?? { total: 0, active: 0, draft: 0, expired: 0, scheduled: 0, closed: 0, archived: 0 }
  return {
    id: String(u.id),
    employeeId: u.employeeId,
    name: u.name,
    email: u.email,
    phone: u.phone ?? undefined,
    role,
    roleId: u.roleId,
    department: u.department ?? '—',
    departmentId: u.departmentId ?? null,
    branch: u.branch ?? '—',
    branchId: u.branchId ?? null,
    status: status as any,
    avatarColor: pickAvatarColor(u.name),
    lastLogin: u.lastLogin ?? null,
    lastLoginIp: null,
    createdAt: u.createdAt,
    permissions: [],
    allowedPages: u.allowedPages ?? null,
    roleAllowedPages: u.roleAllowedPages ?? [],
    visibleBranches: u.visibleBranches ?? null,
    visibleDepartments: u.visibleDepartments ?? null,
    activity: [],
    recentLogins: [],
    surveysAssigned: surveyCounts.total,
    casesHandled: 0,
    avgResolutionHrs: 0,
  }
}

export default function UsersPage() {
  const [filters, setFilters]             = useState<UserFilters>(DEFAULT_USER_FILTERS)
  const [page, setPage]                   = useState(1)
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set())
  const [loading, setLoading]             = useState(true)
  const [users, setUsers]                 = useState<AppUser[]>([])
  const [activeUser, setActiveUser]       = useState<AppUser | null>(null)
  const [sortKey, setSortKey]             = useState<UserSortKey>('name')
  const [sortDir, setSortDir]             = useState<'asc' | 'desc'>('asc')
  const [toasts, setToasts]               = useState<Toast[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // ── Debounce the search input (300ms) so typing/pasting a long URL doesn't
  // fire an API request on every keystroke. The search is sent to the API
  // (which has full survey-URL / slug / code / title / touchpoint / campaign
  // / department / branch / role / status search logic). ──
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300)
    return () => clearTimeout(t)
  }, [filters.search])

  // ── Fetch users from /api/users with the debounced search term ──
  // When the search is a survey URL, the API extracts the slug and returns
  // ALL users linked to that survey (creator + last modifier + campaign owner).
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ pageSize: '100' })
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/users?${params}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setUsers((json.data || []).map(mapApiUser))
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const stats = useMemo(() => computeUserStats(users), [users])
  const filtered = useMemo(() => applyUserFilters(users, filters), [users, filters])
  const sorted = useMemo(() => applyUserSort(filtered, sortKey, sortDir), [filtered, sortKey, sortDir])
  const availableRoles = useMemo(() => {
    const rolesSet = new Set<string>()
    users.forEach(u => {
      if (u.role) rolesSet.add(u.role)
    })
    return Array.from(rolesSet)
  }, [users])
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const activeFilters = hasActiveUserFilters(filters)

  function handleFiltersChange(next: UserFilters) { setFilters(next); setPage(1) }
  function handleClearFilters() { setFilters(DEFAULT_USER_FILTERS); setPage(1) }
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }
  function toggleSelectAll() {
    setSelectedIds(prev => {
      const all = pageItems.every(u => prev.has(u.id))
      const n = new Set(prev)
      if (all) pageItems.forEach(u => n.delete(u.id)); else pageItems.forEach(u => n.add(u.id))
      return n
    })
  }
  function handleSort(k: UserSortKey) {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('asc') }
  }

  const pushToast = useCallback((type: Toast['type'], title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setToasts(prev => [...prev, { id, type, title, message, at: Date.now() }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  function handleNotify(n: { type: 'success' | 'info' | 'warning'; title: string; message: string }) { pushToast(n.type, n.title, n.message) }
  function handleUserUpdate(updated: AppUser) {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    setActiveUser(updated)
    // Persist the status/role/dept/access changes to the API
    const numericId = updated.id
    fetch(`/api/users/${numericId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isActive: updated.status === 'active',
        roleName: updated.role,
        departmentName: updated.department,
        allowedPages: updated.allowedPages,
        visibleBranches: updated.visibleBranches,
        visibleDepartments: updated.visibleDepartments,
      }),
    }).catch(() => { /* non-fatal */ })
  }
  function handleResetPassword(u: AppUser) { pushToast('info', 'Password reset', `Reset link sent to ${u.email}.`) }
  function handleToggleStatus(u: AppUser) {
    const next = u.status === 'active' ? 'suspended' : 'active'
    handleUserUpdate({ ...u, status: next as any })
    pushToast(next === 'active' ? 'success' : 'warning', next === 'active' ? 'Account activated' : 'Account suspended', `${u.name} is now ${next}.`)
  }

  function handleDeleteUser(id: string) {
    fetch(`/api/users/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete user')
        setUsers(prev => prev.filter(u => u.id !== id))
        setActiveUser(null)
        pushToast('success', 'User deleted', 'The user has been completely removed.')
      })
      .catch(err => {
        pushToast('warning', 'Cannot delete user', 'User may have associated records. Suspend them instead.')
      })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 p-7"
    >
      {/* Header */}
      <UserHeader
        totalUsers={stats.total}
        activeCount={stats.active}
        onNew={() => setCreateModalOpen(true)}
      />

      {/* KPI Cards */}
      <UserStatsCards stats={stats} />

      {/* Insights */}
      <UserInsights stats={stats} />

      {/* Toolbar + Table (enterprise container) */}
      <div
        className="flex flex-col rounded-[18px] bg-white"
        style={{
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <UserToolbar
          filters={filters}
          onChange={handleFiltersChange}
          onClear={handleClearFilters}
          hasActiveFilters={activeFilters}
          selectedIds={selectedIds}
          totalItems={sorted.length}
          onBulkExport={() => pushToast('success', 'Bulk export queued', `${selectedIds.size} users queued.`)}
          onBulkActivate={() => pushToast('success', 'Bulk activate', `${selectedIds.size} users activated.`)}
          availableRoles={availableRoles}
        />
        <UserTable
          users={pageItems}
          loading={loading}
          hasActiveFilters={activeFilters}
          onClearFilters={handleClearFilters}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onView={u => setActiveUser(u)}
          onResetPassword={handleResetPassword}
          onToggleStatus={handleToggleStatus}
          page={page}
          totalPages={totalPages}
          totalItems={sorted.length}
          pageSize={PAGE_SIZE}
          onPageChange={p => setPage(Math.min(Math.max(1, p), totalPages))}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
      </div>

      {/* Detail Drawer */}
      <UserDetailDrawer user={activeUser} onClose={() => setActiveUser(null)} onUpdate={handleUserUpdate} onDelete={handleDeleteUser} onNotify={handleNotify} />

      {/* Create User Modal */}
      <CreateUserModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreated={fetchUsers} />

      {/* Notification toasts */}
      <ToastStack toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />
    </motion.div>
  )
}
