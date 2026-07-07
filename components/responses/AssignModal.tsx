'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Loader2 } from 'lucide-react'
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
}

export function AssignModal({ open, onClose, responseId, onAssigned }: Props) {
  const toast = useToast()
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  useEffect(() => {
    if (!open) return
    fetch('/api/users?pageSize=100', { cache: 'no-store' })
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
          }))
        setUsers(activeUsers)
      })
      .catch(() => { /* ignore */ })
  }, [open])

  function handleClose() {
    setSelectedUserId('')
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
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95vw] max-w-[440px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px] bg-white"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
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
              <button onClick={handleClose} className="flex items-center justify-center text-center rounded-[8px] p-2 transition-all " style={{ color: 'var(--text-light)' }} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <div>
                <label className={labelCls} style={{ color: 'var(--text-light)' }}>Select User</label>
                <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="py-4 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading users…</div>
                  ) : (
                    users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUserId(String(u.id))}
                        className="flex items-center gap-2.5 rounded-[10px] border-2 px-3 py-2.5 text-left text-[12px] font-medium transition-all"
                        style={selectedUserId === String(u.id)
                          ? { borderColor: 'var(--primary)', background: 'var(--accent-soft)', color: 'var(--primary)' }
                          : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                        }
                      >
                        <div
                          className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ background: 'var(--primary)' }}
                        >
                          {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{u.name}</div>
                          <div className="text-[10.5px] truncate" style={{ color: 'var(--text-light)' }}>
                            {u.employeeId} · {u.role}{u.department ? ` · ${u.department}` : ''}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
              <button onClick={handleClose} className="flex items-center justify-center text-center rounded-[9px] border px-6 py-3 text-[12px] font-semibold transition-all" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={loading || !selectedUserId}
                className="flex items-center justify-center text-center gap-2.5 rounded-[9px] px-6 py-3 text-[12px] font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'var(--primary)' }}
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                {loading ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
