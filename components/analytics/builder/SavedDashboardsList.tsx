'use client'

import * as Icons from 'lucide-react'
import { MoreHorizontal, Trash2, Copy, Check, Plus } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAnalytics } from '../state/useAnalytics'
import { SavedDashboard } from '@/types/analytics'

function resolveIcon(name: string): Icons.LucideIcon {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name]
  return Icon ?? Icons.LayoutDashboard
}

function timeAgo(iso: string): string {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)   return `${days} days ago`
  if (days < 30)  return `${Math.floor(days / 7)} wk ago`
  return `${Math.floor(days / 30)} mo ago`
}

function DashboardCard({ dashboard }: { dashboard: SavedDashboard }) {
  const { state, dispatch } = useAnalytics()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const Icon = resolveIcon(dashboard.icon)
  const isActive = state.activeDashboardId === dashboard.id

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <div
      className={`group relative flex min-w-[200px] max-w-[200px] cursor-pointer flex-col gap-2 rounded-[10px] border p-3 transition-all
        ${isActive
          ? 'border-[#0B4A8B] bg-[rgba(11, 74, 139,0.08)]'
          : 'border-[#E6EDF3] bg-[#FFFFFF] hover:border-[#B0B8C4]'
        }`}
      onClick={() => dispatch({ type: 'LOAD_DASHBOARD', id: dashboard.id })}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[rgba(11, 74, 139,0.12)]">
          <Icon size={13} className="text-[#0B4A8B]" />
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
            className="flex h-6 w-6 items-center justify-center rounded-[4px] text-[#B0B8C4] opacity-0 transition-opacity hover:bg-[#F5F7FA] hover:text-[#333333] group-hover:opacity-100"
            aria-label="More actions"
          >
            <MoreHorizontal size={12} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-[calc(100%+4px)] z-50 w-40 overflow-hidden rounded-[7px] border border-[#E6EDF3] bg-[#FFFFFF] py-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => { dispatch({ type: 'LOAD_DASHBOARD', id: dashboard.id }); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-6 py-3 text-[11px] text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333]"
              >
                <Check size={11} /> Load
              </button>
              <button
                onClick={() => {
                  dispatch({
                    type: 'SAVE_DASHBOARD',
                    name: `${dashboard.name} (Copy)`,
                    description: dashboard.description,
                  })
                  setMenuOpen(false)
                }}
                className="flex w-full items-center gap-2 px-6 py-3 text-[11px] text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333]"
              >
                <Copy size={11} /> Duplicate
              </button>
              <button
                onClick={() => { dispatch({ type: 'DELETE_DASHBOARD', id: dashboard.id }); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-6 py-3 text-[11px] text-[#E5484D] hover:bg-[rgba(229, 72, 77,0.08)]"
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-[12px] font-semibold text-[#333333]">{dashboard.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-[#8A94A6]">{dashboard.description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-[#E6EDF3] pt-2 text-[10px] text-[#B0B8C4]">
        <span>{dashboard.widgetIds.length} widgets</span>
        <span>{timeAgo(dashboard.lastModified)}</span>
      </div>
    </div>
  )
}

export function SavedDashboardsList() {
  const { state, dispatch } = useAnalytics()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold tracking-[-0.2px] text-[#333333]">Saved Dashboards</h2>
          <p className="text-[11px] text-[#8A94A6]">Click a card to load · persisted to your browser</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'SAVE_DASHBOARD', name: `Untitled ${new Date().toLocaleDateString()}` })}
          className="inline-flex h-7 items-center gap-2.5 rounded-[7px] border border-[#E6EDF3] bg-[#FFFFFF] px-2.5 text-[11px] font-medium text-[#8A94A6] transition-all hover:border-[#B0B8C4] hover:text-[#333333]"
        >
          <Plus size={11} />
          Save Current
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {state.savedDashboards.map(d => (
          <DashboardCard key={d.id} dashboard={d} />
        ))}
        {state.savedDashboards.length === 0 && (
          <div className="flex h-[120px] w-full items-center justify-center rounded-[10px] border border-dashed border-[#E6EDF3] text-[11px] text-[#B0B8C4]">
            No saved dashboards yet — click "Save Current" to create one
          </div>
        )}
      </div>
    </div>
  )
}
