"use client";

/**
 * KpiCard — official KPI card (Phase 3 §5.9).
 *
 * This is the canonical KPI card for the entire application. It is a re-export
 * of common/StatCard.tsx (the documented, hardened version with sparkline
 * 2px inset, unique gradient ID, and 20px value size).
 *
 * Per Blueprint §1.3 (Stat-Card Fragmentation) and §13.2 (Stat-Card Row Rule):
 * every module page imports this component — no per-module inline KPI cards.
 *
 * Usage:
 *   import { KpiCard } from '@/components/common/KpiCard'
 *   <KpiCard
 *     label="Total Customers"
 *     value={stats.total}
 *     sub={`${stats.active} active`}
 *     accent="var(--primary)"
 *     tint={{ bg: "var(--tint-blue-soft)", fg: "var(--primary)" }}
 *     icon={Users}
 *     trend={{ dir: "up", value: "8%", positive: true }}
 *     sparkData={[28, 30, 32, 34, 35, 37, 38, 40]}
 *     delay={0.05}
 *   />
 */
export { StatCard as KpiCard } from "./StatCard";
export type { StatCardProps as KpiCardProps } from "./StatCard";

// Also re-export StatCard for backward compatibility with existing imports
export { StatCard } from "./StatCard";
export type { StatCardProps } from "./StatCard";
