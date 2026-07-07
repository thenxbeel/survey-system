"use client";

import React from "react";

/**
 * PageSkeleton — official page-level loading skeleton (Phase 3 §5.21).
 *
 * Shimmer skeleton matching the typical dashboard page layout:
 *   - KPI row (4 or 7 placeholder cards)
 *   - Chart row (2 placeholder cards)
 *   - Table placeholder
 *
 * Uses the global .shimmer class for a smooth gradient sweep.
 *
 * Props:
 *   - kpiCount: number of KPI placeholder cards (default 4)
 *   - showCharts: show chart row placeholders (default true)
 *   - showTable: show table placeholder (default true)
 */
interface PageSkeletonProps {
  kpiCount?: number;
  showCharts?: boolean;
  showTable?: boolean;
  className?: string;
}

export function PageSkeleton({
  kpiCount = 4,
  showCharts = true,
  showTable = true,
  className = "",
}: PageSkeletonProps) {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* KPI row skeleton */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(kpiCount, 4)}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: kpiCount }).map((_, i) => (
          <div
            key={i}
            className="min-h-[120px] rounded-[18px] shimmer"
            style={{ border: "1px solid var(--border)" }}
          />
        ))}
      </div>

      {/* Chart row skeleton */}
      {showCharts && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div
            className="min-h-[340px] rounded-[18px] shimmer"
            style={{ border: "1px solid var(--border)" }}
          />
          <div
            className="min-h-[340px] rounded-[18px] shimmer"
            style={{ border: "1px solid var(--border)" }}
          />
        </div>
      )}

      {/* Table skeleton */}
      {showTable && (
        <div
          className="rounded-[18px] bg-white"
          style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b px-4 py-[13px] last:border-b-0"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="h-3 w-[36px] rounded-[4px] shimmer" />
              <div className="h-3 w-[220px] rounded-[4px] shimmer" />
              <div className="h-3 w-[110px] rounded-[4px] shimmer" />
              <div className="h-3 w-[90px] rounded-[4px] shimmer" />
              <div className="h-3 w-[70px] rounded-[4px] shimmer" />
              <div className="ml-auto h-3 w-[80px] rounded-[4px] shimmer" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PageSkeleton;
