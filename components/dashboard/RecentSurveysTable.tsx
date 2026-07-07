"use client";

import { useEffect, useState } from "react";
import { ExternalLink, MoreHorizontal } from "lucide-react";

interface SurveyRow {
  id: string;
  name: string;
  touchpoint: string;
  responses: number;
  nps: number;
  status: string;
  date: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Active:    { bg: "rgba(34,197,94,0.1)",   color: "#17A673" },
  Closed:    { bg: "rgba(148,163,184,0.15)", color: "#64748b" },
  Draft:     { bg: "rgba(245,158,11,0.1)",  color: "#d97706" },
  Published: { bg: "rgba(34,197,94,0.1)",   color: "#17A673" },
  Archived:  { bg: "rgba(148,163,184,0.15)", color: "#64748b" },
  Scheduled: { bg: "rgba(245,158,11,0.1)",  color: "#d97706" },
  Expired:   { bg: "rgba(229,72,77,0.1)",   color: "#E5484D" },
};

function NPSBadge({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#0B4A8B" : "#f59e0b";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-xl px-2.5 py-0.5 text-sm font-600"
      style={{ fontWeight: 600, background: `${color}15`, color }}
    >
      {score}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export default function RecentSurveysTable() {
  const [surveys, setSurveys] = useState<SurveyRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/surveys?pageSize=5', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const mapped: SurveyRow[] = json.data.map((s: any) => ({
          id: s.id,
          name: s.title,
          touchpoint: s.touchpoint ?? '—',
          responses: s.responseCount ?? 0,
          nps: s.npsScore ?? 0,
          status: (s.lifecycleStatus ?? s.status ?? 'draft').charAt(0).toUpperCase() + (s.lifecycleStatus ?? s.status ?? 'draft').slice(1),
          date: formatDate(s.createdAt),
        }))
        setSurveys(mapped)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-700 text-base" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Recent Surveys</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {loading ? 'Loading…' : `${surveys.length} surveys (live)`}
          </p>
        </div>
        <button
          className="text-xs font-600 flex items-center gap-2.5 rounded-xl px-6 py-3 transition-all duration-200 hover:scale-105 items-center justify-center text-center"
          style={{
            fontWeight: 600, background: "var(--accent-soft)",
            color: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          View All <ExternalLink size={11} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
          <thead>
            <tr>
              {["Survey", "Touchpoint", "Responses", "NPS", "Status", "Date", ""].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-600 pb-2 px-3"
                  style={{ fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs" style={{ color: "var(--text-muted)" }}>
                  Loading surveys…
                </td>
              </tr>
            ) : surveys.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs" style={{ color: "var(--text-muted)" }}>
                  No surveys found.
                </td>
              </tr>
            ) : (
              surveys.map((s) => (
                <tr
                  key={s.id}
                  className="group cursor-pointer"
                  style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <td className="px-3 py-3 rounded-l-2xl">
                    <div>
                      <p className="text-sm font-500" style={{ fontWeight: 500, color: "var(--text-primary)" }}>{s.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.id}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.touchpoint}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm font-600" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      {s.responses.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-3"><NPSBadge score={s.nps} /></td>
                  <td className="px-3 py-3">
                    <span
                      className="text-xs font-600 rounded-xl px-2.5 py-1"
                      style={{ fontWeight: 600, ...(STATUS_STYLE[s.status] ?? STATUS_STYLE.Draft) }}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.date}</span>
                  </td>
                  <td className="px-3 py-3 rounded-r-2xl">
                    <button
                      className="opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-all duration-200 "
                      style={{ width: 28, height: 28, background: "var(--border)", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
