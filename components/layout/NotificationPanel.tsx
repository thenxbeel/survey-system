'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Check, CheckCheck, Trash2, X, FileText,
  MessageSquare, ClipboardList, BarChart3, Settings as Cog,
} from 'lucide-react'
import { useNotifications, type AppNotification } from '@/lib/stores/NotificationStore'

const CATEGORY_META: Record<AppNotification['category'], { icon: typeof Bell; color: string; bg: string }> = {
  response: { icon: MessageSquare,  color: '#0B4A8B', bg: '#EFF6FF' },
  survey:   { icon: ClipboardList,  color: '#17A673', bg: '#ECFDF5' },
  system:   { icon: BarChart3,      color: '#7C3AED', bg: '#F5F3FF' },
  report:   { icon: FileText,       color: '#F59E0B', bg: '#FFFBEB' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

interface Props {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: Props) {
  const { state, unreadCount, markRead, markAllRead, deleteNotification, clearAll } = useNotifications()
  const router = useRouter()
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Close when route changes
  useEffect(() => {
    if (open) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  function handleClick(n: AppNotification) {
    if (!n.isRead) markRead(n.id)
    onClose()
    router.push(n.link)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[55]"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] z-[56] w-[400px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[16px] bg-white"
            style={{
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
                  style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}
                >
                  <Bell size={14} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>
                    Notifications
                  </h3>
                  <p className="text-[10.5px]" style={{ color: 'var(--text-light)' }}>
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 rounded-[7px] px-6 py-3 text-[10.5px] font-semibold transition-all items-center justify-center text-center"
                    style={{ color: 'var(--primary)', background: 'var(--accent-soft)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                    title="Mark all as read"
                  >
                    <CheckCheck size={11} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] transition-all"
                  style={{ color: 'var(--text-light)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
                  aria-label="Close"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[440px] overflow-y-auto">
              {state.notifications.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center px-6 py-14">
                  <div
                    className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-[14px]"
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                  >
                    <Bell size={22} style={{ color: 'var(--text-muted)' }} strokeWidth={1.8} />
                  </div>
                  <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
                    No notifications
                  </div>
                  <div className="mt-1 text-[11.5px]" style={{ color: 'var(--text-light)' }}>
                    You're all caught up. New activity will appear here.
                  </div>
                </div>
              ) : (
                state.notifications.map((n) => {
                  const meta = CATEGORY_META[n.category]
                  const Icon = meta.icon
                  return (
                    <div
                      key={n.id}
                      className="group relative flex items-start gap-3 px-5 py-3.5 transition-colors"
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: n.isRead ? 'transparent' : 'var(--accent-soft)',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleClick(n)}
                      onMouseEnter={(e) => { e.currentTarget.style.background = n.isRead ? 'var(--bg-subtle)' : 'rgba(11,74,139,0.12)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--accent-soft)' }}
                    >
                      {/* Icon */}
                      <div
                        className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px]"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <Icon size={14} strokeWidth={2.2} />
                      </div>

                      {/* Body */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="line-clamp-2 text-[12.5px] font-bold leading-tight"
                            style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
                          >
                            {n.title}
                          </span>
                          {!n.isRead && (
                            <span
                              className="h-[7px] w-[7px] flex-shrink-0 rounded-full"
                              style={{ background: 'var(--primary)' }}
                            />
                          )}
                        </div>
                        <p
                          className="mt-0.5 text-[11.5px] leading-relaxed"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {n.message}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
                            {timeAgo(n.createdAt)}
                          </span>
                          {n.priority === 'high' && (
                            <span
                              className="rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em]"
                              style={{ background: 'var(--tint-red)', color: 'var(--red)' }}
                            >
                              High
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-sh-0 opacity-0 transition-opacity group-hover:opacity-100">
                        {!n.isRead && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markRead(n.id) }}
                            className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] transition-all"
                            style={{ color: 'var(--text-light)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--primary)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
                            title="Mark as read"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                          className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] transition-all"
                          style={{ color: 'var(--text-light)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--tint-red)'; e.currentTarget.style.color = 'var(--red)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {state.notifications.length > 0 && (
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
              >
                <button
                  onClick={clearAll}
                  className="flex items-center justify-center text-center text-[11px] font-semibold transition-colors"
                  style={{ color: 'var(--text-light)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-light)' }}
                >
                  Clear all
                </button>
                <button
                  onClick={() => { onClose(); router.push('/dashboard/responses') }}
                  className="text-[11px] font-semibold transition-colors"
                  style={{ color: 'var(--primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                >
                  View all activity →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
