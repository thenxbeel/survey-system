'use client'

import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSettings } from '@/lib/stores/SettingsStore'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { PanelLeftOpen } from 'lucide-react'

export function DashboardShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isNavHidden, setIsNavHidden] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { state: settingsState } = useSettings()
  const profile = settingsState.profile
  const allowedPages = profile.allowedPages ?? []
  const roleName = profile.role
  const isLoading = !profile.email

  useEffect(() => {
    if (isLoading) return
    if (roleName === 'Admin') return

    if (pathname === '/dashboard') {
      if (!allowedPages.includes('dashboard')) {
        router.replace('/dashboard/profile')
      }
      return
    }

    const routeKeys: Record<string, string> = {
      '/dashboard/surveys': 'surveys',
      '/dashboard/survey-builder': 'survey-builder',
      '/dashboard/responses': 'responses',
      '/dashboard/analytics': 'analytics',
      '/dashboard/assignments': 'assignments',
      '/dashboard/reports': 'reports',
      '/dashboard/users': 'users',
      '/dashboard/branches': 'branches',
      '/dashboard/employee-surveys': 'employee-surveys',
      '/dashboard/audit-log': 'audit-log',
      '/dashboard/settings': 'settings',
    }

    const matchingRoute = Object.keys(routeKeys).find(route => 
      pathname === route || pathname.startsWith(route + '/')
    )

    if (matchingRoute) {
      const pageKey = routeKeys[matchingRoute]
      if (!allowedPages.includes(pageKey)) {
        router.replace('/dashboard')
      }
    }
  }, [pathname, isLoading, roleName, allowedPages, router])

  const openDrawer  = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarCollapsed(prev => !prev), [])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop
    // Hide if scrolling down and not at the very top. Show if scrolling up.
    if (currentScrollY > lastScrollY && currentScrollY > 64) {
      setIsNavHidden(true)
    } else if (currentScrollY < lastScrollY) {
      setIsNavHidden(false)
    }
    setLastScrollY(currentScrollY)
  }, [lastScrollY])

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ── Sidebar ── */}
      <Sidebar
        drawerOpen={drawerOpen}
        onClose={closeDrawer}
        desktopCollapsed={sidebarCollapsed}
        onDesktopToggle={toggleSidebar}
      />

      {/* ── Mobile backdrop ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeDrawer}
          aria-hidden
        />
      )}

      {/* ── Floating expand button (visible only when sidebar is collapsed on desktop) ── */}
      <button
        onClick={toggleSidebar}
        className={`sidebar-expand-fab ${sidebarCollapsed ? 'visible' : ''}`}
        aria-label="Expand sidebar"
      >
        <PanelLeftOpen size={18} />
      </button>

      {/* ── Main column ── */}
      <div 
        className={`flex h-screen min-w-0 flex-col desktop-sidebar-offset ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{ paddingRight: '24px', paddingTop: '24px', paddingBottom: '24px' }}
      >
        <div 
          className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-white relative"
          style={{ borderRadius: '16px', border: '1px solid #E2E8F3', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}
          onScroll={handleScroll}
        >
          {/* Smart Sticky Navbar */}
          <Navbar onMenuClick={openDrawer} isHidden={isNavHidden} />
          
          {/* Page content */}
          <main className="flex min-w-0 flex-1 flex-col">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
