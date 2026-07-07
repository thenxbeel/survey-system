"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const DATA = [
  { name: "Promoters",  value: 72, color: "#22c55e" },
  { name: "Passives",   value: 16, color: "#0B4A8B" },
  { name: "Detractors", value: 12, color: "#ef4444" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-2xl px-4 py-3 text-sm"
      style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-hover)" }}
    >
      <p style={{ color: payload[0].payload.color, fontWeight: 600 }}>
        {payload[0].name}: {payload[0].value}%
      </p>
    </div>
  );
};

export default function SatisfactionPieChart() {
  return (
    <div className="card p-6">
      <div className="mb-4">
        <p className="font-700 text-base" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Score Distribution</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Promoter / Passive / Detractor split</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={DATA} cx="50%" cy="50%"
            innerRadius={55} outerRadius={80}
            paddingAngle={4} dataKey="value"
            isAnimationActive strokeWidth={0}
          >
            {DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2 mt-2">
        {DATA.map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full" style={{ width: 8, height: 8, background: d.color }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{d.name}</span>
            </div>
            <span className="text-sm font-600" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
