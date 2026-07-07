const COLS = ['w-[36px]', 'w-[220px]', 'w-[110px]', 'w-[90px]', 'w-[70px]', 'w-[70px]', 'w-[100px]', 'w-[80px]', 'w-[28px]']

export default function SurveyTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b px-4 py-[13px] last:border-b-0"
          style={{ borderColor: 'var(--border)' }}
        >
          {COLS.map((w, j) => (
            <div key={j} className={`shimmer h-3 ${w} rounded-[4px]`} />
          ))}
        </div>
      ))}
    </div>
  )
}
