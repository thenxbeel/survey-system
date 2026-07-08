'use client'

import { useState } from 'react'
import { SettingsCard, Field } from '../SettingsCard'
import { Globe, Clock, Check, ChevronDown } from 'lucide-react'
import { useToast } from '@/lib/stores/ToastStore'
import { useSettings } from '@/lib/stores/SettingsStore'

interface Props {
  delay?: number
}

const selectCls = 'h-[36px] w-full appearance-none rounded-[9px] border border-[var(--border)] bg-white pl-3 pr-9 text-[12px] font-medium text-[var(--text)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(11,74,139,0.1)] cursor-pointer'

export function PreferencesSection({ delay = 0 }: Props) {
  const toast = useToast()
  const { state, setLanguage: setStoreLanguage } = useSettings()

  const [language, setLanguage] = useState(state.language)
  const [timezone, setTimezone] = useState('asia/dubai')

  function handleSave() {
    setStoreLanguage('English')
    setLanguage('English')
    toast.success('Preferences saved', 'Language and timezone updated.')
  }

  return (
    <div className="flex flex-col gap-6">
      <SettingsCard
        title="Localization"
        description="Manage your language and time zone preferences."
        icon={Globe}
        delay={delay}
        footer={
          <button
            onClick={handleSave}
            className="flex h-[32px] items-center justify-center gap-2 rounded-[8px] px-5 text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--primary)', boxShadow: '0 2px 8px rgba(11,74,139,0.2)' }}
          >
            <Check size={14} strokeWidth={2.5} />
            Save Preferences
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Display Language" icon={Globe}>
            <div className="relative">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className={selectCls}
              >
                <option value="English">English (US)</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>
          </Field>

          <Field label="Time Zone" icon={Clock}>
            <div className="relative">
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className={selectCls}
              >
                <option value="utc">UTC (Coordinated Universal Time)</option>
                <option value="america/new_york">Eastern Time (ET)</option>
                <option value="america/chicago">Central Time (CT)</option>
                <option value="america/denver">Mountain Time (MT)</option>
                <option value="america/los_angeles">Pacific Time (PT)</option>
                <option value="europe/london">London (GMT/BST)</option>
                <option value="europe/paris">Paris (CET/CEST)</option>
                <option value="asia/dubai">Gulf Standard Time (GST)</option>
                <option value="asia/singapore">Singapore (SGT)</option>
                <option value="asia/tokyo">Tokyo (JST)</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>
          </Field>
        </div>
      </SettingsCard>
    </div>
  )
}
