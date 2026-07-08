'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, Bell, HelpCircle, LogOut, ChevronDown, Loader2, Calendar, Menu, X,
  LayoutDashboard, FileText, PenTool, MessageSquare, BarChart3, Megaphone,
  Users as UsersIcon, ClipboardList, Clock, User, Settings, Building2,
  type LucideIcon,
} from 'lucide-react'
import { useSettings } from '@/lib/stores/SettingsStore'
import { useNotifications } from '@/lib/stores/NotificationStore'
import { useGlobalSearch } from '@/lib/stores/GlobalSearchStore'
import { NotificationPanel } from './NotificationPanel'

const pageMeta: Record<string, { title: string; sub: string; icon: LucideIcon }> = {
  '/dashboard':                  { title: 'Dashboard',       sub: 'Executive overview',            icon: LayoutDashboard },
  '/dashboard/surveys':          { title: 'Surveys',         sub: 'Survey management',             icon: FileText },
  '/dashboard/survey-builder':   { title: 'Survey Builder',  sub: 'Design & configure surveys',    icon: PenTool },
  '/dashboard/responses':        { title: 'Responses',       sub: 'Survey feedback',               icon: MessageSquare },
  '/dashboard/analytics':        { title: 'Analytics',       sub: 'Data insights & reports',       icon: BarChart3 },
  '/dashboard/campaigns':        { title: 'Campaigns',       sub: 'Distribution campaigns',        icon: Megaphone },
  '/dashboard/reports':          { title: 'Reports',         sub: 'Generated & scheduled reports', icon: FileText },
  '/dashboard/users':            { title: 'Users',           sub: 'Team & access management',      icon: UsersIcon },
  '/dashboard/employee-surveys': { title: 'Employee Surveys',sub: 'Survey ownership',              icon: ClipboardList },
  '/dashboard/audit-log':        { title: 'Audit Log',       sub: 'Survey lifecycle history',      icon: Clock },
  '/dashboard/profile':          { title: 'My Profile',      sub: 'Your account & surveys',        icon: User },
  '/dashboard/settings':         { title: 'Settings',        sub: 'Platform configuration',        icon: Settings },
  '/dashboard/branches':         { title: 'Branches',        sub: 'Branch management',             icon: Building2 },
}

interface NavbarProps {
  /** Open the mobile sidebar drawer. */
  onMenuClick?: () => void
  /** Controls the smart sticky hide-on-scroll animation */
  isHidden?: boolean
}

export default function Navbar({ onMenuClick, isHidden = false }: NavbarProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const page = pageMeta[pathname] ?? { title: 'Dashboard', sub: '', icon: LayoutDashboard }
  const PageIcon = page.icon
  const [loggingOut, setLoggingOut] = useState(false)
  const [notifOpen, setNotifOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)  // mobile search expand state
  const [searchResults, setSearchResults] = useState<any>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { state: settingsState } = useSettings()
  const { unreadCount } = useNotifications()
  const { rawQuery, setQuery, clear: clearSearch } = useGlobalSearch()
  const profile = settingsState.profile

  useEffect(() => {
    setMounted(true)
  }, [])

  // Escape key closes help modal
  useEffect(() => {
    if (!helpOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setHelpOpen(false)
    }
    document.addEventListener('keydown', onKey)
    // Lock body scroll while modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [helpOpen])

  // Debounced global search — calls /api/search when query changes
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (!rawQuery.trim()) {
      setSearchResults(null)
      return
    }
    setSearchLoading(true)
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(rawQuery.trim())}&limit=5`, { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          setSearchResults(json.data)
        } else {
          setSearchResults(null)
        }
      } catch {
        setSearchResults(null)
      } finally {
        setSearchLoading(false)
      }
    }, 300)
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current) }
  }, [rawQuery])

  const today = new Date().toLocaleDateString('en-AE', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
    } catch { /* ignore */ }
    finally {
      router.replace('/login')
      router.refresh()
    }
  }

  return (
    <>
    <header
      className={`navbar-header sticky top-0 z-30 flex flex-col flex-shrink-0 transition-transform duration-300 ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div 
        className="relative z-10 h-[64px] w-full"
        style={{ boxShadow: '0 4px 24px -4px rgba(11, 26, 62, 0.15)' }}
      >
        {/* Layer 1: Premium Blue Lights (Behind the glass) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-[10%] -top-20 h-48 w-[40%] rounded-full bg-blue-600/50 blur-[50px]" />
          <div className="absolute left-[30%] -top-20 h-48 w-[40%] rounded-full bg-blue-400/40 blur-[50px]" />
          <div className="absolute right-[10%] -top-20 h-48 w-[30%] rounded-full bg-cyan-400/30 blur-[50px]" />
        </div>

        {/* Layer 2: The Dark Glass Window (Tint & Blur) */}
        <div 
          className="absolute inset-0 z-[1] pointer-events-none border-b border-white/10"
          style={{
            background: 'rgba(11, 26, 62, 0.75)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        />

        {/* Layer 3: The Content */}
        <div className="absolute inset-0 z-[2] flex items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 pointer-events-none">
          {/* ── Left: hamburger (mobile) + page title ── */}
          <div className="relative flex flex-shrink-0 items-center gap-2 sm:gap-3 pointer-events-auto">
            {/* Hamburger — mobile/tablet only */}
            <button
              onClick={onMenuClick}
              className="navbar-hamburger flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] transition-all lg:hidden"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#FFFFFF',
              }}
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>

            <div
              className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <PageIcon size={15} color="#fff" />
            </div>
            <div className="min-w-[100px] max-w-[300px]">
              <h2
                className="truncate text-[14.5px] leading-tight"
                style={{ color: '#FFFFFF', fontWeight: 750, letterSpacing: '-0.015em' }}
              >
                {page.title}
              </h2>
              {page.sub && (
                <p className="truncate text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{page.sub}</p>
              )}
            </div>
          </div>

          {/* ── Center: search ── */}
          {/* Mobile: search toggle button → expands to full-width overlay */}
          <div className="relative z-10 flex flex-1 justify-end md:hidden pointer-events-auto">
            <button
              onClick={() => setSearchOpen(true)}
              className="navbar-search-toggle flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
              aria-label="Search"
            >
              <Search size={15} />
            </button>
          </div>

          {/* Desktop: inline search (≥768px) - robust flex centering */}
          <div className="relative z-10 hidden flex-1 justify-center px-4 md:flex pointer-events-auto">
            <div
              className="group relative flex w-full max-w-[480px] items-center gap-2.5 rounded-full px-3.5 py-2 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus-within:ring-4 focus-within:ring-white/10"
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <Search size={14} style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
              <input
                type="text"
                value={rawQuery}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search surveys, responses, campaigns…"
                className="flex-1 min-w-0 bg-transparent text-[12.5px] outline-none placeholder:text-white/40"
                style={{ color: '#FFFFFF' }}
                aria-label="Global search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {rawQuery && (
                <button
                  onClick={() => { clearSearch(); setSearchResults(null) }}
                  className="text-[10px] font-semibold transition-colors flex-shrink-0 text-white/60 hover:text-white"
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {rawQuery.trim() && (
              <div
                className="absolute left-4 right-4 top-[calc(100%+4px)] z-50 overflow-hidden rounded-[12px] border bg-white"
                style={{ borderColor: '#E2E8F3', boxShadow: '0 12px 40px rgba(13,27,46,0.12)' }}
              >
                {searchLoading ? (
                  <div className="flex items-center gap-2 px-4 py-3 text-[12px]" style={{ color: '#8FA0B5' }}>
                    <Loader2 size={13} className="animate-spin" /> Searching…
                  </div>
                ) : searchResults && searchResults.totalResults > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto py-1 text-left">
                    {searchResults.surveys?.length > 0 && (
                      <div className="px-4 py-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: '#B0BDCC' }}>Surveys</div>
                    )}
                    {searchResults.surveys?.map((s: any) => (
                      <button key={s.id} onClick={() => { router.push(s.href); clearSearch(); setSearchResults(null) }} className="flex w-full items-center gap-2.5 px-6 py-3 text-left text-[12px] transition-colors hover:bg-[#F4F7FB]" style={{ color: '#0D1B2E' }}>
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[6px] bg-[#EFF6FF] text-[10px]">📋</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{s.title}</div>
                          <div className="text-[10.5px] truncate" style={{ color: '#8FA0B5' }}>{s.id} · {s.subtitle} · {s.responseCount} responses</div>
                        </div>
                        <span className="flex-shrink-0 rounded-[4px] bg-[#EBF0F7] px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ color: '#8FA0B5' }}>{s.status}</span>
                      </button>
                    ))}
                    {searchResults.responses?.length > 0 && (
                      <div className="px-4 py-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: '#B0BDCC' }}>Responses</div>
                    )}
                    {searchResults.responses?.map((r: any) => (
                      <button key={r.id} onClick={() => { router.push(r.href); clearSearch(); setSearchResults(null) }} className="flex w-full items-center gap-2.5 px-6 py-3 text-left text-[12px] transition-colors hover:bg-[#F4F7FB]" style={{ color: '#0D1B2E' }}>
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[6px] bg-[#ECFDF5] text-[10px]">💬</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{r.title}</div>
                          <div className="text-[10.5px] truncate" style={{ color: '#8FA0B5' }}>{r.id} · {r.subtitle} · NPS {r.npsScore ?? '—'}</div>
                        </div>
                      </button>
                    ))}
                    {searchResults.users?.length > 0 && (
                      <div className="px-4 py-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: '#B0BDCC' }}>Users</div>
                    )}
                    {searchResults.users?.map((u: any) => (
                      <button key={u.id} onClick={() => { router.push(u.href); clearSearch(); setSearchResults(null) }} className="flex w-full items-center gap-2.5 px-6 py-3 text-left text-[12px] transition-colors hover:bg-[#F4F7FB]" style={{ color: '#0D1B2E' }}>
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[6px] bg-[#F5F3FF] text-[10px]">👤</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{u.title}</div>
                          <div className="text-[10.5px] truncate" style={{ color: '#8FA0B5' }}>{u.employeeId} · {u.subtitle} · {u.role}</div>
                        </div>
                      </button>
                    ))}
                    {searchResults.campaigns?.length > 0 && (
                      <div className="px-4 py-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: '#B0BDCC' }}>Campaigns</div>
                    )}
                    {searchResults.campaigns?.map((c: any) => (
                      <button key={c.id} onClick={() => { router.push(c.href); clearSearch(); setSearchResults(null) }} className="flex w-full items-center gap-2.5 px-6 py-3 text-left text-[12px] transition-colors hover:bg-[#F4F7FB]" style={{ color: '#0D1B2E' }}>
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[6px] bg-[#FFFBEB] text-[10px]">📣</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{c.title}</div>
                          <div className="text-[10.5px] truncate" style={{ color: '#8FA0B5' }}>{c.subtitle} · {c.responseCount} responses</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-[12px] text-left" style={{ color: '#8FA0B5' }}>No results found for "{rawQuery}"</div>
                )}
              </div>
            )}
          </div>

          {/* ── Right cluster ── */}
          <div className="relative z-10 flex flex-shrink-0 items-center justify-end gap-2.5 pointer-events-auto">
            {/* Date chip */}
            <div
              className="hidden flex-shrink-0 items-center justify-center gap-2 rounded-[9px] text-[11.5px] font-medium whitespace-nowrap xl:flex"
              style={{ 
                background: 'rgba(255,255,255,0.06)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'rgba(255,255,255,0.9)',
                padding: '6px 16px', // Hardcoded padding to ensure space (1cm feeling)
                minHeight: '32px' // Ensures top/bottom space
              }}
            >
              <Calendar size={12} style={{ color: '#60A5FA' }} />
              {today}
            </div>

            {/* Help — opens help modal */}
            <button 
              onClick={() => setHelpOpen(true)} 
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hidden sm:flex text-white/80 hover:text-white hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              aria-label="Help" 
              title="Help & Documentation"
            >
              <HelpCircle size={15} />
            </button>

            {/* Notifications — now wired to NotificationStore + NotificationPanel */}
            <div className="relative">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 text-white/80 hover:text-white hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                aria-label="Notifications"
                onClick={() => setNotifOpen(o => !o)}
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -right-[3px] -top-[3px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-1 text-[8.5px] font-bold text-white shadow-[0_0_8px_rgba(229,72,77,0.5)]"
                    style={{ background: '#E5484D' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* Divider */}
            <div className="mx-1 h-[18px] w-px bg-white/20" />

            {/* Profile button — reads name + initials + role from SettingsStore */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="group flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 transition-all duration-150 border border-transparent hover:bg-white/10 hover:border-white/10"
                title={`${profile.fullName} — Profile Menu`}
              >
                <div
                  className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]"
                  style={{ background: profile.avatarColor || 'linear-gradient(135deg, #0B4A8B 0%, #06386F 100%)' }}
                >
                  {profile.avatarInitials}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-[12px] font-semibold leading-tight text-white/90 group-hover:text-white">
                    {profile.fullName}
                  </div>
                  <div className="text-[10.5px] text-white/50 group-hover:text-white/70 transition-colors">{profile.role}</div>
                </div>
                <ChevronDown size={12} className="hidden sm:block text-white/50 group-hover:text-white/80 transition-colors" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 overflow-hidden rounded-[12px] border bg-white shadow-lg" style={{ borderColor: '#E2E8F3', boxShadow: '0 12px 40px rgba(13,27,46,0.12)' }}>
                    <div className="py-1">
                      <button
                        onClick={() => { setProfileOpen(false); router.push('/dashboard/profile'); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[12px] transition-colors hover:bg-[#F4F7FB]"
                        style={{ color: '#0D1B2E' }}
                      >
                        <User size={14} style={{ color: '#8FA0B5' }} />
                        My Profile
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); router.push('/dashboard/settings'); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[12px] transition-colors hover:bg-[#F4F7FB]"
                        style={{ color: '#0D1B2E' }}
                      >
                        <Settings size={14} style={{ color: '#8FA0B5' }} />
                        Settings
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-50"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              aria-label="Log out"
              title="Sign out"
            >
              {loggingOut
                ? <Loader2 size={15} className="animate-spin" />
                : <LogOut size={15} />}
            </button>
          </div>
        </div>
      </div>
        
      {/* Removed the blurry transition gradient in favor of a crisp bottom border and drop shadow on the main header for a much more premium look */}
      </header>
      {/* ── Mobile search overlay — full-width dropdown ── */}
      {searchOpen && (
        <div
          className="fixed inset-x-0 top-0 z-50 flex items-center gap-2 px-4 py-3 md:hidden"
          style={{
            background: 'rgba(244,247,251,0.98)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <button
            onClick={() => setSearchOpen(false)}
            className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-[10px] transition-all"
            style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text-secondary)' }}
            aria-label="Close search"
          >
            <ChevronDown size={18} className="rotate-90" />
          </button>
          <div
            className="flex flex-1 items-center gap-2 rounded-full px-3 py-2"
            style={{ background: '#FFFFFF', border: '1px solid var(--border)' }}
          >
            <Search size={14} style={{ color: '#8FA0B5', flexShrink: 0 }} />
            <input
              type="text"
              autoFocus
              value={rawQuery}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: 'var(--text)' }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {rawQuery && (
              <button
                onClick={clearSearch}
                className="flex items-center justify-center text-center text-[10px] font-semibold"
                style={{ color: '#8FA0B5' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Help Modal - Rendered via Portal to escape Navbar stacking context/filters */}
      {helpOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '24px' // Add consistent padding around the whole screen to prevent touching edges
          }}
          onClick={() => setHelpOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setHelpOpen(false) }}
          tabIndex={-1}
        >
          <div
            className="flex flex-col overflow-hidden rounded-[18px] bg-white w-full"
            style={{ 
              border: '1px solid var(--border)', 
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh', // Ensure it doesn't grow taller than the screen
              maxWidth: '700px'  // Limit width so it doesn't stretch infinitely
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', padding: '16px 20px' }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px]" style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}>
                  <HelpCircle size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-[15px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>Help & Documentation</h2>
                  <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>ADNTC CX Platform v1.0.0</p>
                </div>
              </div>
              <button onClick={() => setHelpOpen(false)} className="rounded-[8px] p-2 transition-all" style={{ color: 'var(--text-light)' }} aria-label="Close help">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto" style={{ padding: '24px 24px' }}>
              <div className="flex flex-col gap-4">
                <HelpSection title="Dashboard Overview" icon="📊">
                  The dashboard displays real-time KPIs (Total Responses, NPS Score, Active Surveys, Response Rate) computed from the live database. Charts and tables update automatically when you change filters.
                </HelpSection>
                <HelpSection title="KPI Cards" icon="📈">
                  <strong>Total Responses</strong> — count of all survey responses in the selected period.<br/>
                  <strong>NPS Score</strong> — calculated as % Promoters minus % Detractors (scale -100 to +100).<br/>
                  <strong>Active Surveys</strong> — surveys currently in ACTIVE lifecycle status.<br/>
                  <strong>Response Rate</strong> — responses vs invitations (heuristic).
                </HelpSection>
                <HelpSection title="Filters" icon="🔍">
                  Use the <strong>Period</strong> selector (7d/30d/90d/1y) to change the date range. Use the <strong>Branch</strong> dropdown to filter by branch. All KPIs, charts, and tables refresh automatically when filters change.
                </HelpSection>
                <HelpSection title="Export" icon="💾">
                  Click the <strong>Export</strong> button to download dashboard data as CSV. Choose from Executive Summary, All Responses, Survey Performance, or Campaign Report. The export respects the current period and branch filters.
                </HelpSection>
                <HelpSection title="Search" icon="🔎">
                  Use the search bar (top-center) to search across Surveys, Responses, Users, and Campaigns. Results appear in a dropdown — click any result to navigate to that page. Press <kbd>⌘K</kbd> to focus the search input.
                </HelpSection>
                <HelpSection title="Keyboard Shortcuts" icon="⌨️">
                  <kbd>⌘K</kbd> — Focus global search<br/>
                  <kbd>Esc</kbd> — Close modals / panels<br/>
                  <kbd>R</kbd> — Refresh dashboard (when search is not focused)
                </HelpSection>
                <HelpSection title="FAQ" icon="❓">
                  <strong>Q: How often is the data refreshed?</strong><br/>
                  A: Dashboard data is fetched live from the database on every page load and filter change.<br/><br/>
                  <strong>Q: Can I export to Excel?</strong><br/>
                  A: Yes — CSV exports can be opened directly in Excel.<br/><br/>
                  <strong>Q: How are NPS scores calculated?</strong><br/>
                  A: NPS = % Promoters (9-10) − % Detractors (0-6). Passives (7-8) are excluded from the calculation.
                </HelpSection>
                <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Contact Administrator</p>
                  <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-light)' }}>For technical support, contact your system administrator or IT department.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t" style={{ borderColor: 'var(--border)', padding: '16px 24px' }}>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>ADNTC CX Platform v1.0.0</span>
              <button onClick={() => setHelpOpen(false)} className="rounded-[9px] px-4 py-1.5 text-[12px] font-semibold text-white transition-all hover:opacity-90" style={{ background: '#17A673' }}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

function HelpSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 flex items-center gap-2.5 text-[12px] font-bold" style={{ color: 'var(--text)' }}>
        <span>{icon}</span> {title}
      </h3>
      <div className="text-[11.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </div>
    </div>
  )
}

// Local color helper (darkens a hex by a ratio) — used for the avatar gradient.
function shade(hex: string, ratio: number) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!m) return hex
  const adjust = (c: number) => {
    const v = ratio < 0
      ? Math.round(c * (1 + ratio))
      : Math.round(c + (255 - c) * ratio)
    return Math.max(0, Math.min(255, v))
  }
  const r = adjust(parseInt(m[1], 16))
  const g = adjust(parseInt(m[2], 16))
  const b = adjust(parseInt(m[3], 16))
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}
