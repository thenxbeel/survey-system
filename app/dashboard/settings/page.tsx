'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings as Cog, Shield, Bell, User, Globe, Puzzle, ExternalLink, ChevronRight,
  Check, X, Info, AlertTriangle, Palette,
} from 'lucide-react'
import { SettingsNavItem } from '@/components/settings/SettingsCard'
import { SecuritySection }        from '@/components/settings/sections/SecuritySection'
import { NotificationsSection }   from '@/components/settings/sections/NotificationsSection'
import { ProfileSection }         from '@/components/settings/sections/ProfileSection'
import { AppearanceSection }      from '@/components/settings/sections/AppearanceSection'
import { PreferencesSection }     from '@/components/settings/sections/PreferencesSection'

import { useSettings } from '@/lib/stores/SettingsStore'
import { useToast }    from '@/lib/stores/ToastStore'

type SectionId = 'profile' | 'security' | 'notifications' | 'appearance' | 'preferences'

const NAV_ITEMS: { id: SectionId; label: string; description: string; icon: typeof Cog }[] = [
  { id: 'profile',       label: 'Profile',         description: 'Personal info & settings',       icon: User    },
  { id: 'security',      label: 'Security',        description: 'Password & 2FA',                 icon: Shield  },
  { id: 'notifications', label: 'Notifications',   description: 'Email & in-app alerts',           icon: Bell    },
  { id: 'appearance',    label: 'Appearance',      description: 'Theme, colors & layout',          icon: Palette },
  { id: 'preferences',   label: 'Preferences',     description: 'Language, timezone & more',       icon: Globe   },
]

interface Toast {
  id: string
  type: 'success' | 'info' | 'warning'
  title: string
  message: string
}

const TOAST_ICONS = { success: Check, info: Info, warning: AlertTriangle }
const TOAST_COLORS = { success: '#17A673', info: '#0B4A8B', warning: '#F5A623' }

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('profile')
  const [toasts, setToasts] = useState<Toast[]>([])
  const { reset: resetSettings } = useSettings()
  const globalToast = useToast()

  function pushToast(type: Toast['type'], title: string, message: string) {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setToasts(prev => [...prev, { id, type, title, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  function handleReset() {
    resetSettings()
    pushToast('info', 'Settings reset', 'All appearance and profile settings restored to defaults.')
  }

  function handleSaveAll() {
    // Settings auto-persist via the SettingsStore on every change, so this
    // is a confirmation toast. Also pushes a global toast so it shows even
    // after navigation.
    globalToast.success('Settings saved', 'All settings persisted and applied across the platform.')
    pushToast('success', 'Saved', 'All settings saved successfully.')
  }

  const activeMeta = NAV_ITEMS.find(n => n.id === activeSection)!

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 p-7"
    >
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col gap-4 overflow-hidden rounded-[22px] p-8 lg:flex-row lg:items-center lg:justify-between"
        style={{
          background: 'linear-gradient(135deg, #0B4A8B 0%, #083a70 60%, #052d58 100%)',
          boxShadow: '0 10px 40px rgba(11,74,139,0.32), 0 2px 8px rgba(11,74,139,0.16)',
          minHeight: 110, /* hero should always feel substantial */
        }}
      >
        {/* Ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(11,107,196,0.22) 0%, transparent 70%)',
              'radial-gradient(ellipse 40% 60% at 100% 80%, rgba(4,37,78,0.4) 0%, transparent 60%)',
            ].join(','),
          }}
        />
        {/* Geometric pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: [
              'repeating-linear-gradient(45deg,  #fff 0 1px, transparent 1px 44px)',
              'repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 44px)',
            ].join(','),
          }}
        />

        {/* Title */}
        <div className="relative z-[1] flex min-w-0 items-center gap-3">
          <div
            className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-[13px]"
            style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <Cog size={20} color="#fff" />
          </div>
          <div className="min-w-0">
            <h1
              className="break-words text-[20px] font-extrabold text-white"
              style={{ letterSpacing: '-0.025em', lineHeight: 1.2 }}
            >
              Settings
            </h1>
            <p className="mt-0.5 break-words text-[12px]" style={{ color: 'rgba(255,255,255,0.62)' }}>
              Configure your account, organization, security, and integrations.
            </p>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="relative z-[1] flex flex-wrap items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-[10px] px-6 py-3 text-[12px] font-semibold text-white transition-all hover:opacity-90 items-center justify-center text-center"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Reset to Default
          </button>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 rounded-[10px] px-6 py-3 text-[12px] font-semibold transition-all hover:opacity-90 active:scale-95 items-center justify-center text-center"
            style={{ background: '#fff', color: '#0B4A8B', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
          >
            <Check size={13} strokeWidth={2.5} />
            Save All Changes
          </button>
        </div>
      </motion.div>

      {/* Layout: left rail + content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left rail */}
        <aside className="lg:w-[260px] lg:flex-shrink-0">
          <div
            className="sticky top-[80px] rounded-[18px] bg-white p-2"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
          >
            <div
              className="px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.13em]"
              style={{ color: 'var(--text-muted)' }}
            >
              Sections
            </div>
            <nav className="flex flex-col gap-0.5">
              {NAV_ITEMS.map(item => (
                <SettingsNavItem
                  key={item.id}
                  item={item}
                  active={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                />
              ))}
            </nav>


          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Section header */}
          <motion.div
            key={`header-${activeSection}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 flex items-center gap-2.5"
          >
            <div
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px]"
              style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}
            >
              <activeMeta.icon size={15} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-[16px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.018em' }}>
                {activeMeta.label}
              </h2>
              <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>
                {activeMeta.description}
              </p>
            </div>
          </motion.div>

          {/* Section content with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeSection === 'profile'       && <ProfileSection />}
              {activeSection === 'security'      && <SecuritySection />}
              {activeSection === 'notifications' && <NotificationsSection />}
              {activeSection === 'appearance'    && <AppearanceSection />}
              {activeSection === 'preferences'   && <PreferencesSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Toast stack */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = TOAST_ICONS[t.type]
            const color = TOAST_COLORS[t.type]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto flex w-[340px] items-start gap-3 rounded-[12px] bg-white p-8"
                style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
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
                  onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[5px] transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                  aria-label="Dismiss"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
