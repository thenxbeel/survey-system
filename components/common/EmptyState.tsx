"use client";

import { Inbox, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

/**
 * EmptyState — official shared empty-state component (Phase 3 §5.20).
 *
 * Promoted from components/analytics/charts/EmptyState.tsx to be the single
 * canonical empty state across the entire application.
 *
 * Composition:
 *   ┌──────────────────────────────┐
 *   │         [ICON 22px]          │  ← in 56×56 bg-subtle circle, border
 *   │      Title (13.5px bold)     │
 *   │   Description (11.5px light) │  ← max-w-[260px], centered
 *   │      [Optional CTA]          │
 *   └──────────────────────────────┘
 *
 * Compact mode for inside chart containers (smaller icon, less padding).
 *
 * Props:
 *   - title:       defaults to "No data for current filters"
 *   - description: defaults to "Try adjusting your filters or date range…"
 *   - icon:        Lucide icon (defaults to Inbox)
 *   - action:      optional CTA node (Button)
 *   - compact:     smaller variant for chart containers
 *   - hasActiveFilters: when true, shows filter-aware copy
 */
interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  compact?: boolean;
  hasActiveFilters?: boolean;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  compact = false,
  hasActiveFilters = false,
}: EmptyStateProps) {
  const defaultTitle = hasActiveFilters
    ? "No results match your filters"
    : "No data for current filters";
  const defaultDescription = hasActiveFilters
    ? "Try adjusting your search or filter criteria."
    : "Try adjusting your filters or date range to see results.";

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-3 text-center ${compact ? "py-4" : "py-8"}`}
      role="status"
    >
      <div
        className={`flex items-center justify-center rounded-[14px] ${compact ? "h-10 w-10" : "h-14 w-14"}`}
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          color: "var(--text-light)",
        }}
      >
        <Icon size={compact ? 16 : 22} strokeWidth={1.8} />
      </div>
      <div className="max-w-[260px]">
        <h4
          className={`${compact ? "text-[12px]" : "text-[13.5px]"} font-bold`}
          style={{ color: "var(--text)", letterSpacing: "-0.01em" }}
        >
          {title ?? defaultTitle}
        </h4>
        <p
          className={`mt-1 ${compact ? "text-[10.5px]" : "text-[11.5px]"} leading-relaxed`}
          style={{ color: "var(--text-light)" }}
        >
          {description ?? defaultDescription}
        </p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export default EmptyState;
