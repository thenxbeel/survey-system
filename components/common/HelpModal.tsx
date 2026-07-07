"use client";

import React, { useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { Modal } from "./Modal";

/**
 * HelpModal — official help & documentation modal (Phase 3 §4.2).
 *
 * Extracted from components/layout/Navbar.tsx (was a 90-line inline component)
 * to be the single canonical help modal.
 *
 * Composition:
 *   - Uses common/Modal for the shell (backdrop, header, focus trap, Escape)
 *   - Body: help sections (Dashboard Overview, KPI Cards, Filters, Export,
 *     Search, Keyboard Shortcuts, FAQ)
 *   - Footer: version label + Close button
 *
 * Props:
 *   - open:    boolean
 *   - onClose: () => void
 */
interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

function HelpSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        className="mb-1.5 flex items-center gap-2.5 text-[12px] font-bold"
        style={{ color: "var(--text)" }}
      >
        <span>{icon}</span> {title}
      </h3>
      <div
        className="text-[11.5px] leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </div>
    </div>
  );
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  // Lock body scroll while modal is open (Modal component handles this,
  // but we add it here for safety since this is a leaf component).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Help & Documentation"
      description="ADNTC CX Platform v1.0.0"
      icon={HelpCircle}
      size="lg"
      footer={
        <>
          <span
            className="text-[10px] font-semibold mr-auto"
            style={{ color: "var(--text-muted)" }}
          >
            ADNTC CX Platform v1.0.0
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center text-center rounded-[9px] px-6 py-3 text-[12px] font-semibold text-white "
            style={{ background: "var(--primary)" }}
          >
            Close
          </button>
        </>
      }
    >
      <HelpSection title="Dashboard Overview" icon="📊">
        The dashboard displays real-time KPIs (Total Responses, NPS Score,
        Active Surveys, Response Rate) computed from the live database. Charts
        and tables update automatically when you change filters.
      </HelpSection>
      <HelpSection title="KPI Cards" icon="📈">
        <strong>Total Responses</strong> — count of all survey responses in the
        selected period.
        <br />
        <strong>NPS Score</strong> — calculated as % Promoters minus % Detractors
        (scale -100 to +100).
        <br />
        <strong>Active Surveys</strong> — surveys currently in ACTIVE lifecycle
        status.
        <br />
        <strong>Response Rate</strong> — responses vs invitations (heuristic).
      </HelpSection>
      <HelpSection title="Filters" icon="🔍">
        Use the <strong>Period</strong> selector (7d/30d/90d/1y) to change the
        date range. Use the <strong>Branch</strong> dropdown to filter by branch.
        All KPIs, charts, and tables refresh automatically when filters change.
      </HelpSection>
      <HelpSection title="Export" icon="💾">
        Click the <strong>Export</strong> button to download dashboard data as
        CSV. Choose from Executive Summary, All Responses, Survey Performance,
        or Campaign Report. The export respects the current period and branch
        filters.
      </HelpSection>
      <HelpSection title="Search" icon="🔎">
        Use the search bar (top-center) to search across Surveys, Responses,
        Users, and Campaigns. Results appear in a dropdown — click any result to
        navigate to that page. Press <kbd className="rounded-[5px] border px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-light)" }}>⌘K</kbd> to focus the search input.
      </HelpSection>
      <HelpSection title="Keyboard Shortcuts" icon="⌨️">
        <kbd className="rounded-[5px] border px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-light)" }}>⌘K</kbd> — Focus global search
        <br />
        <kbd className="rounded-[5px] border px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-light)" }}>Esc</kbd> — Close modals / panels
      </HelpSection>
      <HelpSection title="FAQ" icon="❓">
        <strong>Q: How often is the data refreshed?</strong>
        <br />
        A: Dashboard data is fetched live from the database on every page load
        and filter change.
        <br />
        <br />
        <strong>Q: Can I export to Excel?</strong>
        <br />
        A: Yes — CSV exports can be opened directly in Excel.
        <br />
        <br />
        <strong>Q: How are NPS scores calculated?</strong>
        <br />
        A: NPS = % Promoters (9-10) − % Detractors (0-6). Passives (7-8) are
        excluded from the calculation.
      </HelpSection>
      <div
        className="rounded-[10px] border p-3"
        style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
      >
        <p
          className="text-[11.5px] font-semibold"
          style={{ color: "var(--text-secondary)" }}
        >
          Contact Administrator
        </p>
        <p
          className="mt-0.5 text-[11px]"
          style={{ color: "var(--text-light)" }}
        >
          For technical support, contact your system administrator or IT
          department.
        </p>
      </div>
    </Modal>
  );
}

export default HelpModal;
