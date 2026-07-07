'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronRight, X, PanelLeftClose } from 'lucide-react'
import { AdntcLogo } from '@/components/common/AdntcLogo'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '@/lib/stores/SettingsStore'

interface SidebarProps {
  /** Mobile drawer open state (controlled by DashboardShell). */
  drawerOpen?: boolean
  /** Close handler — called after navigation on mobile. */
  onClose?: () => void
  /** Desktop collapsed state — slides the sidebar off-screen. */
  desktopCollapsed?: boolean
  /** Toggle handler for desktop collapse. */
  onDesktopToggle?: () => void
}

const navSections = [
  {
    label: 'Overview',
    items: [
      { icon: 'dashboard',  label: 'Dashboard',      href: '/dashboard', pageKey: 'dashboard' },
    ],
  },
  {
    label: 'Survey Management',
    items: [
      { icon: 'surveys',    label: 'Surveys',         href: '/dashboard/surveys', pageKey: 'surveys' },
      { icon: 'builder',    label: 'Survey Builder',  href: '/dashboard/survey-builder', pageKey: 'survey-builder' },
      { icon: 'responses',  label: 'Responses',       href: '/dashboard/responses', pageKey: 'responses' },
      { icon: 'analytics',  label: 'Analytics',       href: '/dashboard/analytics', pageKey: 'analytics' },
      { icon: 'reports',    label: 'Assignments',     href: '/dashboard/assignments', pageKey: 'assignments' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { icon: 'reports',    label: 'Reports',         href: '/dashboard/reports', pageKey: 'reports' },
      { icon: 'users',      label: 'Users',           href: '/dashboard/users', pageKey: 'users' },
      { icon: 'branches',   label: 'Branches',        href: '/dashboard/branches', pageKey: 'branches' },
      { icon: 'ownership',  label: 'Employee Surveys',href: '/dashboard/employee-surveys', pageKey: 'employee-surveys' },
      { icon: 'audit',      label: 'Audit Log',       href: '/dashboard/audit-log', pageKey: 'audit-log' },
      { icon: 'profile',    label: 'My Profile',      href: '/dashboard/profile', pageKey: 'profile' },
      { icon: 'settings',   label: 'Settings',        href: '/dashboard/settings', pageKey: 'settings' },
    ],
  },
] as const

function NavIcon({ name }: { name: string }) {
  const s = 'w-[15px] h-[15px] flex-shrink-0'
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'dashboard':
      return <svg className={s} viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
    case 'surveys':
      return <svg className={s} viewBox="0 0 24 24" {...p}><path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
    case 'builder':
      return <svg className={s} viewBox="0 0 24 24" {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
    case 'responses':
      return <svg className={s} viewBox="0 0 24 24" {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    case 'analytics':
      return <svg className={s} viewBox="0 0 24 24" {...p}><path d="M3 3v18h18"/><path d="M7 16l4-5 3 3 5-7"/></svg>
    case 'campaigns':
      return <svg className={s} viewBox="0 0 24 24" {...p}><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>
    case 'reports':
      return <svg className={s} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>
    case 'users':
      return <svg className={s} viewBox="0 0 24 24" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'branches':
      return <svg className={s} viewBox="0 0 24 24" {...p}><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v0M9 12v0M9 15v0M9 18v0"/></svg>
    case 'audit':
      return <svg className={s} viewBox="0 0 24 24" {...p}><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
    case 'ownership':
      return <svg className={s} viewBox="0 0 24 24" {...p}><path d="M9 4h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V5a1 1 0 0 1 1-1z"/><path d="M9 14l2 2 4-4"/></svg>
    case 'profile':
      return <svg className={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
    case 'settings':
      return <svg className={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    default:
      return <svg className={s} viewBox="0 0 24 24" {...p}><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
  }
}

export default function Sidebar({ drawerOpen = false, onClose, desktopCollapsed = false, onDesktopToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { state: settingsState } = useSettings()
  const profile = settingsState.profile
  const allowedPages = profile.allowedPages ?? []
  const roleName = profile.role
  const isLoading = !profile.email

  const filteredNavSections = navSections.map((section) => {
    return {
      ...section,
      items: section.items.filter((item) => {
        if (item.pageKey === 'profile') return true
        if (isLoading) return true // prevent layout shift during loading
        if (roleName === 'Admin') return true
        return allowedPages.includes(item.pageKey)
      }),
    }
  }).filter((section) => section.items.length > 0)

  // Auto-close the mobile drawer when the route changes
  function handleNavigate() {
    if (onClose) onClose()
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  async function handleLogout() {
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
    <aside
      className={`sidebar-aside fixed inset-y-0 left-0 z-40 flex flex-col text-white ${drawerOpen ? 'drawer-open' : ''} ${desktopCollapsed ? 'desktop-collapsed' : ''}`}
      style={{
        width: 'var(--sidebar-w)',
        minWidth: 'var(--sidebar-w)',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* ── Mobile close button (hidden on desktop) ── */}
      <button
        onClick={onClose}
        className="sidebar-close-btn absolute right-3 top-4 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-[8px] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Close menu"
      >
        <X size={18} />
      </button>

      {/* ── Brand ── */}
      <div className="px-5 pb-4 pt-5">
        <div className="relative mb-4 flex items-center justify-center py-2">
          {/* Subtle ambient glow behind the logo */}
          <div
            className="absolute inset-0 z-0 opacity-40 blur-[24px]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 60%)'
            }}
          />
          {/* Increased height and enhanced, dominant shadow */}
          <div className="relative z-10 transition-transform duration-500 hover:scale-105">
            <AdntcLogo
              variant="sidebar"
              className="!h-[42px] drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>
        <div
          className="flex h-[1px] w-full items-center"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        />
        <div className="mt-4 flex items-center">
          <div
            className="flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all hover:bg-[rgba(23,166,115,0.2)]"
            style={{ background: 'rgba(23,166,115,0.15)', color: '#10B981', border: '1px solid rgba(23,166,115,0.3)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]"></span>
            </span>
            Live System
          </div>
          {/* Desktop collapse toggle */}
          {onDesktopToggle && (
            <button
              onClick={onDesktopToggle}
              className="sidebar-collapse-toggle ml-auto flex h-[28px] w-[28px] items-center justify-center rounded-[8px] text-white/50 transition-all duration-200 hover:bg-white/10 hover:text-white/90"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {filteredNavSections.map((section) => (
          <div key={section.label} className="mb-1">
            <div className="section-label">{section.label}</div>
            {section.items.map(({ icon, label, href }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={handleNavigate}
                  className={`nav-item relative mb-[2px] ${active ? 'active' : ''}`}
                  style={{ isolation: 'isolate' }}
                >
                  {/* Animated sliding active background */}
                  {active && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-[10px]"
                      style={{ background: 'rgba(255,255,255,0.10)', zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.8 }}
                    />
                  )}

                  {/* Left accent bar */}
                  {active && (
                    <motion.span
                      layoutId="sidebar-active-bar"
                      className="absolute left-0 top-[20%] h-[60%] w-[3px] rounded-r-full"
                      style={{ background: 'rgba(255,255,255,0.7)', zIndex: 1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.8 }}
                    />
                  )}

                  <span
                    className={`relative z-[1] flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[8px] transition-all ${active ? 'opacity-100' : 'opacity-70'}`}
                    style={{ background: active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)' }}
                  >
                    <NavIcon name={icon} />
                  </span>
                  <span className="relative z-[1] flex-1 truncate" title={label}>{label}</span>
                  {active && (
                    <span
                      className="relative z-[1] ml-auto h-[5px] w-[5px] flex-shrink-0 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.45)' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>




    </aside>
  )
}
