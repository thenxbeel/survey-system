"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

/**
 * Select — official shared select component (Phase 3 §5.3).
 *
 * Native <select> styled to match the Input component.
 * Uses appearance-none with a Lucide ChevronDown indicator.
 *
 * Props:
 *   - value:    current selected value
 *   - onChange: callback receiving the new string value
 *   - options:  array of { value, label }
 *   - size:     'sm' (h-[32px], for toolbars) | 'md' (h-[40px], for forms)
 *   - className: additional classes for the wrapper
 *
 * Usage:
 *   <Select value={status} onChange={setStatus}
 *     options={[{value:'all',label:'All'},{value:'active',label:'Active'}]} />
 */
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  size?: "sm" | "md";
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export default function Select({
  value,
  onChange,
  options,
  size = "sm",
  className = "",
  id,
  ...ariaProps
}: SelectProps) {
  const heightClass = size === "sm" ? "h-[32px]" : "h-[40px]";

  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full appearance-none rounded-[9px] border border-border bg-white
          ${heightClass}
          pl-3 pr-7 text-[12px] font-medium text-text
          outline-none transition-all
          hover:border-border-strong
          focus:border-primary
          focus:ring-2 focus:ring-primary/10
          cursor-pointer
        `}
        {...ariaProps}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-light"
      />
    </div>
  );
}
