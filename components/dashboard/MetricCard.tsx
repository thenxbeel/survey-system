import { type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  suffix?: string
  sub: string
  icon?: LucideIcon
  tint?: { bg: string; fg: string }
  trend?: { dir: 'up' | 'down' | 'flat'; text: string }
  sparkData?: number[]
}

/**
 * MetricCard — premium KPI card used on Dashboard + Surveys.
 *
 * Polish:
 *  - 32px padding (p-8) for comfortable containment (zoomed out)
 *  - smoother hover (cubic-bezier, subtle lift)
 *  - refined sparkline with end-dot
 *  - design tokens throughout
 *  - 8pt spacing rhythm
 */
export default function MetricCard({ label, value, suffix, sub, icon: Icon, tint, trend, sparkData }: MetricCardProps) {
  const up = trend?.dir === 'up'

  const sparkPoints = sparkData && sparkData.length > 1
    ? sparkData.map((v, i) => {
        const max = Math.max(...sparkData)
        const min = Math.min(...sparkData)
        const x = (i / (sparkData.length - 1)) * 100
        const y = 38 - ((v - min) / Math.max(1, max - min)) * 30
        return `${x},${y}`
      }).join(' ')
    : null

  const sparkColor = up ? 'var(--emerald)' : 'var(--red)'
  const sparkFill = up ? '#10B981' : '#EF4444'

  return (
    <div
      className="group relative flex flex-col items-center justify-center text-center rounded-[18px] bg-white p-8 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(13,27,46,0.1)] hover:-translate-y-[2px]"
      style={{
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        minHeight: 220, /* higher minHeight to fit content comfortably with extra padding */
      }}
    >
      {/* Top row — label + icon */}
      <div className="mb-4 flex flex-col items-center gap-3">
        {Icon && tint && (
          <span
            className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-[12px] transition-transform duration-200 group-hover:scale-105"
            style={{ background: tint.bg, color: tint.fg }}
          >
            <Icon size={18} strokeWidth={2.1} />
          </span>
        )}
        <span
          className="text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: 'var(--text-light)' }}
        >
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="mb-3 flex items-baseline justify-center gap-2.5 leading-tight">
        <span
          className="text-[36px] font-extrabold tabular leading-tight"
          style={{ color: 'var(--text)', letterSpacing: '-0.035em' }}
        >
          {value}
        </span>
        {suffix && (
          <span
            className="text-[16px] font-semibold"
            style={{ color: 'var(--text-light)' }}
          >
            {suffix}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div
          className="mb-4 flex flex-wrap items-center justify-center gap-2 text-[12px] font-semibold"
          style={{ color: up ? 'var(--emerald)' : 'var(--red)' }}
        >
          <span
            className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ background: up ? 'var(--tint-emerald)' : 'var(--tint-red)' }}
          >
            {up ? '↑' : '↓'}
          </span>
          <span className="break-words">{trend.text}</span>
        </div>
      )}

      {/* Sparkline */}
      {sparkPoints && (
        <div className="h-[40px] w-full mb-4">
          <svg viewBox="0 0 100 40" width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sparkFill} stopOpacity="0.18" />
                <stop offset="100%" stopColor={sparkFill} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points={sparkPoints + ` 100,40 0,40`}
              fill={`url(#sg-${label})`}
              stroke="none"
            />
            <polyline
              points={sparkPoints}
              fill="none"
              stroke={sparkColor}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* End dot */}
            {sparkData && sparkData.length > 1 && (
              <circle
                cx={100}
                cy={38 - ((sparkData[sparkData.length - 1] - Math.min(...sparkData)) / Math.max(1, Math.max(...sparkData) - Math.min(...sparkData))) * 30}
                r="3"
                fill={sparkColor}
                stroke="#fff"
                strokeWidth="1.5"
              />
            )}
          </svg>
        </div>
      )}

      {/* Sub */}
      <div className="text-[12px] font-bold text-black">{sub}</div>
    </div>
  )
}
