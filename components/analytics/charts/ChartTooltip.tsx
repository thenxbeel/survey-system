'use client'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number | string
    color?: string
    payload?: Record<string, unknown>
  }>
  label?: string
  /** Optional formatter for the value */
  valueFormatter?: (value: number | string | undefined, name?: string) => string
  /** Optional suffix appended after the formatted value */
  suffix?: string
}

/**
 * ChartTooltip — premium tooltip used by every Recharts chart.
 *
 * Polish:
 *  - design tokens + softer shadow
 *  - 12px padding, 10px radius
 *  - colored dot + label + bold tabular value
 *  - subtle entrance (CSS handles it via recharts wrapper)
 */
export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  suffix = '',
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div
      className="rounded-[10px] bg-white px-3 py-2.5"
      style={{
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: '120px',
      }}
    >
      {label && (
        <p
          className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.04em]"
          style={{ color: 'var(--text-light)' }}
        >
          {label}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            {entry.color && (
              <span
                className="h-[8px] w-[8px] flex-shrink-0 rounded-full"
                style={{ background: entry.color }}
              />
            )}
            <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
            <span
              className="ml-auto font-bold tabular"
              style={{ color: 'var(--text)' }}
            >
              {valueFormatter ? valueFormatter(entry.value, entry.name) : entry.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
