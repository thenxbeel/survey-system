'use client'

/**
 * Notification Store — global notification system backed by Context + useReducer.
 *
 * LIVE DATA — fetches from /api/notifications (Prisma-backed). The previous
 * localStorage seed-data implementation has been removed.
 *
 * Used by:
 *   - components/layout/Navbar.tsx (bell icon + badge + panel trigger)
 *   - components/layout/NotificationPanel.tsx (the dropdown panel)
 */

import {
  createContext, useContext, useReducer, useEffect, useCallback, type ReactNode,
} from 'react'

export interface AppNotification {
  id:        string
  title:     string
  message:   string
  isRead:    boolean
  createdAt: string  // ISO
  link:      string  // route to navigate to when clicked
  category:  'response' | 'survey' | 'system' | 'report'
  priority:  'low' | 'medium' | 'high'
}

interface NotificationState {
  notifications: AppNotification[]
  loading: boolean
}

type Action =
  | { type: 'MARK_READ';     id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DELETE';        id: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_NOTIFICATIONS'; notifications: AppNotification[] }
  | { type: 'SET_LOADING'; loading: boolean }

function reducer(state: NotificationState, action: Action): NotificationState {
  switch (action.type) {
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.id ? { ...n, isRead: true } : n
        ),
      }
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      }
    case 'DELETE':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.id) }
    case 'CLEAR_ALL':
      return { ...state, notifications: [] }
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.notifications, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    default:
      return state
  }
}

const initialState: NotificationState = {
  notifications: [],
  loading: true,
}

// ─── Context ────────────────────────────────────────────────────────────────

interface NotificationContextValue {
  state:        NotificationState
  unreadCount:  number
  refresh:      () => Promise<void>
  markRead:     (id: string) => void
  markAllRead:  () => void
  deleteNotification: (id: string) => void
  clearAll:     () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

// Map an API notification record → AppNotification
function mapNotification(n: any): AppNotification {
  // Determine priority from category/message heuristics
  const msg = (n.message || '').toLowerCase()
  let priority: AppNotification['priority'] = 'low'
  if (n.category === 'followup' || msg.includes('critical') || msg.includes('detractor')) priority = 'high'
  else if (n.category === 'response' || n.category === 'survey') priority = 'medium'

  const cat = (n.category === 'followup' || n.category === 'response') ? 'response'
            : n.category === 'survey' ? 'survey'
            : n.category === 'report' ? 'report'
            : 'system'

  return {
    id: String(n.id),
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt,
    link: n.link || '/dashboard',
    category: cat as AppNotification['category'],
    priority,
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const refresh = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true })
    try {
      const res = await fetch('/api/notifications?pageSize=20', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const mapped = (json.data || []).map(mapNotification)
      dispatch({ type: 'SET_NOTIFICATIONS', notifications: mapped })
    } catch {
      dispatch({ type: 'SET_NOTIFICATIONS', notifications: [] })
    }
  }, [])

  // Fetch notifications on mount
  useEffect(() => { refresh() }, [refresh])

  const markRead = useCallback(async (id: string) => {
    dispatch({ type: 'MARK_READ', id })
    // Persist to API
    fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => { /* non-fatal */ })
  }, [])

  const markAllRead = useCallback(async () => {
    dispatch({ type: 'MARK_ALL_READ' })
    // Persist each to API (best-effort)
    state.notifications.filter(n => !n.isRead).forEach(n => {
      fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' }).catch(() => { /* non-fatal */ })
    })
  }, [state.notifications])

  const deleteNotification = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE', id })
    fetch(`/api/notifications/${id}`, { method: 'DELETE' }).catch(() => { /* non-fatal */ })
  }, [])

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
    // Note: the API doesn't have a bulk delete endpoint, so this is UI-only
  }, [])

  const unreadCount = state.notifications.filter(n => !n.isRead).length

  return (
    <NotificationContext.Provider value={{ state, unreadCount, refresh, markRead, markAllRead, deleteNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within <NotificationProvider>')
  return ctx
}
