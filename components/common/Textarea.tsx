"use client";

import React from "react";

/**
 * Textarea — official shared textarea component (Phase 3 §5.4).
 *
 * Matches the Input component's styling. Supports vertical resize only.
 *
 * Props: standard textarea attributes plus className.
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export default function Textarea({
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={`
        w-full min-h-[80px] resize-y
        rounded-[10px] border border-border bg-white
        px-3.5 py-2.5
        text-[13px] text-text
        outline-none transition-all duration-200
        focus:border-primary
        focus:ring-2 focus:ring-primary/10
        hover:border-border-strong
        placeholder:text-text-muted
        ${className}
      `}
      {...props}
    />
  );
}
