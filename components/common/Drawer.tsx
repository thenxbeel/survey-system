"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, type LucideIcon } from "lucide-react";

/**
 * Drawer — official shared drawer component (Phase 3 §5.13).
 *
 * Right slide-in panel for record inspection / editing.
 *
 * Behavior:
 *   - Conditionally mounted (per Blueprint §5.13)
 *   - Escape key closes
 *   - Backdrop click closes
 *   - Focus trap (Tab cycles within drawer)
 *   - Body scroll locked while open
 *   - Slides in from right (280ms)
 *
 * Sizes: sm (400px), md (480px), lg (640px), xl (840px)
 * Mobile: full-width (w-full max-w-full)
 *
 * Props:
 *   - open:    boolean
 *   - onClose: () => void
 *   - title:   drawer title
 *   - subtitle: optional subtitle
 *   - icon:    optional Lucide icon
 *   - size:    'sm' | 'md' | 'lg' | 'xl'
 *   - children: body content
 *   - footer:  optional footer (action buttons)
 */
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const SIZE_WIDTHS: Record<NonNullable<DrawerProps["size"]>, string> = {
  sm: "w-[400px]",
  md: "w-[480px]",
  lg: "w-[640px]",
  xl: "w-[840px]",
};

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  size = "md",
  children,
  footer,
  className = "",
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      if (panelRef.current) {
        const first = panelRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        first?.focus();
      }
    }, 50);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute right-0 top-0 bottom-0 flex flex-col bg-white ${SIZE_WIDTHS[size]} max-w-[90vw] ${className}`}
            style={{ borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2.5">
                {Icon && (
                  <div
                    className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px]"
                    style={{ background: "var(--tint-blue)", color: "var(--primary)" }}
                  >
                    <Icon size={15} strokeWidth={2.2} />
                  </div>
                )}
                <div>
                  <h2
                    id="drawer-title"
                    className="text-[15px] font-extrabold"
                    style={{ color: "var(--text)", letterSpacing: "-0.015em" }}
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-[11.5px]" style={{ color: "var(--text-light)" }}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center text-center rounded-[8px] p-2 transition-colors text-text-light hover:bg-bg-subtle hover:text-text"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">{children}</div>
            </div>

            {/* Footer */}
            {footer && (
              <div
                className="flex items-center justify-end gap-2 px-6 py-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Drawer;
