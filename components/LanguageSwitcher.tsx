import React, { useEffect, useState } from 'react'
import { useSettings } from '@/lib/stores/SettingsStore'

export default function LanguageSwitcher() {
  const { state, setLanguage } = useSettings()
  const [selected, setSelected] = useState(state.language)

  useEffect(() => {
    setSelected('English')
  }, [state.language])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage('English')
    setSelected('English')
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="lang-select" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        Language
      </label>
      <select
        id="lang-select"
        value={selected}
        onChange={handleChange}
        className="rounded border bg-var(--card) text-var(--text) p-1"
      >
        <option value="English">English</option>
      </select>
    </div>
  )
}
