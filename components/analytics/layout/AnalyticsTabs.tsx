'use client'

import { motion } from 'framer-motion'
import { useAnalytics } from '../state/useAnalytics'
import { TabKey } from '@/types/analytics'
import { LayoutDashboard, LayoutGrid, Wand2 } from 'lucide-react'

const tabs: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview',              icon: LayoutDashboard },
  { key: 'custom',   label: 'Custom Dashboards',     icon: LayoutGrid      },
  { key: 'builder',  label: 'Visualization Builder', icon: Wand2           },
]

export function AnalyticsTabs() {
  const { state, dispatch } = useAnalytics()

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-[10px] p-0.5"
      style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
      }}
    >
      {tabs.map(t => {
        const active = state.tab === t.key
        const Icon = t.icon
        return (
          <button
            key={t.key}
            onClick={() => dispatch({ type: 'SET_TAB', tab: t.key })}
            className={`relative inline-flex h-[30px] items-center gap-2.5 rounded-[8px] px-3 text-[12px] font-semibold transition-all duration-150
              ${active
                ? 'text-[var(--primary)]'
                : 'text-[var(--text-light)] hover:text-[var(--text)]'
              }`}
            style={active ? { background: '#fff', boxShadow: 'var(--shadow-xs)' } : {}}
          >
            <Icon size={12} strokeWidth={2.2} />
            {t.label}
            {active && (
              <motion.span
                layoutId="tab-underline"
                className="absolute -bottom-[3px] left-3 right-3 h-[2px] rounded-full"
                style={{ background: 'var(--primary)' }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
