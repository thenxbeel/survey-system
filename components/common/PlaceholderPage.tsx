import type { LucideIcon } from 'lucide-react'
import { Hammer } from 'lucide-react'

interface PlaceholderPageProps {
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  accentColor?: string
}

/**
 * ADNTC CX Platform — Placeholder Page
 * Light surface, tinted icon halo, reference tokens.
 */
export default function PlaceholderPage({
  icon: Icon,
  title,
  subtitle,
  description,
  accentColor = '#0B4A8B',
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-12">
      {/* Icon halo */}
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
      >
        <Icon size={28} style={{ color: accentColor }} />
      </div>

      {/* Heading */}
      <h1 className="mb-2 text-[22px] font-bold tracking-[-0.3px] text-[#333333]">
        {title}
      </h1>
      <p className="mb-8 text-[13px] text-[#8A94A6]">{subtitle}</p>

      {/* Card */}
      <div className="w-full max-w-[520px] rounded-[14px] border border-[#E6EDF3] bg-white p-8 text-center shadow-[0_4px_20px_rgba(11,74,139,0.06)]">
        {/* Coming Soon badge */}
        <span
          className="mb-5 inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.06em]"
          style={{
            borderColor: `${accentColor}40`,
            color: accentColor,
            background: `${accentColor}10`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentColor }} />
          Coming Soon
        </span>

        <p className="mb-6 text-[13px] leading-relaxed text-[#8A94A6]">{description}</p>

        {/* Divider */}
        <div className="mb-6 h-px bg-[#E6EDF3]" />

        {/* Under Development button */}
        <button
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-[10px] border border-[#E6EDF3] bg-[#F5F7FA] px-6 py-3 text-[12px] font-semibold text-[#8A94A6] transition-none items-center justify-center text-center"
        >
          <Hammer size={13} />
          Under Development
        </button>
      </div>

      {/* Subtle bottom note */}
      <p className="mt-6 text-[11px] text-[#8A94A6]">
        Navigate back to{' '}
        <a href="/dashboard" className="font-semibold text-[#0B4A8B] hover:underline">
          Dashboard
        </a>{' '}
        while this module is being built.
      </p>
    </div>
  )
}
