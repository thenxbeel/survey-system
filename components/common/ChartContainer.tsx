"use client";

import { type ReactNode } from "react";
import { ChartSkeleton } from "./ChartSkeleton";
import { EmptyState } from "./EmptyState";

/**
 * ChartContainer — official chart wrapper (Phase 3 §5.11).
 *
 * Promoted from components/analytics/charts/ChartContainer.tsx to be the
 * single canonical chart wrapper across the application.
 *
 * Composition:
 *   - White card (rounded-[14px], border, shadow-xs)
 *   - Header: title (13.5px bold) + description (11.5px light) + optional action
 *   - Body: min-h-[320px], renders children | ChartSkeleton | EmptyState
 *
 * Props:
 *   - title:       chart title
 *   - description: optional subtitle
 *   - children:    chart content (Recharts component, etc.)
 *   - isLoading:   shows ChartSkeleton when true
 *   - isEmpty:     shows EmptyState when true (and not loading)
 *   - action:      optional right-aligned header action (e.g. period toggle)
 */
interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  action?: ReactNode;
}

export function ChartContainer({
  title,
  description,
  children,
  className = "",
  isLoading = false,
  isEmpty = false,
  action,
}: ChartContainerProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={`group flex flex-col rounded-[14px] bg-white p-6 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(13,27,46,0.06)] ${className}`}
      style={{
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className="text-[13.5px] font-bold leading-tight"
            style={{ color: "var(--text)", letterSpacing: "-0.012em" }}
          >
            {title}
          </h3>
          {description && (
            <p
              className="mt-1 text-[11.5px] leading-relaxed"
              style={{ color: "var(--text-light)" }}
            >
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="min-h-[320px] w-full flex-1">
        {isLoading ? (
          <ChartSkeleton />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default ChartContainer;
