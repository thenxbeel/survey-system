'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, Check, CheckCheck, Trash2, Loader2, RefreshCw,
  MessageSquare, ClipboardList, BarChart3, FileText, Info,
} from 'lucide-react'
import { SettingsCard } from '../SettingsCard'
import { useToast } from '@/lib/stores/ToastStore'

interface Props {
  delay?: number
}

interface LiveNotification {
  id:        number
  title:     string
  message:   string
  category:  string
  link:      string | null
  isRead:    boolean
  createdAt: string  // ISO
}

const CATEGORY_META: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  response: { icon: MessageSquare,  color: '#0B4A8B', bg: '#EFF6FF' },
  survey:   { icon: ClipboardList,  color: '#17A673', bg: '#ECFDF5' },
  system:   { icon: Info,           color: '#7C3AED', bg: '#F5F3FF' },
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
  if (d < 7)  return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

export function NotificationsSection({ delay = 0 }: Props) {
  const router = useRouter()
  const toast = useToast()

  const [notifications, setNotifications] = useState<LiveNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch('/api/notifications?pageSize=50', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      // API returns newest-first already (orderBy createdAt desc)
      setNotifications((json.data ?? []) as LiveNotification[])
    } catch {
      if (!silent) setNotifications([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.isRead).length

  async function handleMarkRead(id: number) {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setActionLoadingId(id)
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch {
      // Roll back on failure
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n))
      toast.error('Failed', 'Could not mark notification as read.')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0) return
    // Optimistic
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    try {
      const res = await fetch('/api/notifications', { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast.success('Marked all as read', `${unreadCount} notification${unreadCount === 1 ? '' : 's'} cleared.`)
    } catch {
      // Re-fetch to restore accurate state
      fetchNotifications(true)
      toast.error('Failed', 'Could not mark all as read.')
    }
  }

  async function handleDelete(id: number) {
    // Optimistic
    const previous = notifications
    setNotifications(prev => prev.filter(n => n.id !== id))
    setActionLoadingId(id)
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch {
      setNotifications(previous)
      toast.error('Failed', 'Could not delete notification.')
    } finally {
      setActionLoadingId(null)
    }
  }

  function handleClick(n: LiveNotification) {
    if (!n.isRead) handleMarkRead(n.id)
    if (n.link) router.push(n.link)
  }

  return (
    <div className="flex flex-col gap-6">
      <SettingsCard
        title="Notifications"
        description={`Live activity feed — ${unreadCount} unread of ${notifications.length} total`}
        icon={Bell}
        accent="var(--primary)"
        delay={delay}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="inline-flex h-[32px] items-center gap-2.5 rounded-[9px] border bg-white px-3 text-[11.5px] font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              title="Refresh"
            >
              {refreshing ? <Loader2 size={12} strokeWidth={2.2} className="animate-spin" /> : <RefreshCw size={12} strokeWidth={2.2} />}
              Refresh
            </button>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="inline-flex h-[32px] items-center gap-2.5 rounded-[9px] px-3 text-[11.5px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 items-center justify-center text-center"
              style={{ background: 'var(--primary)' }}
              title="Mark all as read"
            >
              <CheckCheck size={12} strokeWidth={2.2} />
              Mark all read
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-[12px]" style={{ color: 'var(--text-light)' }}>
            <Loader2 size={14} className="animate-spin" />
            Loading notifications…
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-[10px] py-12"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <Bell size={20} style={{ color: 'var(--text-muted)' }} />
            <div className="text-[12px] font-semibold" style={{ color: 'var(--text-light)' }}>
              No notifications yet
            </div>
            <div className="text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
              Activity from surveys, responses, and other events will appear here in real time.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map(n => {
              const meta = CATEGORY_META[n.category] ?? CATEGORY_META.system
              const Icon = meta.icon
              return (
                <div
                  key={n.id}
                  className="group flex items-start gap-3 rounded-[10px] p-3 transition-all"
                  style={{
                    background: n.isRead ? 'var(--bg-subtle)' : 'var(--tint-blue)',
                    border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(11,74,139,0.25)'}`,
                  }}
                >
                  <div
                    className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[8px]"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    <Icon size={14} strokeWidth={2.1} />
                  </div>
                  <button
                    onClick={() => handleClick(n)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[12px] font-bold line-clamp-2 leading-tight"
                        style={{ color: 'var(--text)' }}
                      >
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span
                          className="h-[6px] w-[6px] flex-shrink-0 rounded-full"
                          style={{ background: 'var(--primary)' }}
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    <div
                      className="mt-0.5 text-[10.5px] line-clamp-2"
                      style={{ color: 'var(--text-light)' }}
                    >
                      {n.message}
                    </div>
                    <div className="mt-1 text-[9.5px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      {timeAgo(n.createdAt)}
                      {n.link ? ' · Click to view' : ''}
                    </div>
                  </button>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        disabled={actionLoadingId === n.id}
                        className="rounded-[6px] p-2.5 transition-all disabled:opacity-50"
                        style={{ color: 'var(--text-light)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--primary)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
                        title="Mark as read"
                      >
                        {actionLoadingId === n.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      disabled={actionLoadingId === n.id}
                      className="rounded-[6px] p-2.5 transition-all disabled:opacity-50"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--tint-red)'; e.currentTarget.style.color = 'var(--red)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SettingsCard>
    </div>
  )
}
