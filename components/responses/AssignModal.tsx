'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Loader2, Search, Building2 } from 'lucide-react'
import { useToast } from '@/lib/stores/ToastStore'

interface Props {
  open: boolean
  onClose: () => void
  responseId: string | null
  onAssigned: () => void
}

interface UserOption {
  id: number
  name: string
  email: string
  employeeId: string
  role: string
  department: string | null
  branch: string | null
  branchId: number | null
}

interface BranchOption {
  id: number
  name: string
}

export function AssignModal({ open, onClose, responseId, onAssigned }: Props) {
  const toast = useToast()
  const [users, setUsers] = useState<UserOption[]>([])
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  // Search + branch filter states
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState<string>('all')

  useEffect(() => {
    if (!open) return

    // Fetch users
    fetch('/api/users?pageSize=500', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const activeUsers = json.data
          .filter((u: any) => u.isActive && (u.roleAllowedPages ?? []).includes('assignments'))
          .map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            employeeId: u.employeeId,
            role: u.role,
            department: u.department,
            branch: u.branch,
            branchId: u.branchId,
          }))
        setUsers(activeUsers)
      })
      .catch(() => { /* ignore */ })

    // Fetch branches for filter
    fetch('/api/branches', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data) setBranches(json.data)
      })
      .catch(() => { /* ignore */ })
  }, [open])

  function handleClose() {
    setSelectedUserId('')
    setSearch('')
    setBranchFilter('all')
    onClose()
  }

  async function handleAssign() {
    if (!responseId || !selectedUserId) return
    setLoading(true)
    try {
      const numericId = responseId.replace(/^RSP-/, '')
      const res = await fetch(`/api/responses/${numericId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: parseInt(selectedUserId) }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error('Assignment failed', json.error || `HTTP ${res.status}`)
        return
      }
      const assignedUser = users.find(u => u.id === parseInt(selectedUserId))
      toast.success('Response assigned', `Assigned to ${assignedUser?.name ?? 'user'} successfully.`)
      handleClose()
      onAssigned()
    } catch {
      toast.error('Network error', 'Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  // Filter users by search query and branch
  const filteredUsers = useMemo(() => {
    let result = users
    if (branchFilter !== 'all') {
      result = result.filter(u => String(u.branchId) === branchFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q) ||
        (u.department ?? '').toLowerCase().includes(q)
      )
    }
    return result
  }, [users, search, branchFilter])

  const labelCls = 'block text-[10.5px] font-bold uppercase tracking-[0.08em] mb-1.5'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95vw] max-w-[460px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px]" style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}>
                  <UserPlus size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-[15px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>Assign Response</h2>
                  <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>{responseId}</p>
                </div>
              </div>
              <button onClick={handleClose} className="flex items-center justify-center rounded-[8px] p-2 transition-all" style={{ color: 'var(--text-light)' }} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {/* Search + Branch filter bar */}
            <div className="flex items-center gap-2 px-5 pt-4 pb-2">
              {/* Search input */}
              <div
                className="flex flex-1 items-center gap-2 rounded-[9px] border px-3 py-2 transition-all focus-within:ring-2"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-subtle)',
                  // @ts-ignore
                  '--tw-ring-color': 'var(--accent-soft)',
                }}
              >
                <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search by name, email, ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-[12px] font-medium outline-none"
                  style={{ color: 'var(--text)' }}
                  autoFocus
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }}>
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Branch filter */}
              <div className="relative flex items-center">
                <Building2 size={13} className="pointer-events-none absolute left-2.5" style={{ color: 'var(--text-muted)' }} />
                <select
                  value={branchFilter}
                  onChange={e => setBranchFilter(e.target.value)}
                  className="h-[36px] appearance-none rounded-[9px] border pl-7 pr-3 text-[11.5px] font-medium outline-none transition-all cursor-pointer"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text)',
                  }}
                >
                  <option value="all">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={String(b.id)}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Result count */}
            <div className="px-5 pb-1.5">
              <span className="text-[10.5px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {/* Body — scrollable user list */}
            <div className="flex-1 overflow-y-auto px-5 pb-3">
              <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
                {users.length === 0 ? (
                  <div className="py-6 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    <Loader2 size={18} className="animate-spin mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    Loading users…
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="py-6 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    No users match your search.
                  </div>
                ) : (
                  filteredUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUserId(String(u.id))}
                      className="flex items-center gap-2.5 rounded-[10px] border-2 px-3 py-2.5 text-left text-[12px] font-medium transition-all"
                      style={selectedUserId === String(u.id)
                        ? { borderColor: 'var(--primary)', background: 'var(--accent-soft)', color: 'var(--primary)' }
                        : { borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }
                      }
                    >
                      <div
                        className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: selectedUserId === String(u.id) ? 'var(--primary)' : 'var(--text-light)' }}
                      >
                        {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate" style={{ color: 'var(--text)' }}>{u.name}</div>
                        <div className="text-[10.5px] truncate flex items-center gap-1.5" style={{ color: 'var(--text-light)' }}>
                          <span>{u.employeeId}</span>
                          <span style={{ color: 'var(--border-strong)' }}>·</span>
                          <span>{u.role}</span>
                          {u.branch && (
                            <>
                              <span style={{ color: 'var(--border-strong)' }}>·</span>
                              <span>{u.branch}</span>
                            </>
                          )}
                          {u.department && (
                            <>
                              <span style={{ color: 'var(--border-strong)' }}>·</span>
                              <span>{u.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {selectedUserId === String(u.id) && (
                        <div className="flex-shrink-0 rounded-full w-4 h-4 flex items-center justify-center text-white text-[9px] font-bold" style={{ background: 'var(--primary)' }}>✓</div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
              {selectedUserId ? (
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-light)' }}>
                  Assigning to: <strong style={{ color: 'var(--text)' }}>{users.find(u => u.id === parseInt(selectedUserId))?.name}</strong>
                </span>
              ) : (
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Select a user to assign</span>
              )}
              <div className="flex items-center gap-2">
                <button onClick={handleClose} className="flex items-center justify-center rounded-[9px] border px-5 py-2.5 text-[12px] font-semibold transition-all" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={loading || !selectedUserId}
                  className="flex items-center justify-center gap-2 rounded-[9px] px-5 py-2.5 text-[12px] font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: 'var(--primary)' }}
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                  {loading ? 'Assigning…' : 'Assign'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
