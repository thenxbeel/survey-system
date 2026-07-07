"use client";

import React from "react";

/**
 * TableSkeleton — official table loading skeleton (Phase 3 §5.21).
 *
 * Promoted from components/dashboard/surveys/SurveyTableSkeleton.tsx to be
 * the single canonical table skeleton. Parameterized by column widths.
 *
 * Props:
 *   - rows:      number of skeleton rows (default 8)
 *   - columns:   array of column widths (Tailwind width classes)
 *                defaults to a 6-column layout
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: string[];
  className?: string;
}

const DEFAULT_COLUMNS = [
  "w-[36px]",
  "w-[220px]",
  "w-[110px]",
  "w-[90px]",
  "w-[70px]",
  "w-[80px]",
];

export function TableSkeleton({
  rows = 8,
  columns = DEFAULT_COLUMNS,
  className = "",
}: TableSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b px-4 py-[13px] last:border-b-0"
          style={{ borderColor: "var(--border)" }}
        >
          {columns.map((w, j) => (
            <div key={j} className={`shimmer h-3 ${w} rounded-[4px]`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default TableSkeleton;
