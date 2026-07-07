"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Tabs — official shared tab bar component (Phase 3 §5.17).
 *
 * Single style: underline active indicator. Eliminates the 3 coexisting tab
 * styles (Survey Builder underline, Analytics pills, Branches pills-different).
 *
 * Composition:
 *   ┌─────────────────────────────────────────────────┐
 *   │ [Tab1]  [Tab2]  [Tab3]                          │
 *   │  ────                                           │  ← 2px underline on active
 *   └─────────────────────────────────────────────────┘
 *
 * Props:
 *   - tabs:       array of { id, label, icon? }
 *   - activeId:   currently active tab id
 *   - onChange:   callback receiving the new tab id
 */
export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeId, onChange, className = "" }: TabsProps) {
  return (
    <div
      className={`flex items-center gap-1 border-b ${className}`}
      style={{ borderColor: "var(--border)" }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            className={`relative px-4 py-2.5 text-[12.5px] font-semibold transition-all ${
              isActive ? "text-primary" : "text-text-light hover:text-text"
            }`}
          >
            <span className="flex items-center gap-2.5">
              {Icon && <Icon size={14} />}
              {tab.label}
            </span>
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                style={{ background: "var(--primary)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
