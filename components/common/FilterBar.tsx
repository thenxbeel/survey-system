"use client";

import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

/**
 * FilterBar — official filter-bar composition (Phase 3 §4.7, §13.3).
 *
 * This is the single composition for filter controls on every page.
 * Eliminates the three coexisting placements (page-level card,
 * inside-table-container, inline-no-container).
 *
 * Tier-3 bounded card between the stat-card row and the primary content.
 *
 * Composition (left to right):
 *   1. Search input (with Lucide Search icon, 280–400px)
 *   2. Quick filters (selects, max 3 visible)
 *   3. Advanced-filters toggle (ghost button, SlidersHorizontal icon)
 *   4. Clear-filters link (conditional)
 *   5. Spacer (flex-1)
 *   6. Bulk actions (conditional, tinted container)
 *   7. Result count
 *
 * Props:
 *   - search:          controlled search value
 *   - onSearchChange:  search callback
 *   - searchPlaceholder: placeholder text
 *   - quickFilters:    ReactNode of select elements (consumer provides)
 *   - hasAdvanced:     show advanced-filters toggle
 *   - advancedOpen:    advanced panel open state
 *   - onAdvancedToggle: toggle advanced panel
 *   - advancedChildren: ReactNode of advanced filter fields (collapsible)
 *   - hasActiveFilters: show clear-filters link
 *   - onClear:         clear-filters callback
 *   - bulkActions:     ReactNode of bulk action buttons (shown when rows selected)
 *   - totalItems:      result count number
 */
interface FilterBarProps {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  quickFilters?: React.ReactNode;
  hasAdvanced?: boolean;
  advancedOpen?: boolean;
  onAdvancedToggle?: () => void;
  advancedChildren?: React.ReactNode;
  hasActiveFilters?: boolean;
  onClear?: () => void;
  bulkActions?: React.ReactNode;
  totalItems?: number;
  className?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  quickFilters,
  hasAdvanced = false,
  advancedOpen = false,
  onAdvancedToggle,
  advancedChildren,
  hasActiveFilters = false,
  onClear,
  bulkActions,
  totalItems,
  className = "",
}: FilterBarProps) {
  return (
    <div
      className={`rounded-[18px] border bg-white px-5 py-4 ${className}`}
      style={{ borderColor: "var(--border)", boxShadow: "var(--shadow)" }}
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        {onSearchChange && (
          <div className="relative max-w-[400px] flex-1">
            <Search
              size={13}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-[9px] border border-border bg-white py-2 pl-9 pr-3 text-[12px] text-text placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-border-strong"
            />
          </div>
        )}

        {/* Quick filters (consumer-provided selects) */}
        {quickFilters}

        {/* Advanced-filters toggle */}
        {hasAdvanced && onAdvancedToggle && (
          <button
            onClick={onAdvancedToggle}
            className="flex items-center gap-2.5 rounded-[9px] border px-3 h-[32px] text-[12px] font-semibold transition-all items-center justify-center text-center"
            style={
              advancedOpen
                ? { background: "var(--tint-blue)", borderColor: "rgba(11,74,139,0.3)", color: "var(--primary)" }
                : { background: "white", borderColor: "var(--border)", color: "var(--text-secondary)" }
            }
          >
            <SlidersHorizontal size={12} strokeWidth={2.1} />
            Filters
            {hasActiveFilters && (
              <span
                className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                style={{ background: "var(--primary)" }}
              >
                •
              </span>
            )}
          </button>
        )}

        {/* Clear filters */}
        {hasActiveFilters && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] font-semibold transition-colors text-text-light hover:text-text items-center justify-center text-center"
          >
            <X size={11} /> Clear
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bulk actions (consumer-provided) */}
        {bulkActions}

        {/* Result count */}
        {typeof totalItems === "number" && (
          <span className="text-[11px] font-medium tabular text-text-light">
            {totalItems} results
          </span>
        )}
      </div>

      {/* Advanced filters panel (collapsible) */}
      {hasAdvanced && advancedOpen && advancedChildren && (
        <div
          className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-3"
          style={{ borderColor: "var(--border)", background: "var(--bg-subtle)", margin: "16px -20px -16px", padding: "16px 20px" }}
        >
          {advancedChildren}
        </div>
      )}
    </div>
  );
}

export default FilterBar;
