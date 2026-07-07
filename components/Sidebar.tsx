"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, MessageSquare, BarChart3, Mail,
  GitBranch, Building2, Users, ClipboardList, Settings, LogOut,
  ChevronLeft,
} from "lucide-react";
import { AdntcLogo } from "@/components/common/AdntcLogo";

const NAV_ITEMS = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/surveys",   icon: FileText,        label: "Surveys" },
  { href: "/dashboard/responses", icon: MessageSquare,   label: "Responses" },
  { href: "/dashboard/analytics", icon: BarChart3,       label: "Analytics" },
  { href: "/dashboard/followups", icon: Mail,            label: "Follow-ups" },
  { href: "/dashboard/branches",  icon: GitBranch,       label: "Branches" },
  { href: "/dashboard/departments",icon: Building2,      label: "Departments" },
  { href: "/dashboard/users",     icon: Users,           label: "Users" },
  { href: "/dashboard/reports",   icon: ClipboardList,   label: "Reports" },
  { href: "/dashboard/settings",  icon: Settings,        label: "Settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300"
      style={{
        width: collapsed ? 72 : 260,
        background: "var(--card)",
        borderRight: "1px solid var(--border)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.04)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 mb-2">
        <div
          className="flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            width: collapsed ? 40 : 'auto',
            height: 40,
          }}
        >
          <AdntcLogo
            variant={collapsed ? 'mark' : 'sidebar'}
            className={collapsed ? '!h-[26px] brightness-0 invert opacity-90' : '!h-[32px] brightness-0 invert opacity-90'}
          />
        </div>
        {!collapsed && (
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Enterprise</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
          style={{
            width: 28, height: 28,
            background: "var(--accent-soft)",
            color: "var(--accent)",
            border: "none", cursor: "pointer",
          }}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            size={14}
            style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                className="flex items-center gap-3 rounded-2xl transition-all duration-200 cursor-pointer select-none"
                style={{
                  padding: collapsed ? "10px 0" : "10px 14px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
                  color: active ? "#fff" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  boxShadow: active ? "0 4px 14px rgba(99,102,241,0.35)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "var(--accent-soft)";
                    (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }
                }}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 pt-2">
        <div
          className="flex items-center gap-3 rounded-2xl cursor-pointer transition-all duration-200"
          style={{
            padding: collapsed ? "10px 0" : "10px 14px",
            justifyContent: collapsed ? "center" : "flex-start",
            color: "#ef4444",
            fontSize: 14,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} strokeWidth={1.8} />
          {!collapsed && <span>Logout</span>}
        </div>
      </div>
    </aside>
  );
}
