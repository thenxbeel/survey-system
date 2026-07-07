"use client";

import { AlertCircle, Clock, UserCheck, CheckCircle2, ArrowRight } from "lucide-react";

const METRICS = [
  { icon: AlertCircle, label: "Open Cases",     value: 38, color: "#ef4444" },
  { icon: Clock,       label: "High Priority",  value: 12, color: "#f59e0b" },
  { icon: UserCheck,   label: "Assigned",        value: 24, color: "#0B4A8B" },
  { icon: CheckCircle2,label: "Resolved Today",  value: 9,  color: "#22c55e" },
];

const CASES = [
  { id: "FU-091", customer: "Ahmed K.", issue: "Delayed delivery complaint", priority: "High", age: "2d" },
  { id: "FU-092", customer: "Sarah M.", issue: "Billing discrepancy",        priority: "High", age: "1d" },
  { id: "FU-093", customer: "Omar R.",  issue: "Product quality concern",    priority: "Med",  age: "3d" },
  { id: "FU-094", customer: "Layla T.", issue: "Support response time",      priority: "Low",  age: "5d" },
];

const PRIORITY_COLOR: Record<string, string> = {
  High: "#ef4444", Med: "#f59e0b", Low: "#0B4A8B",
};

export default function FollowUpPanel() {
  return (
    <div
      className="rounded-[28px] p-6 flex flex-col gap-6"
      style={{
        background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-700 text-base text-white" style={{ fontWeight: 700 }}>Follow-up Panel</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Open customer cases</p>
        </div>
        <button
          className="flex items-center gap-2.5 text-xs font-600 rounded-xl px-6 py-3 items-center justify-center text-center"
          style={{
            fontWeight: 600, color: "#818cf8",
            background: "rgba(11, 74, 139,0.15)",
            border: "1px solid rgba(11, 74, 139,0.25)",
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          View All <ArrowRight size={11} />
        </button>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-4">
        {METRICS.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
            </div>
            <p className="text-2xl font-800 text-white" style={{ fontWeight: 800 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Case list */}
      <div className="flex flex-col gap-3">
        {CASES.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 cursor-pointer transition-all duration-200"
            style={{ background: "rgba(138, 148, 166, 0.12)", border: "1px solid rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(138, 148, 166, 0.12)"; }}
          >
            <div
              className="w-1.5 self-stretch rounded-full shrink-0"
              style={{ background: PRIORITY_COLOR[c.priority] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-600 text-white truncate" style={{ fontWeight: 600 }}>{c.customer} — {c.issue}</p>
              <p className="text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.35)" }}>{c.id}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className="text-xs font-600 rounded-lg px-2 py-0.5"
                style={{
                  fontWeight: 600,
                  background: `${PRIORITY_COLOR[c.priority]}20`,
                  color: PRIORITY_COLOR[c.priority],
                }}
              >
                {c.priority}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{c.age}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
