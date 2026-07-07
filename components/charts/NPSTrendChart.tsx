"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";

const DATA = [
  { month: "Jan", nps: 48 },
  { month: "Feb", nps: 52 },
  { month: "Mar", nps: 55 },
  { month: "Apr", nps: 51 },
  { month: "May", nps: 60 },
  { month: "Jun", nps: 63 },
  { month: "Jul", nps: 68 },
  { month: "Aug", nps: 65 },
  { month: "Sep", nps: 70 },
  { month: "Oct", nps: 69 },
  { month: "Nov", nps: 74 },
  { month: "Dec", nps: 72 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const color = v >= 70 ? "#22c55e" : v >= 50 ? "#0B4A8B" : "#f59e0b";
  return (
    <div
      className="rounded-2xl px-4 py-3 text-sm"
      style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-hover)" }}
    >
      <p className="font-600" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{label}</p>
      <p style={{ color }}>NPS: <strong>{v}</strong></p>
    </div>
  );
};

export default function NPSTrendChart() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-700 text-base" style={{ fontWeight: 700, color: "var(--text-primary)" }}>NPS Trend</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>12-month NPS performance</p>
        </div>
        <div className="flex items-center gap-3">
          {[{ label: "Good", color: "#0B4A8B" }, { label: "Excellent", color: "#22c55e" }].map((l) => (
            <div key={l.label} className="flex items-center gap-2.5">
              <div className="rounded-full" style={{ width: 8, height: 8, background: l.color }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={DATA} margin={{ top: 4, right: 4, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
          <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Line
            type="monotone" dataKey="nps"
            stroke="#0B4A8B" strokeWidth={3}
            dot={{ fill: "#0B4A8B", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: "#0B4A8B" }}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
