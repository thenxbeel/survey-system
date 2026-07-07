"use client";

import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

/**
 * HeroBanner — official page hero banner (Phase 3 §13.1, §5.8 hero variant).
 *
 * This is the single composition for page headers on all dashboard pages.
 * Eliminates the 7× duplicated hero shell (GreetingHero, AnalyticsHeader,
 * ReportHeader, CustomerHeader, UserHeader, FollowupHeader, Settings hero).
 *
 * Composition:
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │ [GRADIENT BANNER — rounded-[22px], p-8, hero-bg]              │
 *   │                                                               │
 *   │  [44×44 ICON]  H1 TITLE (20px white)      [counter chips]    │
 *   │                Description (12px white)    [actions]          │
 *   │                                                               │
 *   └───────────────────────────────────────────────────────────────┘
 *
 * Props:
 *   - icon:        Lucide icon component
 *   - title:       page title (20px extrabold white)
 *   - description: subtitle (12px white/62%)
 *   - children:    right-cluster content (counter chips + action buttons)
 *
 * The ambient glow + geometric pattern are baked in (per Blueprint §13.1).
 */
interface HeroBannerProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function HeroBanner({
  icon: Icon,
  title,
  description,
  children,
  className = "",
}: HeroBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col gap-4 overflow-hidden rounded-[22px] p-8 lg:flex-row lg:items-center lg:justify-between ${className}`}
      style={{
        background: "var(--hero-bg)",
        boxShadow: "0 10px 40px rgba(11,74,139,0.32), 0 2px 8px rgba(11,74,139,0.16)",
        minHeight: 110,
      }}
    >
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(11,107,196,0.22) 0%, transparent 70%)",
            "radial-gradient(ellipse 40% 60% at 100% 80%, rgba(4,37,78,0.4) 0%, transparent 60%)",
          ].join(","),
        }}
      />
      {/* Geometric pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(45deg,  #fff 0 1px, transparent 1px 44px)",
            "repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 44px)",
          ].join(","),
        }}
      />

      {/* Left: icon + title + description */}
      <div className="relative z-[1] flex min-w-0 items-center gap-3">
        <div
          className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-[13px]"
          style={{ background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.18)" }}
        >
          <Icon size={20} color="#fff" />
        </div>
        <div className="min-w-0">
          <h1
            className="break-words text-[20px] font-extrabold text-white"
            style={{ letterSpacing: "-0.025em", lineHeight: 1.2 }}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 break-words text-[12px]" style={{ color: "rgba(255,255,255,0.62)" }}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right: counter chips + actions (consumer-provided) */}
      {children && (
        <div className="relative z-[1] flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </motion.div>
  );
}

export default HeroBanner;
