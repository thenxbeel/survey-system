'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Briefcase, Plus, Pencil, Trash2, X, Loader2, Check,
  AlertTriangle, MapPin, Users, Layers, Tag,
} from 'lucide-react'
import { useToast } from '@/lib/stores/ToastStore'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Branch {
  id: number
  name: string
  location: string | null
  userCount: number
  departmentCount: number
}

interface Department {
  id: number
  name: string
  description: string | null
  branchId: number | null
  branch: string | null
  userCount: number
}

interface Touchpoint {
  id: number
  name: string
  description: string | null
  surveyCount: number
  createdAt: string
  updatedAt: string
}

type Tab = 'branches' | 'departments' | 'touchpoints'

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function BranchesPage() {
  const [tab, setTab] = useState<Tab>('branches')
  const toast = useToast()

  return (
    <div className="flex flex-col gap-6 p-7 animate-fade-up">
      {/* Header */}
      <div className="animate-fade-up flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-[-0.02em]" style={{ color: 'var(--text)' }}>
            Branches & Departments
          </h1>
          <p className="mt-0.5 text-[12.5px]" style={{ color: 'var(--text-light)' }}>
            Manage organizational structure. Branches contain departments and users; departments group users.
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div
        className="inline-flex rounded-[10px] p-1"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', width: 'fit-content' }}
      >
        <TabButton active={tab === 'branches'} onClick={() => setTab('branches')} icon={Building2}>
          Branches
        </TabButton>
        <TabButton active={tab === 'departments'} onClick={() => setTab('departments')} icon={Briefcase}>
          Departments
        </TabButton>
        <TabButton active={tab === 'touchpoints'} onClick={() => setTab('touchpoints')} icon={Tag}>
          Touchpoints
        </TabButton>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'branches' && <BranchesTab />}
          {tab === 'departments' && <DepartmentsTab />}
          {tab === 'touchpoints' && <TouchpointsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Tab Button ─────────────────────────────────────────────────────────────

function TabButton({
  active, onClick, icon: Icon, children,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Building2
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-[8px] px-6 py-3 text-[12px] font-semibold transition-all items-center justify-center text-center"
      style={active
        ? { background: '#ffffff', color: 'var(--primary)', boxShadow: '0 1px 3px rgba(13,27,46,0.08)' }
        : { color: 'var(--text-secondary)' }
      }
    >
      <Icon size={13} strokeWidth={2.1} style={active ? { color: 'var(--primary)' } : { color: 'var(--text-light)' }} />
      {children}
    </button>
  )
}

// ─── Branches Tab ───────────────────────────────────────────────────────────

function BranchesTab() {
  const toast = useToast()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Branch | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null)

  const fetchBranches = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/branches', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json().catch(() => ({}))
      setBranches(json.data ?? [])
    } catch {
      setBranches([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBranches() }, [fetchBranches])

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
          {loading ? 'Loading…' : `${branches.length} branch${branches.length === 1 ? '' : 'es'}`}
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="inline-flex h-[34px] items-center gap-2.5 rounded-[9px] px-3 text-[12px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}
        >
          <Plus size={13} strokeWidth={2.2} /> New Branch
        </button>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-[18px] bg-white"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <Th>Branch</Th>
              <Th>Location</Th>
              <Th className="text-center">Departments</Th>
              <Th className="text-center">Users</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-[12px]" style={{ color: 'var(--text-light)' }}>
                <Loader2 size={16} className="mr-2 inline animate-spin" /> Loading branches…
              </td></tr>
            ) : branches.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-[12px]" style={{ color: 'var(--text-light)' }}>
                No branches yet. Click "New Branch" to create one.
              </td></tr>
            ) : branches.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-[32px] w-[32px] items-center justify-center rounded-[9px]"
                      style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}
                    >
                      <Building2 size={14} strokeWidth={2.1} />
                    </div>
                    <span className="text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>{b.name}</span>
                  </div>
                </Td>
                <Td>
                  {b.location ? (
                    <span className="flex items-center gap-1 text-[11.5px]" style={{ color: 'var(--text-light)' }}>
                      <MapPin size={11} /> {b.location}
                    </span>
                  ) : (
                    <span className="text-[11.5px]" style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </Td>
                <Td className="text-center">
                  <CountBadge count={b.departmentCount} />
                </Td>
                <Td className="text-center">
                  <CountBadge count={b.userCount} />
                </Td>
                <Td className="text-right">
                  <RowActions
                    onEdit={() => { setEditing(b); setModalOpen(true) }}
                    onDelete={() => setDeleteTarget(b)}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <BranchModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); fetchBranches() }}
      />
      <DeleteConfirmModal
        open={!!deleteTarget}
        target={deleteTarget}
        kind="branch"
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => { setDeleteTarget(null); fetchBranches() }}
      />
    </div>
  )
}

// ─── Departments Tab ────────────────────────────────────────────────────────

function DepartmentsTab() {
  const toast = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [dRes, bRes] = await Promise.all([
        fetch('/api/departments', { cache: 'no-store' }),
        fetch('/api/branches', { cache: 'no-store' }),
      ])
      const [dJson, bJson] = await Promise.all([dRes.json(), bRes.json()])
      setDepartments(dJson.data ?? [])
      setBranches(bJson.data ?? [])
    } catch {
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
          {loading ? 'Loading…' : `${departments.length} department${departments.length === 1 ? '' : 's'}`}
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="inline-flex h-[34px] items-center gap-2.5 rounded-[9px] px-3 text-[12px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}
        >
          <Plus size={13} strokeWidth={2.2} /> New Department
        </button>
      </div>

      <div
        className="overflow-hidden rounded-[18px] bg-white"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <Th>Department</Th>
              <Th>Description</Th>
              <Th>Branch</Th>
              <Th className="text-center">Users</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-[12px]" style={{ color: 'var(--text-light)' }}>
                <Loader2 size={16} className="mr-2 inline animate-spin" /> Loading departments…
              </td></tr>
            ) : departments.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-[12px]" style={{ color: 'var(--text-light)' }}>
                No departments yet. Click "New Department" to create one.
              </td></tr>
            ) : departments.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-[32px] w-[32px] items-center justify-center rounded-[9px]"
                      style={{ background: 'var(--tint-emerald)', color: 'var(--emerald)' }}
                    >
                      <Briefcase size={14} strokeWidth={2.1} />
                    </div>
                    <span className="text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>{d.name}</span>
                  </div>
                </Td>
                <Td>
                  {d.description ? (
                    <span className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>{d.description}</span>
                  ) : (
                    <span className="text-[11.5px]" style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </Td>
                <Td>
                  {d.branch ? (
                    <span className="text-[11.5px] font-medium" style={{ color: 'var(--text-secondary)' }}>{d.branch}</span>
                  ) : (
                    <span className="text-[11.5px]" style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </Td>
                <Td className="text-center">
                  <CountBadge count={d.userCount} />
                </Td>
                <Td className="text-right">
                  <RowActions
                    onEdit={() => { setEditing(d); setModalOpen(true) }}
                    onDelete={() => setDeleteTarget(d)}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DepartmentModal
        open={modalOpen}
        editing={editing}
        branches={branches}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); fetchAll() }}
      />
      <DeleteConfirmModal
        open={!!deleteTarget}
        target={deleteTarget}
        kind="department"
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => { setDeleteTarget(null); fetchAll() }}
      />
    </div>
  )
}

// ─── Touchpoints Tab ────────────────────────────────────────────────────────

function TouchpointsTab() {
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Touchpoint | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Touchpoint | null>(null)

  const fetchTouchpoints = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/touchpoints', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json().catch(() => ({}))
      setTouchpoints(json.data ?? [])
    } catch {
      setTouchpoints([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTouchpoints() }, [fetchTouchpoints])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
          {loading ? 'Loading…' : `${touchpoints.length} touchpoint${touchpoints.length === 1 ? '' : 's'}`}
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="inline-flex h-[34px] items-center gap-2.5 rounded-[9px] px-3 text-[12px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}
        >
          <Plus size={13} strokeWidth={2.2} /> New Touchpoint
        </button>
      </div>

      <div
        className="overflow-hidden rounded-[18px] bg-white"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <Th>Touchpoint</Th>
              <Th>Description</Th>
              <Th className="text-center">Surveys</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center text-[12px]" style={{ color: 'var(--text-light)' }}>
                <Loader2 size={16} className="mr-2 inline animate-spin" /> Loading touchpoints…
              </td></tr>
            ) : touchpoints.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-[12px]" style={{ color: 'var(--text-light)' }}>
                No touchpoints yet. Click "New Touchpoint" to create one.
              </td></tr>
            ) : touchpoints.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-[32px] w-[32px] items-center justify-center rounded-[9px]"
                      style={{ background: 'var(--tint-amber)', color: 'var(--tint-amber-fg)' }}
                    >
                      <Tag size={14} strokeWidth={2.1} />
                    </div>
                    <span className="text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>{t.name}</span>
                  </div>
                </Td>
                <Td>
                  {t.description ? (
                    <span className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>{t.description}</span>
                  ) : (
                    <span className="text-[11.5px]" style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </Td>
                <Td className="text-center">
                  <CountBadge count={t.surveyCount} />
                </Td>
                <Td className="text-right">
                  <RowActions
                    onEdit={() => { setEditing(t); setModalOpen(true) }}
                    onDelete={() => setDeleteTarget(t)}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TouchpointModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); fetchTouchpoints() }}
      />
      <DeleteConfirmModal
        open={!!deleteTarget}
        target={deleteTarget}
        kind="touchpoint"
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => { setDeleteTarget(null); fetchTouchpoints() }}
      />
    </div>
  )
}

// ─── Touchpoint Modal (create/edit) ─────────────────────────────────────────

function TouchpointModal({
  open, editing, onClose, onSaved,
}: {
  open: boolean
  editing: Touchpoint | null
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setDescription(editing?.description ?? '')
    }
  }, [open, editing])

  async function handleSubmit() {
    if (!name.trim()) { toast.error('Validation', 'Touchpoint name is required.'); return }
    setLoading(true)
    try {
      const url = editing ? `/api/touchpoints/${editing.id}` : '/api/touchpoints'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      })
      // Parse JSON safely — the server always returns JSON, but a proxy /
      // middleware error could return HTML
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(editing ? 'Update failed' : 'Creation failed', json.error || `HTTP ${res.status}`)
        return
      }
      toast.success(editing ? 'Touchpoint updated' : 'Touchpoint created', `"${name.trim()}" saved successfully.`)
      onSaved()
    } catch (err) {
      // Log the actual error for debugging, then show a user-friendly message
      console.error('[TouchpointModal] submit failed:', err)
      toast.error('Network error', 'Could not reach the server. Please check that the dev server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} title={editing ? 'Edit Touchpoint' : 'New Touchpoint'} icon={Tag} accent="var(--tint-amber-fg)">
      <Field label="Name">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Claims Handling"
          className="h-[36px] w-full rounded-[9px] border bg-white px-3 text-[12px] font-medium outline-none transition-all focus:ring-2"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,74,139,0.1)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </Field>
      <Field label="Description">
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Customer feedback after claims processing"
          className="h-[36px] w-full rounded-[9px] border bg-white px-3 text-[12px] font-medium outline-none transition-all focus:ring-2"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,74,139,0.1)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </Field>
      <ModalFooter onClose={onClose} onSubmit={handleSubmit} loading={loading} submitLabel={editing ? 'Save Changes' : 'Create Touchpoint'} />
    </ModalShell>
  )
}

// ─── Shared table helpers ───────────────────────────────────────────────────

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em] ${className}`}
      style={{ color: 'var(--text-light)' }}
    >
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`} style={{ color: 'var(--text)' }}>{children}</td>
}

function CountBadge({ count }: { count: number }) {
  return (
    <span
      className="inline-flex min-w-[28px] items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-bold"
      style={{
        background: 'var(--tint-blue)',
        color: 'var(--primary)',
      }}
    >
      {count}
    </span>
  )
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={onEdit}
        className="flex items-center justify-center text-center rounded-[6px] p-2.5 transition-all "
        style={{ color: 'var(--text-light)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--tint-blue)'; e.currentTarget.style.color = 'var(--primary)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
        title="Edit"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={onDelete}
        className="flex items-center justify-center text-center rounded-[6px] p-2.5 transition-all "
        style={{ color: 'var(--text-light)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--tint-red)'; e.currentTarget.style.color = 'var(--red)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
        title="Delete"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ─── Branch Modal (create/edit) ─────────────────────────────────────────────

function BranchModal({
  open, editing, onClose, onSaved,
}: {
  open: boolean
  editing: Branch | null
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setLocation(editing?.location ?? '')
    }
  }, [open, editing])

  async function handleSubmit() {
    if (!name.trim()) { toast.error('Validation', 'Branch name is required.'); return }
    setLoading(true)
    try {
      const url = editing ? `/api/branches/${editing.id}` : '/api/branches'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), location: location.trim() || undefined }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(editing ? 'Update failed' : 'Creation failed', json.error || `HTTP ${res.status}`)
        return
      }
      toast.success(editing ? 'Branch updated' : 'Branch created', `"${name.trim()}" saved successfully.`)
      onSaved()
    } catch {
      toast.error('Network error', 'Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} title={editing ? 'Edit Branch' : 'New Branch'} icon={Building2}>
      <Field label="Name">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Abu Dhabi"
          className="h-[36px] w-full rounded-[9px] border bg-white px-3 text-[12px] font-medium outline-none transition-all focus:ring-2"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,74,139,0.1)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </Field>
      <Field label="Location">
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Abu Dhabi, UAE"
          className="h-[36px] w-full rounded-[9px] border bg-white px-3 text-[12px] font-medium outline-none transition-all focus:ring-2"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,74,139,0.1)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </Field>
      <ModalFooter onClose={onClose} onSubmit={handleSubmit} loading={loading} submitLabel={editing ? 'Save Changes' : 'Create Branch'} />
    </ModalShell>
  )
}

// ─── Department Modal (create/edit) ─────────────────────────────────────────

function DepartmentModal({
  open, editing, branches, onClose, onSaved,
}: {
  open: boolean
  editing: Department | null
  branches: Branch[]
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [branchId, setBranchId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setDescription(editing?.description ?? '')
      setBranchId(editing?.branchId != null ? String(editing.branchId) : '')
    }
  }, [open, editing])

  async function handleSubmit() {
    if (!name.trim()) { toast.error('Validation', 'Department name is required.'); return }
    setLoading(true)
    try {
      const url = editing ? `/api/departments/${editing.id}` : '/api/departments'
      const method = editing ? 'PUT' : 'POST'
      const body: any = { name: name.trim(), description: description.trim() || undefined }
      if (branchId) body.branchId = parseInt(branchId)
      else if (editing) body.branchId = null // allow clearing the branch
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(editing ? 'Update failed' : 'Creation failed', json.error || `HTTP ${res.status}`)
        return
      }
      toast.success(editing ? 'Department updated' : 'Department created', `"${name.trim()}" saved successfully.`)
      onSaved()
    } catch {
      toast.error('Network error', 'Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  const selectCls = 'h-[36px] w-full appearance-none rounded-[9px] border bg-white px-3 text-[12px] font-medium outline-none transition-all focus:ring-2 cursor-pointer'
  const selectStyle = { borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <ModalShell open={open} onClose={onClose} title={editing ? 'Edit Department' : 'New Department'} icon={Briefcase}>
      <Field label="Name">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Customer Experience"
          className="h-[36px] w-full rounded-[9px] border bg-white px-3 text-[12px] font-medium outline-none transition-all focus:ring-2"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,74,139,0.1)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </Field>
      <Field label="Description">
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. CX Team"
          className="h-[36px] w-full rounded-[9px] border bg-white px-3 text-[12px] font-medium outline-none transition-all focus:ring-2"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,74,139,0.1)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </Field>
      <Field label="Branch">
        <select
          value={branchId}
          onChange={e => setBranchId(e.target.value)}
          className={selectCls}
          style={selectStyle}
        >
          <option value="">— No branch —</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </Field>
      <ModalFooter onClose={onClose} onSubmit={handleSubmit} loading={loading} submitLabel={editing ? 'Save Changes' : 'Create Department'} />
    </ModalShell>
  )
}

// ─── Delete Confirmation Modal ──────────────────────────────────────────────

function DeleteConfirmModal({
  open, target, kind, onClose, onDeleted,
}: {
  open: boolean
  target: Branch | Department | Touchpoint | null
  kind: 'branch' | 'department' | 'touchpoint'
  onClose: () => void
  onDeleted: () => void
}) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  if (!target) return null

  const name = target.name
  const isBranch = kind === 'branch'
  const isDept = kind === 'department'
  const isTouchpoint = kind === 'touchpoint'
  const branchTarget = isBranch ? (target as Branch) : null
  const deptTarget = isDept ? (target as Department) : null
  const tpTarget = isTouchpoint ? (target as Touchpoint) : null

  // Determine if there are dependents (to show a warning in the dialog)
  const hasDependents = isBranch
    ? (branchTarget && (branchTarget.departmentCount > 0 || branchTarget.userCount > 0))
    : isDept
      ? (deptTarget && deptTarget.userCount > 0)
      : (tpTarget && tpTarget.surveyCount > 0)

  // Map kind → API path
  const apiPath = isBranch ? 'branches' : isDept ? 'departments' : 'touchpoints'
  const kindLabel = isBranch ? 'Branch' : isDept ? 'Department' : 'Touchpoint'

  async function handleDelete() {
    setLoading(true)
    try {
      const url = `/api/${apiPath}/${target!.id}`
      const res = await fetch(url, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error('Cannot delete', json.error || `HTTP ${res.status}`)
        onClose()
        return
      }
      toast.success('Deleted', `"${name}" was removed successfully.`)
      onDeleted()
    } catch {
      toast.error('Network error', 'Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} title={`Delete ${kindLabel}`} icon={AlertTriangle} accent="var(--red)">
      <div className="text-[12.5px]" style={{ color: 'var(--text)' }}>
        Are you sure you want to delete <strong>{name}</strong>?
      </div>
      {hasDependents ? (
        <div
          className="rounded-[9px] p-3 text-[11.5px] font-semibold"
          style={{ background: 'var(--tint-red)', color: 'var(--red)', border: '1px solid rgba(229,72,77,0.25)' }}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              <div>This {kindLabel.toLowerCase()} cannot be deleted because it is currently in use:</div>
              {isBranch && branchTarget && (
                <ul className="mt-1 ml-4 list-disc">
                  {branchTarget.departmentCount > 0 && <li>{branchTarget.departmentCount} department{branchTarget.departmentCount === 1 ? '' : 's'}</li>}
                  {branchTarget.userCount > 0 && <li>{branchTarget.userCount} user{branchTarget.userCount === 1 ? '' : 's'}</li>}
                </ul>
              )}
              {isDept && deptTarget && (
                <ul className="mt-1 ml-4 list-disc">
                  <li>{deptTarget.userCount} user{deptTarget.userCount === 1 ? '' : 's'}</li>
                </ul>
              )}
              {isTouchpoint && tpTarget && (
                <ul className="mt-1 ml-4 list-disc">
                  <li>{tpTarget.surveyCount} survey{tpTarget.surveyCount === 1 ? '' : 's'}</li>
                </ul>
              )}
              <div className="mt-1.5">Please reassign or remove the dependent records first.</div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-[9px] p-3 text-[11.5px]"
          style={{ background: 'var(--bg-subtle)', color: 'var(--text-light)', border: '1px solid var(--border)' }}
        >
          This {kindLabel.toLowerCase()} has no related records and can be safely deleted.
        </div>
      )}
      <ModalFooter
        onClose={onClose}
        onSubmit={handleDelete}
        loading={loading}
        submitLabel="Delete"
        submitVariant="danger"
        submitDisabled={!!hasDependents}
      />
    </ModalShell>
  )
}

// ─── Shared Modal primitives ────────────────────────────────────────────────

function ModalShell({
  open, onClose, title, icon: Icon, accent = 'var(--primary)', children,
}: {
  open: boolean
  onClose: () => void
  title: string
  icon: typeof Building2
  accent?: string
  children: React.ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95vw] max-w-[460px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px] bg-white"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px]" style={{ background: `${accent}1A`, color: accent }}>
                  <Icon size={15} strokeWidth={2.2} />
                </div>
                <h2 className="text-[15px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>{title}</h2>
              </div>
              <button onClick={onClose} className="flex items-center justify-center text-center rounded-[8px] p-2 transition-all " style={{ color: 'var(--text-light)' }} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10.5px] font-bold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--text-light)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function ModalFooter({
  onClose, onSubmit, loading, submitLabel, submitVariant = 'primary', submitDisabled = false,
}: {
  onClose: () => void
  onSubmit: () => void
  loading: boolean
  submitLabel: string
  submitVariant?: 'primary' | 'danger'
  submitDisabled?: boolean
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 16 }}>
      <button
        onClick={onClose}
        className="flex items-center justify-center text-center rounded-[9px] border px-6 py-3 text-[12px] font-semibold transition-all "
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={loading || submitDisabled}
        className="flex items-center gap-2.5 rounded-[9px] px-6 py-3 text-[12px] font-semibold text-white transition-all disabled:opacity-50 items-center justify-center text-center"
        style={{ background: submitVariant === 'danger' ? 'var(--red)' : 'var(--primary)' }}
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
        {loading ? 'Saving…' : submitLabel}
      </button>
    </div>
  )
}
