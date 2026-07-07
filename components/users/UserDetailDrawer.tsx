'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Mail, Phone, MapPin, Building2, Clock, History, KeyRound, ShieldCheck, ShieldOff,
  Briefcase, Activity, Smartphone, Globe, ChevronDown, type LucideIcon,
} from 'lucide-react'
import type { AppUser } from '@/lib/types/user'
import { ROLES, ROLE_META, DEPARTMENTS, type UserRole } from '@/lib/types/user'
import { RoleBadge, UserStatusBadge } from './UserBadges'
import { PermissionMatrix } from './PermissionMatrix'

function SectionHeader({ icon, label, action }: { icon: React.ReactNode; label: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--text-light)' }}>{icon}</span>
        <span
          className="text-[10.5px] font-bold uppercase tracking-[0.08em]"
          style={{ color: 'var(--text-light)' }}
        >
          {label}
        </span>
      </div>
      {action}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px]" style={{ color: 'var(--text-light)' }}>{label}</span>
      <span className="text-right text-[12px] font-medium" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

const selectCls =
  'h-[34px] w-full appearance-none rounded-[9px] border border-[var(--border)] bg-white pl-3 pr-9 text-[12px] font-medium text-[var(--text)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(11,74,139,0.1)] cursor-pointer'

function NativeSelect({
  value, onChange, options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative flex-1">
      <select value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-light)' }} />
    </div>
  )
}

interface Props {
  user: AppUser | null
  onClose: () => void
  onUpdate?: (u: AppUser) => void
  onDelete?: (id: string) => void
  onNotify?: (n: { type: 'success' | 'info' | 'warning'; title: string; message: string }) => void
}

export function UserDetailDrawer({ user: u, onClose, onUpdate, onDelete, onNotify }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const [newRole, setNewRole] = useState<UserRole | null>(null)
  const [newDept, setNewDept] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-AE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
  function formatDateShort(iso: string) {
    return new Date(iso).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function applyRole() {
    if (!u || !newRole || newRole === u.role) return
    const updated: AppUser = { ...u, role: newRole, permissions: ROLE_META[newRole] ? u.permissions : u.permissions }
    onUpdate?.(updated)
    onNotify?.({ type: 'success', title: 'Role updated', message: `${u.name} is now ${newRole}.` })
    setNewRole(null)
  }

  function applyDept(dept: string) {
    if (!u || dept === u.department) return
    const updated: AppUser = { ...u, department: dept }
    onUpdate?.(updated)
    onNotify?.({ type: 'info', title: 'Department changed', message: `${u.name} moved to ${dept}.` })
    setNewDept(null)
  }

  function handleResetPassword() {
    if (!u) return
    onNotify?.({ type: 'info', title: 'Password reset', message: `Reset link sent to ${u.email} (mock).` })
  }

  function handleToggleStatus() {
    if (!u) return
    const next = u.status === 'active' ? 'suspended' : 'active'
    const updated: AppUser = { ...u, status: next }
    onUpdate?.(updated)
    onNotify?.({ type: next === 'active' ? 'success' : 'warning', title: next === 'active' ? 'Account activated' : 'Account suspended', message: `${u.name} is now ${next}.` })
  }

  function handleDeleteUser() {
    if (!u) return
    if (!confirm(`Are you sure you want to completely delete ${u.name}? This action cannot be undone.`)) return
    onDelete?.(u.id)
  }

  const initials = u ? u.name.split(' ').map(n => n[0]).slice(0, 2).join('') : ''

  return (
    <AnimatePresence>
      {u && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px]"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onClose()
            }}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[600px] flex-col border-l bg-white"
            style={{
              borderColor: 'var(--border)',
              boxShadow: '0 0 60px rgba(13,27,46,0.18)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{
                background: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-bold text-white"
                  style={{ background: u.avatarColor }}
                >
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>
                      {u.name}
                    </span>
                    <RoleBadge role={u.role} />
                    <UserStatusBadge status={u.status} />
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--text-light)' }}>
                    {u.employeeId} · since {formatDateShort(u.createdAt)}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center text-center rounded-[8px] p-2 transition-all"
                style={{ color: 'var(--text-light)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Action bar */}
            <div
              className="flex flex-wrap items-center gap-2 px-6 py-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <button
                onClick={handleToggleStatus}
                className="inline-flex h-[28px] items-center gap-2.5 rounded-[8px] border px-2.5 text-[11px] font-semibold transition-all items-center justify-center text-center"
                style={u.status === 'active'
                  ? { borderColor: 'rgba(229,72,77,0.3)', background: 'var(--tint-red)', color: 'var(--red)' }
                  : { borderColor: 'rgba(23,166,115,0.3)', background: 'var(--tint-emerald)', color: 'var(--emerald)' }
                }
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                {u.status === 'active'
                  ? <><ShieldOff size={11} strokeWidth={2.1} /> Suspend User</>
                  : <><ShieldCheck size={11} strokeWidth={2.1} /> Reactivate User</>
                }
              </button>
              <button
                onClick={handleDeleteUser}
                className="inline-flex h-[28px] items-center gap-2.5 rounded-[8px] border px-2.5 text-[11px] font-semibold transition-all items-center justify-center text-center ml-auto"
                style={{ borderColor: 'rgba(229,72,77,0.3)', background: '#fff', color: 'var(--red)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--tint-red)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
              >
                Delete User
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Performance summary */}
              <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <PerfStat label="Surveys Assigned" value={u.surveysAssigned} accent="var(--emerald)" />
              </div>

              {/* Profile info */}
              <div className="px-6 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <SectionHeader icon={<Mail size={13} />} label="Profile Information" />
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <Mail size={12} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <a href={`mailto:${u.email}`} className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>{u.email}</a>
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-2.5 text-[12px]">
                      <Phone size={12} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      <span className="font-medium" style={{ color: 'var(--text)' }}>{u.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <Building2 size={12} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span className="font-medium" style={{ color: 'var(--text)' }}>{u.department} · {u.branch}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <MapPin size={12} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span className="font-medium" style={{ color: 'var(--text)' }}>
                      Last login: {u.lastLogin ? formatDate(u.lastLogin) : 'Never'}{u.lastLoginIp ? ` · ${u.lastLoginIp}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role management */}
              <div className="px-6 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <SectionHeader icon={<Briefcase size={13} />} label="Role & Department" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-light)' }}>
                      Role
                    </label>
                    <div className="flex gap-2">
                      <NativeSelect
                        value={newRole ?? u.role}
                        onChange={v => setNewRole(v as UserRole)}
                        options={ROLES.map(r => ({ value: r, label: r }))}
                      />
                      {newRole && newRole !== u.role && (
                        <button
                          onClick={applyRole}
                          className="flex items-center justify-center text-center rounded-[8px] px-2.5 text-[11px] font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: 'var(--primary)' }}
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 text-[10px]" style={{ color: 'var(--text-light)' }}>{(ROLE_META[u.role] || { description: 'Custom role with custom page permissions.' }).description}</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-light)' }}>
                      Department
                    </label>
                    <div className="flex gap-2">
                      <NativeSelect
                        value={newDept ?? u.department}
                        onChange={v => setNewDept(v)}
                        options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
                      />
                      {newDept && newDept !== u.department && (
                        <button
                          onClick={() => applyDept(newDept)}
                          className="rounded-[8px] px-2.5 text-[11px] font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: 'var(--primary)' }}
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 text-[10px]" style={{ color: 'var(--text-light)' }}>Branch: {u.branch}</p>
                  </div>
                </div>
              </div>

              {/* Permission matrix */}
              <div className="px-6 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <SectionHeader
                  icon={<ShieldCheck size={13} />}
                  label="Permission Matrix"
                  action={<span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{u.role} role highlighted</span>}
                />
                <PermissionMatrix activeRole={u.role} />
              </div>

              {/* Recent logins */}
              <div className="px-6 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <SectionHeader
                  icon={<Globe size={13} />}
                  label="Recent Logins"
                  action={<span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{u.recentLogins.length} sessions</span>}
                />
                <div className="flex flex-col gap-2">
                  {u.recentLogins.map(l => (
                    <div
                      key={l.id}
                      className="flex items-center gap-2.5 rounded-[8px] px-3 py-2"
                      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                    >
                      <div
                        className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[6px]"
                        style={l.successful
                          ? { background: 'var(--tint-emerald)', color: 'var(--emerald)' }
                          : { background: 'var(--tint-red)', color: 'var(--red)' }
                        }
                      >
                        <Smartphone size={12} strokeWidth={2.1} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] font-semibold" style={{ color: 'var(--text)' }}>{l.device}</span>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatDate(l.at)}</span>
                        </div>
                        <div className="text-[10.5px]" style={{ color: 'var(--text-light)' }}>
                          {l.location} · {l.ip}
                          {!l.successful && <span className="ml-1 font-bold" style={{ color: 'var(--red)' }}>· Failed</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit trail */}
              <div className="px-6 py-6">
                <SectionHeader
                  icon={<History size={13} />}
                  label="Activity Log"
                  action={<span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{u.activity.length} events</span>}
                />
                <div className="flex flex-col gap-2">
                  {u.activity.map(a => (
                    <div
                      key={a.id}
                      className="flex items-start gap-2.5 rounded-[8px] px-3 py-2"
                      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                    >
                      <div
                        className="mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[5px]"
                        style={{ background: 'white', color: 'var(--text-light)' }}
                      >
                        <Activity size={10} strokeWidth={2.1} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-medium" style={{ color: 'var(--text)' }}>{a.description}</div>
                        <div className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(a.at)} · {a.ip}{a.userAgent ? ` · ${a.userAgent}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function PerfStat({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div
      className="rounded-[10px] p-3 text-center"
      style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="mb-1 text-[9.5px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--text-light)' }}>
        {label}
      </div>
      <div className="text-[22px] font-extrabold tabular" style={{ color: accent, letterSpacing: '-0.03em' }}>
        {value}
      </div>
    </div>
  )
}
