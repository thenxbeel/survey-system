"use client";

import { Sparkles } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function WelcomeHero() {
  return (
    <div
      className="rounded-[28px] p-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg,#0B4A8B 0%,#8b5cf6 50%,#a78bfa 100%)",
        boxShadow: "0 8px 40px rgba(11, 74, 139,0.4)",
        minHeight: 140,
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-10 -right-10 rounded-full opacity-20"
        style={{ width: 200, height: 200, background: "rgba(255,255,255,0.3)", filter: "blur(40px)" }}
      />
      <div
        className="absolute -bottom-8 -left-8 rounded-full opacity-15"
        style={{ width: 160, height: 160, background: "rgba(255,255,255,0.4)", filter: "blur(30px)" }}
      />

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} style={{ color: "rgba(255,255,255,0.75)" }} />
            <span className="text-sm font-500" style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
              NPS Dashboard
            </span>
          </div>
          <h1 className="text-3xl font-800 text-white leading-tight" style={{ fontWeight: 800 }}>
            {getGreeting()}, Nabeel 👋
          </h1>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 420 }}>
            Customer satisfaction increased by <strong style={{ color: "#fff" }}>12%</strong> this week.
            You have <strong style={{ color: "#fff" }}>38 open follow-ups</strong> waiting for action.
          </p>
        </div>

        <div className="flex gap-4">
          {[
            { label: "Today's Responses", value: "142" },
            { label: "Active Surveys",    value: "8" },
            { label: "Avg NPS",           value: "72" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-2xl px-5 py-4 text-center"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                minWidth: 90,
              }}
            >
              <p className="text-2xl font-800 text-white" style={{ fontWeight: 800 }}>{m.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
