"use client";

import React from "react";

/**
 * ChartSkeleton — official chart loading skeleton (Phase 3 §5.21).
 *
 * Promoted from components/analytics/charts/ChartLoadingSkeleton.tsx to be
 * the single canonical chart skeleton. Uses the global .shimmer class.
 *
 * Renders a header skeleton + bar chart skeleton + x-axis skeleton.
 */
interface ChartSkeletonProps {
  className?: string;
}

export function ChartSkeleton({ className = "" }: ChartSkeletonProps) {
  return (
    <div className={`flex h-full w-full flex-col gap-4 ${className}`}>
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
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-2 w-8 rounded-[3px] shimmer" />
        ))}
      </div>
    </div>
  );
}

export default ChartSkeleton;
