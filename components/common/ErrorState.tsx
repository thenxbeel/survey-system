"use client";

import React from "react";
import { AlertCircle, RefreshCw, type LucideIcon } from "lucide-react";

/**
 * ErrorState — official shared error-state component (Phase 3 §5.22).
 *
 * Promoted from the Customers page error pattern to be the single canonical
 * full-page error state across the application.
 *
 * Composition:
 *   ┌──────────────────────────────────────┐
 *   │           [ICON 24px]                │  ← in 56×56 red-tint circle
 *   │      Title (15px bold)               │
 *   │   Message (12px light, max-w-md)     │
 *   │      [Retry button]                  │
 *   └──────────────────────────────────────┘
 *
 * Props:
 *   - title:   defaults to "Something went wrong"
 *   - message: error details (max-w-md)
 *   - icon:    Lucide icon (defaults to AlertCircle)
 *   - onRetry: optional retry callback (shows Retry button when provided)
 *   - retryLabel: defaults to "Retry"
 */
interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: LucideIcon;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  icon: Icon = AlertCircle,
  onRetry,
  retryLabel = "Retry",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[18px] bg-white py-20 ${className}`}
      style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
      role="alert"
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-[14px]"
        style={{ background: "var(--tint-red)", border: "1px solid rgba(229,72,77,0.3)" }}
      >
        <Icon size={24} style={{ color: "var(--red)" }} />
      </div>
      <div className="text-[15px] font-bold" style={{ color: "var(--text)" }}>
        {title}
      </div>
      {message && (
        <div className="mt-1 max-w-md text-center text-[12px]" style={{ color: "var(--text-light)" }}>
          {message}
        </div>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex h-[36px] items-center gap-2 rounded-[9px] px-4 text-[12px] font-semibold text-white transition-all hover:opacity-90 items-center justify-center text-center"
          style={{ background: "var(--primary)" }}
        >
          <RefreshCw size={13} />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export default ErrorState;
