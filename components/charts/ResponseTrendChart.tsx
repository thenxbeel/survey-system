"use client";

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";

const DATA = [
  { month: "Jan", responses: 420, target: 400 },
  { month: "Feb", responses: 380, target: 400 },
  { month: "Mar", responses: 510, target: 420 },
  { month: "Apr", responses: 490, target: 430 },
  { month: "May", responses: 630, target: 450 },
  { month: "Jun", responses: 580, target: 460 },
  { month: "Jul", responses: 720, target: 480 },
  { month: "Aug", responses: 695, target: 490 },
  { month: "Sep", responses: 810, target: 500 },
  { month: "Oct", responses: 760, target: 510 },
  { month: "Nov", responses: 890, target: 520 },
  { month: "Dec", responses: 950, target: 530 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-2xl px-4 py-3 text-sm"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-hover)",
      }}
    >
      <p className="font-600 mb-1" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function ResponseTrendChart() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-700 text-base" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Response Trend</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Monthly survey responses vs target</p>
        </div>
        <span
          className="text-xs font-600 rounded-xl px-6 py-3"
          style={{ fontWeight: 600, background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          +18.4% YoY
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={DATA} margin={{ top: 4, right: 4, bottom: 8, left: 0 }}>
          <defs>
            <linearGradient id="gResp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0B4A8B" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0B4A8B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, fontFamily: "Inter", paddingTop: 16, color: "var(--text-secondary)" }}
            iconType="circle" iconSize={8}
          />
          <Area
            type="monotone" dataKey="responses" name="Responses"
            stroke="#0B4A8B" strokeWidth={2.5}
            fill="url(#gResp)" dot={false} isAnimationActive activeDot={{ r: 5, fill: "#0B4A8B" }}
          />
          <Area
            type="monotone" dataKey="target" name="Target"
            stroke="#22c55e" strokeWidth={2} strokeDasharray="5 4"
            fill="url(#gTarget)" dot={false} isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
