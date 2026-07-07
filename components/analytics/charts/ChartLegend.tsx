'use client'

interface ChartLegendProps {
  items: { label: string; value?: string | number; color: string }[]
  className?: string
}

/**
 * ChartLegend — premium legend used alongside pie/donut charts.
 *
 * Polish:
 *  - design tokens
 *  - 10px colored dot (rounded)
 *  - label + bold tabular value
 *  - comfortable 6px row gap
 */
export function ChartLegend({ items, className = '' }: ChartLegendProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-3 text-[11.5px]">
          <div className="flex items-center gap-2">
            <span
              className="h-[10px] w-[10px] flex-shrink-0 rounded-[3px]"
              style={{ background: item.color }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
          </div>
          {item.value !== undefined && (
            <span
              className="font-bold tabular"
              style={{ color: 'var(--text)' }}
            >
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
