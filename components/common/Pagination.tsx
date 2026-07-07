"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination — official shared pagination component (Phase 3 §5.18).
 *
 * Single composition: Lucide chevron icons + "Showing X–Y of Z" + page indicator.
 * Eliminates the 3 coexisting pagination patterns (text arrows, Lucide, inline).
 *
 * Props:
 *   - page:        current page (1-indexed)
 *   - totalPages:  total number of pages
 *   - totalItems:  total result count
 *   - pageSize:    items per page
 *   - onPageChange: callback receiving the new page number
 */
interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={`flex items-center justify-between px-5 py-3 ${className}`}
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <p className="text-[11.5px] text-text-light tabular">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-[6px] border border-border p-2.5 text-text-secondary transition-colors hover:bg-bg-subtle disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderColor: "var(--border)" }}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="px-3 text-[11.5px] font-medium text-text tabular">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-[6px] border border-border p-2.5 text-text-secondary transition-colors hover:bg-bg-subtle disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderColor: "var(--border)" }}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
