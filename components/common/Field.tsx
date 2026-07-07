"use client";

import React from "react";

/**
 * Field — official form-field wrapper (Phase 3 §5.5).
 *
 * Composition:
 *   ┌─────────────────────────────┐
 *   │ LABEL (10.5px, bold, upper) │  ← text-[10.5px] font-bold uppercase tracking-[0.08em]
 *   ├─────────────────────────────┤
 *   │ [Input / Select / Textarea] │
 *   ├─────────────────────────────┤
 *   │ Helper text (11px, muted)   │  ← optional
 *   └─────────────────────────────┘
 *
 * Props:
 *   - label:    field label (required)
 *   - required: shows red asterisk after label
 *   - error:    error message string (shows red error text + aria-invalid on child)
 *   - helper:   helper text below input
 *   - children: the input/select/textarea element
 *   - htmlFor:  id of the input element (for label association)
 */
interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helper?: string;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export default function Field({
  label,
  required = false,
  error,
  helper,
  children,
  htmlFor,
  className = "",
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-light"
      >
        {label}
        {required && <span className="ml-0.5 text-red">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-red" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p className="text-[11px] text-text-muted">{helper}</p>
      ) : null}
    </div>
  );
}
