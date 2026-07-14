'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Loader2, Trash2 } from 'lucide-react'
import { useToast } from '@/lib/stores/ToastStore'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

interface Option { id: number; name: string; allowedPages?: string | null }

const AVAILABLE_PAGES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'surveys', label: 'Surveys' },
  { key: 'survey-builder', label: 'Survey Builder' },
  { key: 'responses', label: 'Responses' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'reports', label: 'Reports' },
  { key: 'users', label: 'Users' },
  { key: 'branches', label: 'Branches' },
  { key: 'employee-surveys', label: 'Employee Surveys' },
  { key: 'audit-log', label: 'Audit Log' },
  { key: 'settings', label: 'Settings' },
]

export function CreateUserModal({ open, onClose, onCreated }: Props) {
  const toast = useToast()
  const [roles, setRoles] = useState<Option[]>([])
  const [departments, setDepartments] = useState<Option[]>([])
  const [branches, setBranches] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)

  const [customRole, setCustomRole] = useState(false)
  const [customRoleName, setCustomRoleName] = useState('')
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])

  const [form, setForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    roleId: '',
    departmentId: '',
    branchId: '',
  })

  useEffect(() => {
    if (!open) return
    const randId = `EMP${Math.floor(1000 + Math.random() * 9000)}`
    setForm(p => ({ ...p, employeeId: randId }))
    Promise.all([
      fetch('/api/roles', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      fetch('/api/departments', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      fetch('/api/branches', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
    ]).then(([r, d, b]) => {
      setRoles(r?.data ?? [])
      setDepartments(d?.data ?? [])
      setBranches(b?.data ?? [])
    }).catch(() => { /* ignore */ })
  }, [open])

  useEffect(() => {
    if (customRole) {
      setSelectedPages([])
    } else if (form.roleId) {
      const roleObj = roles.find(r => String(r.id) === form.roleId)
      if (roleObj) {
        try {
          // If the role has explicitly defined pages, use them.
          // If null (no restriction set in DB), show all pages selected so admin can uncheck what they want.
          const pages = roleObj.allowedPages
            ? JSON.parse(roleObj.allowedPages)
            : AVAILABLE_PAGES.map(p => p.key)
          setSelectedPages(pages)
        } catch {
          setSelectedPages(AVAILABLE_PAGES.map(p => p.key))
        }
      }
    } else {
      setSelectedPages([])
    }
  }, [form.roleId, customRole, roles])

  function reset() {
    setForm({ employeeId: '', name: '', email: '', password: '', phone: '', roleId: '', departmentId: '', branchId: '' })
    setCustomRole(false)
    setCustomRoleName('')
    setSelectedPages([])
    setSelectedBranches([])
    setSelectedDepartments([])
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function deleteRole(id: string) {
    if (!confirm('Are you sure you want to delete this custom role?')) return
    try {
      const res = await fetch(`/api/roles?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const js = await res.json()
        toast.error('Error', js.error || 'Failed to delete role')
        return
      }
      toast.success('Deleted', 'Role removed successfully')
      setForm(p => ({ ...p, roleId: '' }))
      setRoles(prev => prev.filter(r => String(r.id) !== id))
    } catch {
      toast.error('Error', 'Network error while deleting role')
    }
  }

  async function handleSubmit() {
    if (!form.employeeId.trim()) { toast.error('Validation', 'Employee ID is required.'); return }
    if (!form.name.trim()) { toast.error('Validation', 'Name is required.'); return }
    if (!form.email.trim()) { toast.error('Validation', 'Email is required.'); return }
    if (form.password.length < 8) { toast.error('Validation', 'Password must be at least 8 characters.'); return }
    if (!customRole && !form.roleId) { toast.error('Validation', 'Role is required.'); return }
    if (customRole && !customRoleName.trim()) { toast.error('Validation', 'Custom role name is required.'); return }

    setLoading(true)
    try {
      let finalRoleId = form.roleId

      // If custom role is checked, upsert/create it first to get roleId
      if (customRole) {
        const roleRes = await fetch('/api/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: customRoleName.trim(),
            allowedPages: selectedPages,
          })
        })
        const roleJson = await roleRes.json()
        if (!roleRes.ok) {
          toast.error('Role Error', roleJson.error || 'Failed to create role.')
          setLoading(false)
          return
        }
        finalRoleId = String(roleJson.data.id)
      }

      let allowedPagesOverride: string[] | null = null

      if (!customRole) {
        const selectedRoleObj = roles.find(r => String(r.id) === finalRoleId)
        const defaultPages = selectedRoleObj?.allowedPages ? JSON.parse(selectedRoleObj.allowedPages) : []
        const isModified = JSON.stringify([...selectedPages].sort()) !== JSON.stringify([...defaultPages].sort())
        if (isModified) {
          allowedPagesOverride = selectedPages
        }
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: form.employeeId.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          roleId: parseInt(finalRoleId),
          departmentId: form.departmentId ? parseInt(form.departmentId) : undefined,
          branchId: form.branchId ? parseInt(form.branchId) : undefined,
          isActive: true,
          visibleBranches: selectedBranches.length > 0 ? selectedBranches : null,
          visibleDepartments: selectedDepartments.length > 0 ? selectedDepartments : null,
          allowedPages: allowedPagesOverride,

        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error('Failed', json.error || `HTTP ${res.status}`)
        return
      }
      toast.success('User created', `${form.name} has been added successfully.`)
      handleClose()
      onCreated()
    } catch {
      toast.error('Network error', 'Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  const labelCls = 'block text-[10.5px] font-bold uppercase tracking-[0.08em] mb-1.5'
  const inputBase = 'w-full rounded-[9px] border bg-white px-3 py-2 text-[12px] font-medium outline-none transition-all focus:ring-2'
  const inputStyle = { borderColor: 'var(--border)', color: 'var(--text)' }

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
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px] bg-white"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px]" style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}>
                  <UserPlus size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-[15px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>Create User</h2>
                  <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>Add a new team member</p>
                </div>
              </div>
              <button onClick={handleClose} className="flex items-center justify-center text-center rounded-[8px] p-2 transition-all " style={{ color: 'var(--text-light)' }} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: 'var(--text-light)' }}>Employee ID *</label>
                    <input className={inputBase} style={inputStyle} placeholder="EMP006" value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: 'var(--text-light)' }}>Phone</label>
                    <input className={inputBase} style={inputStyle} placeholder="+971..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={{ color: 'var(--text-light)' }}>Full Name *</label>
                  <input className={inputBase} style={inputStyle} placeholder="Ahmed Al Rashid" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls} style={{ color: 'var(--text-light)' }}>Email *</label>
                  <input type="email" className={inputBase} style={inputStyle} placeholder="ahmed@adntc.ae" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls} style={{ color: 'var(--text-light)' }}>Password *</label>
                  <input type="password" className={inputBase} style={inputStyle} placeholder="Min 8 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: 'var(--text-light)' }}>Department</label>
                    <select className={`${inputBase} cursor-pointer`} style={inputStyle} value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}>
                      <option value="">None</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: 'var(--text-light)' }}>Branch</label>
                    <select className={`${inputBase} cursor-pointer`} style={inputStyle} value={form.branchId} onChange={e => setForm(p => ({ ...p, branchId: e.target.value }))}>
                      <option value="">None</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                  <label className={labelCls} style={{ color: 'var(--text-light)' }}>Role Designation *</label>
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-1.5 text-[11.5px] font-semibold cursor-pointer" style={{ color: 'var(--text)' }}>
                      <input type="radio" name="roleMode" checked={!customRole} onChange={() => setCustomRole(false)} className="accent-[var(--primary)]" />
                      <span>Existing Role</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[11.5px] font-semibold cursor-pointer" style={{ color: 'var(--text)' }}>
                      <input type="radio" name="roleMode" checked={customRole} onChange={() => setCustomRole(true)} className="accent-[var(--primary)]" />
                      <span>Custom Role</span>
                    </label>
                  </div>

                  {customRole ? (
                    <div>
                      <input className={inputBase} style={inputStyle} placeholder="e.g. Customer Service" value={customRoleName} onChange={e => setCustomRoleName(e.target.value)} />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select className={`${inputBase} cursor-pointer`} style={inputStyle} value={form.roleId} onChange={e => setForm(p => ({ ...p, roleId: e.target.value }))}>
                        <option value="">Select Existing…</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      {form.roleId && !['Admin', 'Manager', 'Viewer'].includes(roles.find(r => String(r.id) === form.roleId)?.name || '') && (
                        <button
                          onClick={() => deleteRole(form.roleId)}
                          className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[9px] border bg-white transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-light)' }}
                          title="Delete custom role"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelCls} style={{ color: 'var(--text-light)' }}>Page Module Access Control</label>
                      {!customRole && form.roleId && (
                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                          Pre-filled from role · editable
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-[9px] border bg-[var(--bg-subtle)]" style={{ borderColor: 'var(--border)' }}>
                      {AVAILABLE_PAGES.map(pg => {
                        const isChecked = selectedPages.includes(pg.key)
                        return (
                          <label key={pg.key} className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text)]">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPages(prev => [...prev, pg.key])
                                } else {
                                  setSelectedPages(prev => prev.filter(k => k !== pg.key))
                                }
                              }}
                              className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)] cursor-pointer"
                            />
                            <span>{pg.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className={labelCls} style={{ color: 'var(--text-light)' }}>Visible Branches Override</label>
                      <div className="flex flex-col gap-2 p-3 rounded-[9px] border bg-[var(--bg-subtle)] max-h-[140px] overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
                        {branches.map(b => {
                          const isChecked = selectedBranches.includes(b.name)
                          return (
                            <label key={b.id} className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text)]">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBranches(prev => [...prev, b.name])
                                  } else {
                                    setSelectedBranches(prev => prev.filter(n => n !== b.name))
                                  }
                                }}
                                className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]"
                              />
                              <span>{b.name}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className={labelCls} style={{ color: 'var(--text-light)' }}>Visible Depts Override</label>
                      <div className="flex flex-col gap-2 p-3 rounded-[9px] border bg-[var(--bg-subtle)] max-h-[140px] overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
                        {departments.map(d => {
                          const isChecked = selectedDepartments.includes(d.name)
                          return (
                            <label key={d.id} className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text)]">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedDepartments(prev => [...prev, d.name])
                                  } else {
                                    setSelectedDepartments(prev => prev.filter(n => n !== d.name))
                                  }
                                }}
                                className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]"
                              />
                              <span>{d.name}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
              <button onClick={handleClose} className="flex items-center justify-center text-center rounded-[9px] border px-6 py-3 text-[12px] font-semibold transition-all" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center text-center gap-2.5 rounded-[9px] px-6 py-3 text-[12px] font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'var(--primary)' }}
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                {loading ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
