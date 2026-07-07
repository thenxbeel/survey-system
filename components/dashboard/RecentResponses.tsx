"use client";

const RESPONSES = [
  { respondent: "Ahmed Al Rashidi", survey: "Q2 Customer Experience", nps: 9,  branch: "Dubai",     date: "Today 11:24" },
  { respondent: "Sarah Johnson",    survey: "Post-Purchase Feedback",  nps: 7,  branch: "Abu Dhabi", date: "Today 10:58" },
  { respondent: "Omar Bin Khalid",  survey: "Onboarding Experience",  nps: 3,  branch: "Sharjah",   date: "Today 09:42" },
  { respondent: "Layla Mohammed",   survey: "Support Quality Survey",  nps: 10, branch: "Dubai",     date: "Today 09:15" },
  { respondent: "Fahad Al Mansoori",survey: "Annual Brand Loyalty",   nps: 8,  branch: "Al Ain",    date: "Yesterday"   },
];

function NPSScore({ score }: { score: number }) {
  const color = score >= 9 ? "#22c55e" : score >= 7 ? "#0B4A8B" : "#ef4444";
  return (
    <div
      className="flex items-center justify-center rounded-2xl text-white font-700 text-sm"
      style={{ width: 36, height: 36, background: color, fontWeight: 700, flexShrink: 0 }}
    >
      {score}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  const colors = ["#0B4A8B", "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="rounded-2xl flex items-center justify-center text-white text-xs font-700 shrink-0"
      style={{ width: 36, height: 36, background: color, fontWeight: 700 }}
    >
      {initials}
    </div>
  );
}

export default function RecentResponses() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-700 text-base" style={{ fontWeight: 700, color: "var(--text-primary)" }}>Recent Responses</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Latest survey feedback</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {RESPONSES.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 cursor-pointer transition-all duration-200"
            style={{ border: "1px solid var(--border)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <Avatar name={r.respondent} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-500 truncate" style={{ fontWeight: 500, color: "var(--text-primary)" }}>{r.respondent}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{r.survey}</p>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <p className="text-xs whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{r.branch}</p>
              <p className="text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{r.date}</p>
            </div>
            <NPSScore score={r.nps} />
          </div>
        ))}
      </div>
    </div>
  );
}
