'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, MoreHorizontal, Eye, KeyRound, ShieldCheck, ShieldOff, Inbox } from 'lucide-react'
import type { AppUser, UserSortKey } from '@/lib/types/user'
import { RoleBadge, UserStatusBadge } from './UserBadges'

interface SortHeaderProps {
  label: string
  sortKey: UserSortKey
  currentSort: UserSortKey
  dir: 'asc' | 'desc'
  onSort: (k: UserSortKey) => void
}

function SortHeader({ label, sortKey, currentSort, dir, onSort }: SortHeaderProps) {
  const active = currentSort === sortKey
  return (
    <th
      className="cursor-pointer select-none px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.07em] transition-colors whitespace-nowrap"
      style={{
        color: active ? 'var(--primary)' : 'var(--text-light)',
        background: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border)',
      }}
      onClick={() => onSort(sortKey)}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-light)' }}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={`transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}>
          {dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </span>
      </span>
    </th>
  )
}

function RowMenu({ user, onView, onReset, onToggle }: { user: AppUser; onView: (u: AppUser) => void; onReset: (u: AppUser) => void; onToggle: (u: AppUser) => void }) {
  const [open, setOpen] = useState(false)
  const isActive = user.status === 'active'
  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        className="rounded-[7px] p-2.5 transition-all"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-subtle)'
          e.currentTarget.style.color = 'var(--text)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
        aria-label="Row actions"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setOpen(false) }} />
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-9 z-50 min-w-[180px] overflow-hidden rounded-[10px] border bg-white py-1"
            style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => { onView(user); setOpen(false) }}
              className="flex w-full items-center gap-2 px-3 py-2 text-[12px] font-medium transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <Eye size={12} strokeWidth={2.1} /> View Profile
            </button>
            <button
              onClick={() => { onReset(user); setOpen(false) }}
              className="flex w-full items-center gap-2 px-3 py-2 text-[12px] font-medium transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <KeyRound size={12} strokeWidth={2.1} /> Reset Password
            </button>
            <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
            <button
              onClick={() => { onToggle(user); setOpen(false) }}
              className="flex w-full items-center gap-2 px-3 py-2 text-[12px] font-medium transition-colors"
              style={isActive
                ? { color: 'var(--red)' }
                : { color: 'var(--emerald)' }
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isActive ? 'var(--tint-red)' : 'var(--tint-emerald)'
              }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {isActive
                ? <><ShieldOff size={12} strokeWidth={2.1} /> Deactivate</>
                : <><ShieldCheck size={12} strokeWidth={2.1} /> Activate</>
              }
            </button>
          </motion.div>
        </>
      )}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="h-3 rounded shimmer" style={{ width: `${55 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <tr>
      <td colSpan={9}>
        <div className="flex flex-col items-center gap-3 py-16">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-[14px]"
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              color: 'var(--text-light)',
            }}
          >
            <Inbox size={22} />
          </div>
          <div className="text-center">
            <div className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>
              {hasFilters ? 'No users match your filters' : 'No users yet'}
            </div>
            <div className="mt-1 text-[12px]" style={{ color: 'var(--text-light)' }}>
              {hasFilters ? 'Try adjusting your search or filter criteria.' : 'Users will appear here once added to the system.'}
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={onClear}
              className="flex items-center justify-center text-center rounded-[9px] border bg-white px-6 py-3 text-[12px] font-semibold transition-all "
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

function Pagination({ page, totalPages, pageSize, totalItems, onPageChange }: { page: number; totalPages: number; pageSize: number; totalItems: number; onPageChange: (p: number) => void }) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (page <= 4) return i + 1
    if (page >= totalPages - 3) return totalPages - 6 + i
    return page - 3 + i
  })
  return (
    <div
      className="flex items-center justify-between px-6 py-4"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <span className="text-[12px] font-medium" style={{ color: 'var(--text-light)' }}>
        Showing <span className="tabular font-bold" style={{ color: 'var(--text)' }}>{from}–{to}</span> of{' '}
        <span className="tabular font-bold" style={{ color: 'var(--text)' }}>{totalItems}</span> users
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-[7px] border bg-white px-2.5 py-1 text-[11px] font-semibold transition-all disabled:opacity-30"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            if (page !== 1) {
              e.currentTarget.style.background = 'var(--bg-subtle)'
              e.currentTarget.style.color = 'var(--text)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          ← Prev
        </button>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="rounded-[7px] border px-2.5 py-1 text-[11px] font-semibold transition-all"
            style={p === page
              ? { background: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff' }
              : { background: 'white', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
            }
            onMouseEnter={(e) => {
              if (p !== page) {
                e.currentTarget.style.background = 'var(--bg-subtle)'
                e.currentTarget.style.color = 'var(--text)'
              }
            }}
            onMouseLeave={(e) => {
              if (p !== page) {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }
            }}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-[7px] border bg-white px-2.5 py-1 text-[11px] font-semibold transition-all disabled:opacity-30"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            if (page !== totalPages) {
              e.currentTarget.style.background = 'var(--bg-subtle)'
              e.currentTarget.style.color = 'var(--text)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

interface Props {
  users: AppUser[]
  loading: boolean
  hasActiveFilters: boolean
  onClearFilters: () => void
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onView: (u: AppUser) => void
  onResetPassword: (u: AppUser) => void
  onToggleStatus: (u: AppUser) => void
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (p: number) => void
  sortKey: UserSortKey
  sortDir: 'asc' | 'desc'
  onSort: (k: UserSortKey) => void
}

export function UserTable({ users, loading, hasActiveFilters, onClearFilters, selectedIds, onToggleSelect, onToggleSelectAll, onView, onResetPassword, onToggleStatus, page, totalPages, totalItems, pageSize, onPageChange, sortKey, sortDir, onSort }: Props) {
  const allOnPageSelected = users.length > 0 && users.every(u => selectedIds.has(u.id))
  const someSelected = users.some(u => selectedIds.has(u.id)) && !allOnPageSelected

  function formatLastLogin(iso: string | null) {
    if (!iso) return '—'
    const d = new Date(iso)
    const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString('en-AE', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px] border-collapse">
        <thead>
          <tr>
            <th
              className="w-10 px-5 py-3.5"
              style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}
            >
              <input
                type="checkbox"
                checked={allOnPageSelected}
                ref={el => { if (el) el.indeterminate = someSelected }}
                onChange={onToggleSelectAll}
                className="h-3.5 w-3.5 cursor-pointer accent-[var(--primary)]"
              />
            </th>
            <SortHeader label="Employee" sortKey="name" currentSort={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Emp ID"   sortKey="employeeId" currentSort={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Role"     sortKey="role" currentSort={sortKey} dir={sortDir} onSort={onSort} />
            <th
              className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.07em] whitespace-nowrap"
              style={{ color: 'var(--text-light)', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}
            >
              Department / Branch
            </th>
            <th
              className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.07em] whitespace-nowrap"
              style={{ color: 'var(--text-light)', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}
            >
              Status
            </th>
            <SortHeader label="Last Login" sortKey="lastLogin" currentSort={sortKey} dir={sortDir} onSort={onSort} />
            <th
              className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-[0.07em] whitespace-nowrap"
              style={{ color: 'var(--text-light)', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}
            >
              Surveys Assigned
            </th>
            <th
              className="w-12 px-5 py-3.5"
              style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}
            />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
          ) : users.length === 0 ? (
            <EmptyState hasFilters={hasActiveFilters} onClear={onClearFilters} />
          ) : (
            users.map(u => {
              const selected = selectedIds.has(u.id)
              const initials = u.name.split(' ').map(n => n[0]).slice(0, 2).join('')
              return (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="group cursor-pointer transition-colors"
                  style={{
                    background: selected ? 'var(--tint-blue)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.background = 'var(--bg-subtle)'
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.background = 'transparent'
                  }}
                  onClick={() => onView(u)}
                >
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected} onChange={() => onToggleSelect(u.id)} className="h-3.5 w-3.5 cursor-pointer accent-[var(--primary)]" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: u.avatarColor }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="whitespace-normal break-words text-[12.5px] font-semibold" style={{ color: 'var(--text)' }}>{u.name}</div>
                        <div className="whitespace-normal break-words text-[10px]" style={{ color: 'var(--text-light)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[11px] tabular font-semibold" style={{ color: 'var(--text)' }}>{u.employeeId}</span>
                  </td>
                  <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-3.5">
                    <div className="text-[12px] font-medium" style={{ color: 'var(--text)' }}>{u.department}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-light)' }}>{u.branch}</div>
                  </td>
                  <td className="px-5 py-3.5"><UserStatusBadge status={u.status} /></td>
                  <td className="px-5 py-3.5 text-[12px] font-medium tabular whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {formatLastLogin(u.lastLogin)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-[12px] tabular font-semibold" style={{ color: 'var(--text)' }}>{u.surveysAssigned} surveys</div>
                  </td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <RowMenu user={u} onView={onView} onReset={onResetPassword} onToggle={onToggleStatus} />
                    </div>
                  </td>
                </motion.tr>
              )
            })
          )}
        </tbody>
      </table>
      {!loading && totalItems > 0 && (
        <Pagination page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems} onPageChange={onPageChange} />
      )}
    </div>
  )
}
