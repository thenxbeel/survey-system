'use client'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function cellColor(value: number): string {
  switch (value) {
    case 0:  return '#F4F7FB'
    case 1:  return '#DBE7F4'
    case 2:  return '#A8C5E5'
    case 3:  return '#5C8BC4'
    default: return '#0B4A8B'
  }
}

interface Props { data: { day: string; hour: string; value: number }[] }

export function ReportHeatmap({ data }: Props) {
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex flex-1 gap-2.5">
        <div className="flex w-7 flex-col justify-around text-[9px] font-semibold" style={{ color: 'var(--text-light)' }}>
          {DAYS.map(d => <span key={d} className="text-right">{d}</span>)}
        </div>
        <div className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]">
          {HOURS.map(h =>
            DAYS.map((_, dIdx) => {
              const point = data.find(p => p.day === DAYS[dIdx] && p.hour === h.toString())
              const value = point?.value ?? 0
              return (
                <div
                  key={`${dIdx}-${h}`}
                  className="rounded-[3px] transition-all duration-150 hover:scale-[1.15] hover:ring-2 hover:ring-offset-1"
                  style={{
                    background: cellColor(value),
                    '--tw-ring-color': 'var(--primary)',
                  } as React.CSSProperties}
                  title={`Day: ${DAYS[dIdx]}, Hour: ${h.toString().padStart(2, '0')}:00, Intensity: ${value}`}
                />
              )
            })
          )}
        </div>
      </div>
      <div className="ml-8 flex justify-between text-[9px] font-semibold" style={{ color: 'var(--text-light)' }}>
        {[0, 6, 12, 18, 23].map(h => <span key={h}>{h.toString().padStart(2, '0')}:00</span>)}
      </div>
      <div className="ml-8 mt-1 flex items-center justify-end gap-2.5 text-[9px] font-semibold" style={{ color: 'var(--text-light)' }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(v => <span key={v} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: cellColor(v) }} />)}
        <span>More</span>
      </div>
    </div>
  )
}
