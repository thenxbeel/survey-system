'use client'

import { createContext, useReducer, useEffect, type ReactNode } from 'react'
import {
  AnalyticsFilters, DEFAULT_FILTERS, TabKey, ModalKey, WidgetConfig, SavedDashboard,
} from '@/types/analytics'

// Default widget library — these are widget *configurations* (chart type +
// position), not business data. The widgets fetch their own live data.
const defaultWidgetLibrary: WidgetConfig[] = [
  { id: 'w1', title: 'Response Timeline', chartType: 'line',  w: 2, h: 1, metric: 'responses',   groupBy: 'date' },
  { id: 'w2', title: 'Volume by Survey',   chartType: 'bar',   w: 1, h: 1, metric: 'responses',   groupBy: 'survey' },
  { id: 'w3', title: 'NPS Distribution',   chartType: 'pie',   w: 1, h: 1, metric: 'responses',   groupBy: 'category' },
  { id: 'w4', title: 'Performance Radar',  chartType: 'radar', w: 1, h: 1, metric: 'rate',        groupBy: 'category' },
  { id: 'w5', title: 'Activity Heatmap',   chartType: 'heatmap', w: 1, h: 1, metric: 'responses', groupBy: 'date' },
]

// ─── State ─────────────────────────────────────────────────────────────────

interface AnalyticsState {
  filters:           AnalyticsFilters
  tab:               TabKey
  savedDashboards:   SavedDashboard[]
  activeDashboardId: string | null
  widgets:           WidgetConfig[]
  isEditMode:        boolean
  modals:            Record<ModalKey, boolean>
}

const initialState: AnalyticsState = {
  filters:           DEFAULT_FILTERS,
  tab:               'overview',
  savedDashboards:   [],
  activeDashboardId: null,
  widgets:           [...defaultWidgetLibrary],
  isEditMode:        false,
  modals:            { ask: false, vizBuilder: false, export: false, command: false, addWidget: false },
}

// ─── Actions ───────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_FILTER';    key: keyof AnalyticsFilters; value: string }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_TAB';       tab: TabKey }
  | { type: 'OPEN_MODAL';    modal: ModalKey }
  | { type: 'CLOSE_MODAL';   modal: ModalKey }
  | { type: 'CLOSE_ALL_MODALS' }
  | { type: 'ADD_WIDGET';    widget: WidgetConfig }
  | { type: 'MOVE_WIDGET';   id: string; dir: 'left' | 'right' }
  | { type: 'RESIZE_WIDGET'; id: string; axis: 'w' | 'h'; delta: number }
  | { type: 'DUPLICATE_WIDGET'; id: string }
  | { type: 'DELETE_WIDGET'; id: string }
  | { type: 'TOGGLE_EDIT_MODE' }
  | { type: 'LOAD_DASHBOARD'; id: string }
  | { type: 'SAVE_DASHBOARD'; name: string; description?: string }
  | { type: 'DELETE_DASHBOARD'; id: string }
  | { type: 'HYDRATE';        state: Partial<AnalyticsState> }

function reducer(state: AnalyticsState, action: Action): AnalyticsState {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.key]: action.value } }

    case 'RESET_FILTERS':
      return { ...state, filters: DEFAULT_FILTERS }

    case 'SET_TAB':
      return { ...state, tab: action.tab }

    case 'OPEN_MODAL':
      return { ...state, modals: { ...state.modals, [action.modal]: true } }

    case 'CLOSE_MODAL':
      return { ...state, modals: { ...state.modals, [action.modal]: false } }

    case 'CLOSE_ALL_MODALS': {
      const cleared: Record<ModalKey, boolean> = { ask: false, vizBuilder: false, export: false, command: false, addWidget: false }
      return { ...state, modals: cleared }
    }

    case 'ADD_WIDGET':
      return { ...state, widgets: [...state.widgets, action.widget] }

    case 'MOVE_WIDGET': {
      const idx = state.widgets.findIndex(w => w.id === action.id)
      if (idx === -1) return state
      const newIdx = action.dir === 'left' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= state.widgets.length) return state
      const next = [...state.widgets]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return { ...state, widgets: next }
    }

    case 'RESIZE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.map(w => {
          if (w.id !== action.id) return w
          const current = action.axis === 'w' ? w.w : w.h
          const next = Math.min(4, Math.max(1, current + action.delta))
          return { ...w, [action.axis]: next }
        }),
      }

    case 'DUPLICATE_WIDGET': {
      const w = state.widgets.find(w => w.id === action.id)
      if (!w) return state
      const copy: WidgetConfig = { ...w, id: `w${Date.now()}`, title: `${w.title} (Copy)` }
      const idx = state.widgets.findIndex(w => w.id === action.id)
      const next = [...state.widgets]
      next.splice(idx + 1, 0, copy)
      return { ...state, widgets: next }
    }

    case 'DELETE_WIDGET':
      return { ...state, widgets: state.widgets.filter(w => w.id !== action.id) }

    case 'TOGGLE_EDIT_MODE':
      return { ...state, isEditMode: !state.isEditMode }

    case 'LOAD_DASHBOARD': {
      const d = state.savedDashboards.find(d => d.id === action.id)
      if (!d) return state
      return {
        ...state,
        activeDashboardId: action.id,
        widgets: defaultWidgetLibrary.filter(w => d.widgetIds.includes(w.id)),
      }
    }

    case 'SAVE_DASHBOARD': {
      const newDash: SavedDashboard = {
        id: `d${Date.now()}`,
        name: action.name,
        description: action.description,
        icon: 'LayoutDashboard',
        widgetIds: state.widgets.map(w => w.id),
        lastModified: new Date().toISOString().slice(0, 10),
      }
      return { ...state, savedDashboards: [newDash, ...state.savedDashboards] }
    }

    case 'DELETE_DASHBOARD':
      return { ...state, savedDashboards: state.savedDashboards.filter(d => d.id !== action.id) }

    case 'HYDRATE':
      return { ...state, ...action.state }

    default:
      return state
  }
}

// ─── Context ───────────────────────────────────────────────────────────────

interface AnalyticsContextValue {
  state: AnalyticsState
  dispatch: React.Dispatch<Action>
}

export const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

const STORAGE_KEY = 'adntc-analytics-state'

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Hydrate from localStorage on mount — restore savedDashboards, widgets,
  // activeDashboardId, and isEditMode so custom dashboards persist across
  // page reloads and layouts are restored.
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw)
        dispatch({
          type: 'HYDRATE',
          state: {
            savedDashboards:   parsed.savedDashboards   ?? initialState.savedDashboards,
            widgets:           Array.isArray(parsed.widgets) ? parsed.widgets : initialState.widgets,
            activeDashboardId: parsed.activeDashboardId ?? initialState.activeDashboardId,
            isEditMode:        false, // always start in view mode
          },
        })
      }
    } catch { /* noop */ }
  }, [])

  // Persist savedDashboards + widgets + activeDashboardId so custom dashboard
  // layouts are restored on next visit. (Filters are intentionally NOT
  // persisted — they reset on page leave, matching Stripe/Linear.)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
          savedDashboards:   state.savedDashboards,
          widgets:           state.widgets,
          activeDashboardId: state.activeDashboardId,
        }))
      }
    } catch { /* noop */ }
  }, [state.savedDashboards, state.widgets, state.activeDashboardId])

  // ⌘K global shortcut for command palette
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        dispatch({ type: 'OPEN_MODAL', modal: 'command' })
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'CLOSE_ALL_MODALS' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <AnalyticsContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalyticsContext.Provider>
  )
}
