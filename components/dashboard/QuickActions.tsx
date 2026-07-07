"use client";

import { FilePlus, Send, Download, UserPlus } from "lucide-react";

const ACTIONS = [
  {
    icon: FilePlus,
    label: "Create Survey",
    desc: "New survey",
    gradient: "linear-gradient(135deg,#0B4A8B,#8b5cf6)",
    shadow: "rgba(11, 74, 139,0.35)",
  },
  {
    icon: Send,
    label: "Publish Survey",
    desc: "Go live",
    gradient: "linear-gradient(135deg,#06b6d4,#0891b2)",
    shadow: "rgba(6,182,212,0.35)",
  },
  {
    icon: Download,
    label: "Export Report",
    desc: "Download PDF",
    gradient: "linear-gradient(135deg,#22c55e,#17A673)",
    shadow: "rgba(34,197,94,0.35)",
  },
  {
    icon: UserPlus,
    label: "Create User",
    desc: "Add member",
    gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
    shadow: "rgba(245,158,11,0.35)",
  },
];

export default function QuickActions() {
  return (
    <div className="card p-6">
      <div className="mb-5">
        <p className="font-700 text-base" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Quick Actions</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Common tasks</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {ACTIONS.map(({ icon: Icon, label, desc, gradient, shadow }) => (
          <button
            key={label}
            className="flex flex-col items-start gap-3 rounded-2xl p-5 cursor-pointer transition-all duration-200 items-center justify-center text-center"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              fontFamily: "inherit",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${shadow}`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "none";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{
                width: 40, height: 40,
                background: gradient,
                boxShadow: `0 4px 12px ${shadow}`,
              }}
            >
              <Icon size={18} color="#fff" />
            </div>
            <div>
              <p className="text-sm font-600" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
