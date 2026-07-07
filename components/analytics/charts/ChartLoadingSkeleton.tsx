'use client'

/**
 * ChartLoadingSkeleton — premium shimmer skeleton for chart containers.
 * Uses the global .shimmer class for a smooth gradient sweep.
 */
export function ChartLoadingSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-1/4 rounded-[4px] shimmer" />
        <div className="h-3 w-1/6 rounded-[4px] shimmer" />
      </div>
      {/* Chart bars skeleton */}
      <div className="flex flex-1 items-end gap-2.5">
        {[55, 78, 42, 88, 65, 72, 50, 90, 60, 75].map((h, i) => (
          <div
            key={i}
            className="h-full w-full rounded-[5px] shimmer"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      {/* X-axis skeleton */}
      <div className="flex items-center justify-between">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="h-2 w-8 rounded-[3px] shimmer" />
        ))}
      </div>
    </div>
  )
}
