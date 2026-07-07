import { type LucideIcon } from 'lucide-react'

interface SurveyStatCardProps {
  label: string
  value: string
  sub: string
  icon: LucideIcon
  tint: { bg: string; fg: string }
  trend?: { dir: 'up' | 'down' | 'flat'; text: string }
}

/**
 * SurveyStatCard — horizontal icon-left KPI card used on the Surveys page.
 * Distinct from the Dashboard's MetricCard: icon sits beside the value/label
 * block instead of above it, and there is no sparkline.
 */
export default function SurveyStatCard({ label, value, icon: Icon, tint, trend }: SurveyStatCardProps) {
  const color = trend?.dir === 'up' ? 'var(--emerald)' : trend?.dir === 'down' ? 'var(--red)' : 'var(--text-light)'
  const arrow = trend?.dir === 'up' ? '↑' : trend?.dir === 'down' ? '↓' : '—'

  return (
    <div
      className="flex flex-col items-center justify-center text-center rounded-[18px] bg-white p-8 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(13,27,46,0.1)] hover:-translate-y-[2px] min-h-[160px]"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
      <div className="mb-4 flex flex-col items-center gap-3 w-full relative">
        <span
          className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-[12px]"
          style={{ background: tint.bg, color: tint.fg }}
        >
          <Icon size={18} strokeWidth={2.1} />
        </span>
        <div className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-light)' }}>
          {label}
        </div>
      </div>

      <div className="mb-3 flex items-baseline justify-center gap-2.5 leading-tight w-full">
        <div
          className="text-[36px] font-extrabold leading-tight tabular"
          style={{ color: 'var(--text)', letterSpacing: '-0.035em' }}
        >
          {value}
        </div>
      </div>

      {trend && (
        <div className="flex flex-col items-center justify-center gap-2 w-full mt-1">
          <div className="flex items-center gap-2.5 text-[11.5px] font-semibold" style={{ color }}>
            <span>{arrow}</span>
            <span className="break-words">{trend.text}</span>
          </div>
        </div>
      )}
    </div>
  )
}
