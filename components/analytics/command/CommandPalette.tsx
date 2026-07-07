'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import * as Icons from 'lucide-react'
import { Search, CornerDownLeft } from 'lucide-react'
import { useAnalytics } from '../state/useAnalytics'

// Command palette items — these are navigation/action shortcuts, not data.
const commandPaletteItems = [
  { id: 'cmd-overview',   group: 'Navigation', label: 'Go to Overview',        icon: 'LayoutDashboard', shortcut: 'G O' },
  { id: 'cmd-builder',    group: 'Navigation', label: 'Go to Visualization Builder', icon: 'BarChart3', shortcut: 'G B' },
  { id: 'cmd-custom',     group: 'Navigation', label: 'Go to Custom Dashboards', icon: 'LayoutGrid', shortcut: 'G C' },
  { id: 'cmd-ask',        group: 'Actions',    label: 'Ask Analytics',         icon: 'Sparkles', shortcut: 'A' },
  { id: 'cmd-export',     group: 'Actions',    label: 'Export Report',          icon: 'Download', shortcut: 'E' },
  { id: 'cmd-search',     group: 'Actions',    label: 'Search Surveys',         icon: 'Search', shortcut: '/' },
  { id: 'cmd-surveys',    group: 'Pages',      label: 'Survey Management',      icon: 'FileText' },
  { id: 'cmd-responses',  group: 'Pages',      label: 'Responses',              icon: 'MessageSquare' },
  { id: 'cmd-campaigns',  group: 'Pages',      label: 'Campaigns',              icon: 'Megaphone' },
  { id: 'cmd-reports',    group: 'Pages',      label: 'Reports',                icon: 'ClipboardList' },
  { id: 'cmd-users',      group: 'Pages',      label: 'User Management',        icon: 'Users' },
  { id: 'cmd-audit',      group: 'Pages',      label: 'Audit Log',              icon: 'Clock' },
]

interface PaletteItem {
  id: string
  group: string
  label: string
  icon: string
  shortcut?: string
}

function resolveIcon(name: string): Icons.LucideIcon {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name]
  return Icon ?? Icons.Circle
}

// Simple fuzzy match — matches all chars of query in order (case-insensitive)
function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

export function CommandPalette() {
  const { state, dispatch } = useAnalytics()
  const [query, setQuery]   = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const open = state.modals.command

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const filtered = useMemo<PaletteItem[]>(() => {
    if (!query.trim()) return commandPaletteItems
    return commandPaletteItems.filter(item =>
      fuzzyMatch(query, item.label) || fuzzyMatch(query, item.group)
    )
  }, [query])

  // Group items preserving order
  const grouped = useMemo(() => {
    const map = new Map<string, PaletteItem[]>()
    filtered.forEach(item => {
      const arr = map.get(item.group) ?? []
      arr.push(item)
      map.set(item.group, arr)
    })
    return Array.from(map.entries())
  }, [filtered])

  // Flatten for keyboard nav
  const flat = filtered

  useEffect(() => {
    if (active >= flat.length) setActive(0)
  }, [flat.length, active])

  if (!open) return null

  function close() {
    dispatch({ type: 'CLOSE_MODAL', modal: 'command' })
  }

  function execute(item: PaletteItem) {
    switch (item.id) {
      case 'nav-overview':   dispatch({ type: 'SET_TAB', tab: 'overview' }); break
      case 'nav-custom':     dispatch({ type: 'SET_TAB', tab: 'custom'   }); break
      case 'nav-builder':    dispatch({ type: 'SET_TAB', tab: 'builder'  }); break
      case 'act-ask':        dispatch({ type: 'OPEN_MODAL', modal: 'ask' }); break
      case 'act-export':     dispatch({ type: 'OPEN_MODAL', modal: 'export' }); break
      case 'act-new-viz':    dispatch({ type: 'OPEN_MODAL', modal: 'vizBuilder' }); break
      case 'act-add-widget': dispatch({ type: 'OPEN_MODAL', modal: 'addWidget' }); break
      case 'act-edit-mode':  dispatch({ type: 'TOGGLE_EDIT_MODE' }); break
      case 'dash-exec':      dispatch({ type: 'LOAD_DASHBOARD', id: 'd1' }); dispatch({ type: 'SET_TAB', tab: 'custom' }); break
      case 'dash-claims':    dispatch({ type: 'LOAD_DASHBOARD', id: 'd2' }); dispatch({ type: 'SET_TAB', tab: 'custom' }); break
      case 'dash-branch':    dispatch({ type: 'LOAD_DASHBOARD', id: 'd3' }); dispatch({ type: 'SET_TAB', tab: 'custom' }); break
      // Recent queries → open Ask Analytics
      case 'rec-1':          dispatch({ type: 'OPEN_MODAL', modal: 'ask' }); break
      case 'rec-2':          dispatch({ type: 'OPEN_MODAL', modal: 'ask' }); break
      case 'rec-3':          dispatch({ type: 'OPEN_MODAL', modal: 'ask' }); break
    }
    close()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(i => Math.min(i + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = flat[active]
      if (item) execute(item)
    }
  }

  let runningIndex = -1

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-[12px] border border-[#E6EDF3] bg-[#F5F7FA] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2.5 border-b border-[#E6EDF3] px-4 py-3">
          <Search size={15} className="text-[#B0B8C4]" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent text-[14px] text-[#333333] placeholder:text-[#B0B8C4] focus:outline-none"
          />
          <kbd className="rounded-[3px] border border-[#E6EDF3] bg-[#F5F7FA] px-1.5 py-0.5 font-mono text-[9px] text-[#8A94A6]">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto p-2.5">
          {flat.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-[12px] text-[#8A94A6]">No commands found</p>
              <p className="mt-0.5 text-[11px] text-[#B0B8C4]">Try a different search term</p>
            </div>
          )}

          {grouped.map(([group, items]) => (
            <div key={group} className="mb-1">
              <p className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B0B8C4]">{group}</p>
              {items.map(item => {
                runningIndex++
                const idx = runningIndex
                const isActive = idx === active
                const Icon = resolveIcon(item.icon)
                return (
                  <button
                    key={item.id}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => execute(item)}
                    className={`flex w-full items-center gap-3 rounded-[6px] px-2 py-2 text-left transition-colors
                      ${isActive ? 'bg-[#F5F7FA]' : 'hover:bg-[#F5F7FA]/50'}`}
                  >
                    <Icon size={14} className={isActive ? 'text-[#0B4A8B]' : 'text-[#8A94A6]'} />
                    <span className={`flex-1 text-[12px] ${isActive ? 'text-[#333333]' : 'text-[#8A94A6]'}`}>{item.label}</span>
                    {item.shortcut && (
                      <kbd className="rounded-[3px] border border-[#E6EDF3] bg-[#F5F7FA] px-1.5 py-0.5 font-mono text-[9px] text-[#8A94A6]">{item.shortcut}</kbd>
                    )}
                    {isActive && <CornerDownLeft size={11} className="text-[#B0B8C4]" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E6EDF3] px-6 py-3 text-[10px] text-[#B0B8C4]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="rounded-[3px] border border-[#E6EDF3] bg-[#F5F7FA] px-1 py-0.5 font-mono text-[9px] text-[#8A94A6]">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="rounded-[3px] border border-[#E6EDF3] bg-[#F5F7FA] px-1 py-0.5 font-mono text-[9px] text-[#8A94A6]">↵</kbd> select</span>
          </div>
          <span>ADNTC Analytics · ⌘K</span>
        </div>
      </div>
    </div>
  )
}
