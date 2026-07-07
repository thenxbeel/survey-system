"use client";

import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  trendLabel?: string;
  icon: ReactNode;
  gradient: string;
  sparkData?: number[];
  suffix?: string;
  color?: string;
}

export default function StatCard({
  title, value, trend, trendLabel = "vs last week",
  icon, gradient, sparkData = [], suffix = "", color = "#0B4A8B",
}: StatCardProps) {
  const positive = trend >= 0;
  const spark = sparkData.map((v, i) => ({ v }));

  return (
    <div
      className="card p-8 flex flex-col items-center justify-center text-center gap-6 min-h-[220px] cursor-default group"
      style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-2xl flex-shrink-0"
          style={{
            width: 52, height: 52,
            background: gradient,
            boxShadow: `0 6px 20px ${color}30`,
          }}
        >
          <span style={{ color: "#fff" }}>{icon}</span>
        </div>

        {/* Trend badge */}
        <div
          className="flex flex-shrink-0 items-center gap-2.5 rounded-xl px-6 py-3 text-[13px] font-600"
          style={{
            fontWeight: 600,
            background: positive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: positive ? "#17A673" : "#E5484D",
          }}
        >
          {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {positive ? "+" : ""}{trend}%
        </div>
      </div>

      {/* Value */}
      <div className="flex flex-col gap-1">
        <p className="text-4xl font-800 leading-tight mb-2 break-words" style={{ fontWeight: 800, color: "var(--text-primary)" }}>
          {value}{suffix}
        </p>
        <p className="text-[15px] break-words" style={{ color: "var(--text-muted)" }}>{title}</p>
      </div>

      {/* Sparkline */}
      {spark.length > 0 && (
        <div className="w-full" style={{ height: 40, marginTop: -8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark}>
              <defs>
                <linearGradient id={`sg-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone" dataKey="v"
                stroke={color} strokeWidth={2}
                fill={`url(#sg-${title})`}
                dot={false} isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{trendLabel}</p>
    </div>
  );
}
