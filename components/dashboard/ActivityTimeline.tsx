"use client";

import { FileText, MessageSquare, UserPlus, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";

const ACTIVITIES = [
  { icon: FileText,      color: "#0B4A8B", text: "New survey 'Q3 Brand Loyalty' created",         time: "2 min ago",  bg: "rgba(11, 74, 139,0.1)" },
  { icon: MessageSquare, color: "#22c55e", text: "142 new responses received for Dubai Main",       time: "8 min ago",  bg: "rgba(34,197,94,0.1)" },
  { icon: TrendingUp,    color: "#8b5cf6", text: "NPS score rose to 74 in Abu Dhabi branch",        time: "22 min ago", bg: "rgba(139,92,246,0.1)" },
  { icon: AlertTriangle, color: "#f59e0b", text: "Follow-up FU-089 overdue — reassigned",           time: "1h ago",     bg: "rgba(245,158,11,0.1)" },
  { icon: UserPlus,      color: "#06b6d4", text: "New user 'Mariam Al Rashidi' added as analyst",   time: "2h ago",     bg: "rgba(6,182,212,0.1)" },
  { icon: CheckCircle,   color: "#22c55e", text: "Monthly report for May exported successfully",    time: "3h ago",     bg: "rgba(34,197,94,0.1)" },
];

export default function ActivityTimeline() {
  return (
    <div className="card p-6">
      <div className="mb-5">
        <p className="font-700 text-base" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Recent Activity</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Latest system events</p>
      </div>
      <div className="relative flex flex-col gap-0">
        {/* Vertical line */}
        <div
          className="absolute left-[19px] top-0 bottom-0 w-px"
          style={{ background: "var(--border)" }}
        />
        {ACTIVITIES.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex gap-4 pb-5 last:pb-0 relative">
              <div
                className="flex items-center justify-center rounded-2xl shrink-0 z-10"
                style={{
                  width: 38, height: 38,
                  background: a.bg,
                  border: `1px solid ${a.color}30`,
                }}
              >
                <Icon size={15} style={{ color: a.color }} />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>{a.text}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{a.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
