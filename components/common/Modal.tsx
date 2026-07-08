"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, type LucideIcon } from "lucide-react";

/**
 * Modal — official shared modal component (Phase 3 §5.12).
 *
 * Composition:
 *   - Backdrop: fixed inset-0, bg-black/40, backdrop-blur-[2px], z-[70]
 *   - Container: centered flex
 *   - Modal card: white, rounded-[18px], border, shadow-xl, max-h-[90vh]
 *     - Header: icon + title + description + close button (border-b)
 *     - Body: scrollable, gap-4
 *     - Footer: border-t, justify-end, gap-2 (consumer provides buttons)
 *
 * Behavior:
 *   - Conditionally mounted (per Blueprint §5.12 — never always-mounted)
 *   - Escape key closes
 *   - Backdrop click closes
 *   - Focus trap (Tab cycles within modal)
 *   - Body scroll locked while open
 *
 * Sizes: sm (400px), md (520px), lg (720px), xl (960px)
 *
 * Props:
 *   - open:       boolean — controls visibility
 *   - onClose:    () => void
 *   - title:      modal title
 *   - description: optional subtitle
 *   - icon:       optional Lucide icon
 *   - size:       'sm' | 'md' | 'lg' | 'xl'
 *   - children:   body content
 *   - footer:     footer content (buttons)
 */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const SIZE_WIDTHS: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[520px]",
  lg: "max-w-[720px]",
  xl: "max-w-[960px]",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  size = "md",
  children,
  footer,
  className = "",
}: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Escape to close + body scroll lock + focus trap
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && cardRef.current) {
        const focusable = cardRef.current.querySelectorAll<HTMLElement>(
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

    // Focus the first focusable element in the modal
    setTimeout(() => {
      if (cardRef.current) {
        const first = cardRef.current.querySelector<HTMLElement>(
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
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-[2.5vw]"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Modal card */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex max-h-[90vh] w-full ${SIZE_WIDTHS[size]} flex-col overflow-hidden rounded-[18px] ${className}`}
            style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)", background: "var(--card)", color: "var(--text)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)" }}
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
                    id="modal-title"
                    className="text-[15px] font-extrabold"
                    style={{ color: "var(--text)", letterSpacing: "-0.015em" }}
                  >
                    {title}
                  </h2>
                  {description && (
                    <p className="text-[11.5px]" style={{ color: "var(--text-light)" }}>
                      {description}
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
              <div className="flex flex-col gap-4">{children}</div>
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

export default Modal;
