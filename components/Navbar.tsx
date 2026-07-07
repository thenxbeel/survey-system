"use client";

import { useState } from "react";
import { Search, Bell, Sun, Moon, ChevronDown, MapPin } from "lucide-react";

interface NavbarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

const NOTIFICATIONS = [
  { id: 1, text: "New response on Q2 Customer Survey", time: "2m ago", unread: true },
  { id: 2, text: "Follow-up #142 assigned to you", time: "15m ago", unread: true },
  { id: 3, text: "Monthly report ready to export", time: "1h ago", unread: false },
  { id: 4, text: "NPS dipped below 60 in Dubai branch", time: "3h ago", unread: false },
];

const BRANCHES = ["All Branches", "Dubai Main", "Abu Dhabi", "Sharjah", "Al Ain"];

export default function Navbar({ darkMode, onToggleDark }: NavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [branch, setBranch] = useState("All Branches");

  const unread = NOTIFICATIONS.filter((n) => n.unread).length;
  const now = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-6 lg:px-8"
      style={{
        height: 72,
        background: "rgba(var(--card), 0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      {/* Date */}
      <span className="hidden lg:block text-sm font-500" style={{ color: "var(--text-muted)", fontWeight: 500 }}>
        {now}
      </span>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto lg:mx-0">
        <div
          className="flex items-center gap-3 rounded-2xl px-4"
          style={{
            height: 42,
            background: "var(--bg)",
            border: "1px solid var(--border)",
          }}
        >
          <Search size={15} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search surveys, responses..."
            className="bg-transparent border-none outline-none text-sm flex-1"
            style={{ color: "var(--text-primary)", fontFamily: "inherit" }}
          />
          <kbd
            className="text-xs rounded-lg px-2 py-0.5 hidden sm:block"
            style={{
              background: "var(--border)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Branch selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setBranchOpen((o) => !o)}
            className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition-all duration-200"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <MapPin size={13} />
            <span>{branch}</span>
            <ChevronDown size={13} />
          </button>
          {branchOpen && (
            <div
              className="absolute top-full mt-2 right-0 rounded-2xl py-2 min-w-[160px] z-50"
              style={{
                background: "var(--card)",
                boxShadow: "var(--shadow-hover)",
                border: "1px solid var(--border)",
              }}
            >
              {BRANCHES.map((b) => (
                <div
                  key={b}
                  onClick={() => { setBranch(b); setBranchOpen(false); }}
                  className="px-6 py-3 text-sm cursor-pointer transition-colors"
                  style={{
                    color: b === branch ? "var(--accent)" : "var(--text-secondary)",
                    background: b === branch ? "var(--accent-soft)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (b !== branch) (e.currentTarget as HTMLElement).style.background = "var(--bg)"; }}
                  onMouseLeave={(e) => { if (b !== branch) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dark mode */}
        <button
          onClick={onToggleDark}
          className="flex items-center justify-center rounded-2xl transition-all duration-200 hover:scale-105"
          style={{
            width: 40, height: 40,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="flex items-center justify-center rounded-2xl transition-all duration-200 hover:scale-105"
            style={{
              width: 40, height: 40,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              position: "relative",
            }}
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white text-xs font-bold"
                style={{ width: 18, height: 18, background: "#ef4444", fontSize: 10 }}
              >
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute top-full mt-2 right-0 rounded-2xl py-3 z-50"
              style={{
                width: 320,
                background: "var(--card)",
                boxShadow: "var(--shadow-hover)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between px-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="font-600 text-sm" style={{ fontWeight: 600 }}>Notifications</span>
                <span
                  className="text-xs font-500 cursor-pointer"
                  style={{ color: "var(--accent)", fontWeight: 500 }}
                >
                  Mark all read
                </span>
              </div>
              <div className="flex flex-col">
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 flex gap-3 cursor-pointer transition-colors"
                    style={{ background: n.unread ? "var(--accent-soft)" : "transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = n.unread ? "var(--accent-soft)" : "transparent"; }}
                  >
                    <div
                      className="rounded-full shrink-0 mt-1"
                      style={{ width: 7, height: 7, background: n.unread ? "var(--accent)" : "transparent" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>{n.text}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-2 cursor-pointer transition-all duration-200"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="rounded-xl flex items-center justify-center text-white font-700 text-sm shrink-0"
            style={{
              width: 28, height: 28,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-600 leading-tight" style={{ fontWeight: 600, color: "var(--text-primary)" }}>Nabeel</p>
            <p className="text-xs leading-tight" style={{ color: "var(--text-muted)" }}>Admin</p>
          </div>
          <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
        </div>
      </div>
    </header>
  );
}
