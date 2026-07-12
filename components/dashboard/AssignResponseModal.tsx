'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, Building2, UserPlus } from 'lucide-react'
import { useBranchOptions } from '@/lib/hooks/useBranches'

interface User {
  id: number
  employeeId: string
  name: string
  role: string
  department: string | null
  branchId: number | null
  branchName: string | null
}

interface AssignResponseModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (userId: number) => void
  responseId: string | null
}

export function AssignResponseModal({ isOpen, onClose, onAssign, responseId }: AssignResponseModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState('all')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => { setMounted(true) }, [])

  const branchOptions = useBranchOptions()

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setSelectedUserId(null)
      setSearch('')
      setBranchFilter('all')
      fetch('/api/users?pageSize=100&isActive=true', { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (json?.data) {
            setUsers(json.data.map((u: any) => ({
              id: u.id,
              employeeId: u.employeeId || 'N/A',
              name: u.name,
              role: u.role || 'User',
              department: u.department || null,
              branchId: u.branchId || null,
              branchName: u.branch || null,
            })))
          }
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen])

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                            u.employeeId.toLowerCase().includes(search.toLowerCase())
      const matchesBranch = branchFilter === 'all' || u.branchName === branchFilter
      return matchesSearch && matchesBranch
    })
  }, [users, search, branchFilter])

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-fade-in">
      <div 
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[95vw] max-w-[400px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#F8FAFC] px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-[var(--primary)] shadow-sm">
              <UserPlus size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[18px] font-extrabold text-[#0F172A] tracking-tight">Assign Response</h2>
              <p className="text-[13px] font-medium text-slate-500">{responseId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search user name..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-[10px] border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-[13px] font-medium outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
              />
            </div>
            <div className="relative w-40">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={branchFilter}
                onChange={e => setBranchFilter(e.target.value)}
                className="w-full appearance-none rounded-[10px] border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-8 text-[13px] font-medium outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
              >
                <option value="all">All Branches</option>
                {branchOptions.filter(b => b.value !== 'all').map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Select User</p>
        </div>

        {/* User List */}
        <div className="px-6 pb-6 max-h-[340px] overflow-y-auto rs-scroll">
          {loading ? (
            <div className="py-10 text-center text-[13px] font-medium text-slate-500">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-[13px] font-medium text-slate-500">No users found</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredUsers.map(u => {
                const isSelected = selectedUserId === u.id
                const initials = u.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`flex items-center gap-4 rounded-[12px] border p-3.5 text-left transition-all ${
                      isSelected 
                        ? 'border-[var(--primary)] bg-[var(--tint-blue)] shadow-sm' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B4A8B] text-[13px] font-bold text-white shadow-sm">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[14.5px] font-bold truncate ${isSelected ? 'text-[#0B4A8B]' : 'text-slate-700'}`}>
                        {u.name}
                      </p>
                      <p className="mt-0.5 text-[11.5px] font-medium text-slate-500 truncate">
                        {u.employeeId} · {u.role}{u.department ? ` · ${u.department}` : ''}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-[10px] border border-gray-200 bg-white px-5 py-2.5 text-[13px] font-bold text-slate-600 transition-colors hover:bg-gray-50 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedUserId) onAssign(selectedUserId)
            }}
            disabled={!selectedUserId}
            className="flex items-center gap-2 rounded-[10px] bg-[#7595B4] px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#5C7D9E] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <UserPlus size={16} strokeWidth={2.5} />
            Assign
          </button>
        </div>
      </div>
    </div>
  , document.body)
}

