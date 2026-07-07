'use client'

import { CalendarDays, SlidersHorizontal, Download, TrendingUp, ArrowUpRight } from 'lucide-react'
import { useSettings } from '@/lib/stores/SettingsStore'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function GreetingHero() {
  const { state: settingsState } = useSettings()
  const profile = settingsState.profile
  const greeting = getGreeting()
  const today = new Date().toLocaleDateString('en-AE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div
      className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-[22px] p-8"
      style={{
        background: 'var(--hero-bg)',
        boxShadow: '0 10px 40px rgba(11,74,139,0.32), 0 2px 8px rgba(11,74,139,0.16)',
        minHeight: 120, /* hero banner should always feel substantial */
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

      {/* Left: greeting */}
      <div className="relative z-[1] flex min-w-0 items-center gap-4">
        <div
          className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[14px]"
          style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          <TrendingUp size={20} color="#fff" />
        </div>
        <div className="min-w-0">
          <h1
            className="break-words text-[22px] font-extrabold text-white"
            style={{ letterSpacing: '-0.025em', lineHeight: 1.2 }}
          >
            {greeting}, {profile.displayName} 👋
          </h1>
          <p className="mt-0.5 break-words text-[12.5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Here is today's customer experience summary.
          </p>
        </div>
      </div>

      {/* Right: NPS badge + actions */}
      <div className="relative z-[1] flex flex-wrap items-center gap-2">
        {/* NPS pulse */}
        <div
          className="flex items-center rounded-[12px]"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">Overall NPS</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-extrabold text-white" style={{ letterSpacing: '-0.03em' }}>+68</span>
              <span className="flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: '#34D399' }}>
                <ArrowUpRight size={12} />
                +4
              </span>
            </div>
          </div>
        </div>

        <button
          className="flex items-center rounded-[10px] text-[12px] font-semibold text-white transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <CalendarDays size={13} />
          <span className="hidden sm:inline">{today}</span>
          <span className="sm:hidden">Today</span>
        </button>
        <button
          className="flex items-center rounded-[10px] text-[12px] font-semibold text-white transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <SlidersHorizontal size={13} />
          Filters
        </button>
        <button
          className="flex items-center rounded-[10px] text-[12px] font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ background: '#fff', color: '#0B4A8B', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Download size={13} />
          Export
        </button>
      </div>
    </div>
  )
}
