'use client'

/**
 * Toast Store — global toast notification system.
 *
 * Any component under <ToastProvider> can call useToast().push(...) to show
 * a toast. Reused by Survey Builder, Settings, Surveys page, and so on.
 *
 * No state management library is introduced — this is plain Context +
 * useReducer, matching the existing project pattern (AnalyticsProvider).
 */

import {
  createContext, useContext, useState, useCallback, type ReactNode,
} from 'react'
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'info' | 'warning' | 'error'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  at: number
}

interface ToastContextValue {
  toasts: Toast[]
  push:    (type: ToastType, title: string, message: string) => void
  dismiss: (id: string) => void
  success: (title: string, message: string) => void
  info:    (title: string, message: string) => void
  warning: (title: string, message: string) => void
  error:   (title: string, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_ICONS = {
  success: CheckCircle2,
  info:    Info,
  warning: AlertTriangle,
  error:   XCircle,
}

const TOAST_COLORS = {
  success: '#17A673',
  info:    '#0B4A8B',
  warning: '#F5A623',
  error:   '#E5484D',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback((type: ToastType, title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const toast: Toast = { id, type, title, message, at: Date.now() }
    setToasts(prev => [...prev, toast])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const success = useCallback((title: string, message: string) => push('success', title, message), [push])
  const info    = useCallback((title: string, message: string) => push('info',    title, message), [push])
  const warning = useCallback((title: string, message: string) => push('warning', title, message), [push])
  const error   = useCallback((title: string, message: string) => push('error',   title, message), [push])

  const value: ToastContextValue = { toasts, push, dismiss, success, info, warning, error }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast stack — rendered once at the provider level */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex flex-col gap-2">
        {toasts.map(t => {
          const Icon = TOAST_ICONS[t.type]
          const color = TOAST_COLORS[t.type]
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-[340px] items-start gap-3 rounded-[12px] bg-white p-3 animate-fade-up"
              style={{
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px]"
                style={{ background: `${color}1A` }}
              >
                <Icon size={14} style={{ color }} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>{t.title}</div>
                <div className="mt-0.5 text-[11.5px]" style={{ color: 'var(--text-light)' }}>{t.message}</div>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[5px] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                aria-label="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
