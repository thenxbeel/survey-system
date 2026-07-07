"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from "recharts";

const DATA = [
  { branch: "Dubai", responses: 842, nps: 74 },
  { branch: "Abu Dhabi", responses: 620, nps: 68 },
  { branch: "Sharjah", responses: 410, nps: 61 },
  { branch: "Al Ain", responses: 290, nps: 55 },
  { branch: "Ajman", responses: 185, nps: 49 },
  { branch: "RAK", responses: 130, nps: 52 },
];

const COLORS = ["#0B4A8B", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#0B4A8B"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-2xl px-4 py-3 text-sm"
      style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-hover)" }}
    >
      <p className="font-600 mb-1" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{label}</p>
      <p style={{ color: "#0B4A8B" }}>Responses: <strong>{payload[0]?.value}</strong></p>
      <p style={{ color: "#22c55e" }}>NPS: <strong>{payload[0]?.payload?.nps}</strong></p>
    </div>
  );
};

export default function BranchBarChart() {
  return (
    <div className="card p-6">
      <div className="mb-6">
        <p className="font-700 text-base" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Responses by Branch</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total survey responses per location</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={DATA} margin={{ top: 4, right: 4, bottom: 8, left: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="branch" tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent-soft)", radius: 8 }} />
          <Bar dataKey="responses" radius={[8, 8, 0, 0]} isAnimationActive>
            {DATA.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
