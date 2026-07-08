'use client'

import {
  Palette, Sun, Moon, Monitor, Type, Grid, Check,
} from 'lucide-react'
import { SettingsCard } from '../SettingsCard'
import {
  useSettings,
  type ThemeMode,
  type DensityMode,
  type FontSizeMode,
  type TypographyMode,
} from '@/lib/stores/SettingsStore'
import { useToast } from '@/lib/stores/ToastStore'

interface Props {
  delay?: number
}

export function AppearanceSection({ delay = 0 }: Props) {
  const { state, setTheme, setAccent, setDensity, setFontSize, setTypography } = useSettings()
  const toast = useToast()

  const theme = state.theme
  const density = state.density
  const fontSize = state.fontSize
  const typography = state.typography
  const accent = state.accent

  const themes: { id: ThemeMode; label: string; icon: typeof Sun; desc: string }[] = [
    { id: 'light',  label: 'Light',   icon: Sun,     desc: 'Default bright theme' },
    { id: 'dark',   label: 'Dark',    icon: Moon,    desc: 'Easy on the eyes at night' },
    { id: 'system', label: 'System',  icon: Monitor, desc: 'Follow OS preference' },
  ]

  const densities: { id: DensityMode; label: string; desc: string }[] = [
    { id: 'compact',     label: 'Compact',     desc: 'Tighter spacing, more content' },
    { id: 'comfortable', label: 'Comfortable', desc: 'Balanced spacing, easy to scan' },
    { id: 'spacious',    label: 'Spacious',    desc: 'Generous spacing, maximum focus' },
  ]

  const fontSizes: { id: FontSizeMode; label: string }[] = [
    { id: 'small',  label: 'Small'  },
    { id: 'medium', label: 'Medium' },
    { id: 'large',  label: 'Large'  },
  ]

  const typographyOptions: { id: TypographyMode; label: string; sample: string }[] = [
    { id: 'inter',  label: 'Inter',       sample: 'The quick brown fox' },
    { id: 'system', label: 'System UI',   sample: 'The quick brown fox' },
    { id: 'serif',  label: 'Serif',       sample: 'The quick brown fox' },
  ]

  const accentColors = [
    { name: 'ADNTC Blue', hex: '#0B4A8B' },
    { name: 'Emerald',    hex: '#17A673' },
    { name: 'Amber',      hex: '#F5A623' },
    { name: 'Coral',      hex: '#E5484D' },
    { name: 'Violet',     hex: '#7C3AED' },
    { name: 'Cyan',       hex: '#06B6D4' },
  ]

  function handleThemeChange(t: ThemeMode) {
    setTheme(t)
    toast.info('Theme updated', `Switched to ${t} theme. Applies across all pages.`)
  }
  function handleAccentChange(hex: string) {
    setAccent(hex)
    toast.info('Accent updated', `Primary color changed to ${hex}.`)
  }
  function handleDensityChange(d: DensityMode) {
    setDensity(d)
    toast.info('Density updated', `Layout density set to ${d}.`)
  }
  function handleFontSizeChange(f: FontSizeMode) {
    setFontSize(f)
    toast.info('Font size updated', `Base font size set to ${f}.`)
  }
  function handleTypographyChange(t: TypographyMode) {
    setTypography(t)
    toast.info('Typography updated', `Font family set to ${t}.`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Theme */}
      <SettingsCard
        title="Theme"
        description="Choose the overall color scheme for the platform"
        icon={Palette}
        accent="var(--primary)"
        delay={delay}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {themes.map(t => {
            const Icon = t.icon
            const active = theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className="flex flex-col items-start gap-2 rounded-[12px] border p-4 text-left transition-all"
                style={active
                  ? { background: 'var(--tint-blue)', borderColor: 'var(--primary)' }
                  : { background: 'var(--card)', borderColor: 'var(--border)' }
                }
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.borderColor = 'var(--border-strong)'
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
                    style={active
                      ? { background: 'var(--primary)', color: '#fff' }
                      : { background: 'var(--bg-subtle)', color: 'var(--text-light)' }
                    }
                  >
                    <Icon size={15} strokeWidth={2.1} />
                  </div>
                  {active && (
                    <div
                      className="flex h-[20px] w-[20px] items-center justify-center rounded-full"
                      style={{ background: 'var(--primary)', color: '#fff' }}
                    >
                      <Check size={11} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>{t.label}</div>
                  <div className="mt-0.5 text-[10.5px]" style={{ color: 'var(--text-light)' }}>{t.desc}</div>
                </div>
                {/* Mini preview */}
                <div
                  className="mt-1 h-[36px] w-full rounded-[8px] overflow-hidden flex"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="flex-1" style={{ background: t.id === 'dark' ? '#0D1B2E' : t.id === 'system' ? 'linear-gradient(90deg, #fff 50%, #0D1B2E 50%)' : '#fff' }} />
                  <div className="w-[40%] p-2.5 flex flex-col gap-1" style={{ background: t.id === 'dark' ? '#1A2940' : t.id === 'system' ? 'linear-gradient(90deg, #F4F7FB 50%, #1A2940 50%)' : '#F4F7FB' }}>
                    <div className="h-[4px] w-3/4 rounded-full" style={{ background: t.id === 'dark' || t.id === 'system' ? 'rgba(255,255,255,0.4)' : 'var(--primary)' }} />
                    <div className="h-[3px] w-full rounded-full" style={{ background: t.id === 'dark' || t.id === 'system' ? 'rgba(255,255,255,0.2)' : 'var(--border-strong)' }} />
                    <div className="h-[3px] w-1/2 rounded-full" style={{ background: t.id === 'dark' || t.id === 'system' ? 'rgba(255,255,255,0.2)' : 'var(--border-strong)' }} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </SettingsCard>

      {/* Accent Color */}
      <SettingsCard
        title="Accent Color"
        description="Primary brand color used for buttons, links, and highlights — updates instantly across all pages"
        icon={Palette}
        accent="var(--tint-purple-fg)"
        delay={delay + 0.05}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {accentColors.map(c => {
            const active = accent === c.hex
            return (
              <button
                key={c.hex}
                onClick={() => handleAccentChange(c.hex)}
                className="flex flex-col items-center gap-2 rounded-[10px] border p-3 transition-all"
                style={active
                  ? { background: `${c.hex}0D`, borderColor: `${c.hex}80` }
                  : { background: 'var(--card)', borderColor: 'var(--border)' }
                }
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.borderColor = 'var(--border-strong)'
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                <div
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-full"
                  style={{ background: c.hex, border: '2px solid rgba(0,0,0,0.08)' }}
                >
                  {active && <Check size={16} color="#fff" strokeWidth={2.5} />}
                </div>
                <div className="text-[10.5px] font-semibold text-center" style={{ color: 'var(--text)' }}>{c.name}</div>
              </button>
            )
          })}
        </div>
      </SettingsCard>


    </div>
  )
}
