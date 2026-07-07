// lib/analytics-query.ts
//
// Shared helper that converts the AnalyticsFilters state object into URL query
// parameters for /api/analytics/* endpoints. Used by every analytics component
// so they all send consistent filter parameters.

import type { AnalyticsFilters } from '@/types/analytics'

export function buildAnalyticsParams(filters: AnalyticsFilters): URLSearchParams {
  const params = new URLSearchParams()
  // Period: the API overview endpoint uses 7d/30d/90d/1y; trends uses monthly
  params.set('period', filters.period)
  if (filters.branch && filters.branch !== 'all') params.set('branch', filters.branch)
  if (filters.department && filters.department !== 'all') params.set('department', filters.department)
  if (filters.touchpoint && filters.touchpoint !== 'all') params.set('touchpoint', filters.touchpoint)
  if (filters.npsCategory && filters.npsCategory !== 'all') params.set('npsCategory', filters.npsCategory)
  return params
}

/**
 * Build a query string for the overview API.
 * Usage: fetch(`/api/analytics/overview?${buildOverviewQuery(filters)}`)
 */
export function buildOverviewQuery(filters: AnalyticsFilters): string {
  return buildAnalyticsParams(filters).toString()
}

/**
 * Build a query string for the trends API.
 * Trends always uses 'monthly' grouping but still respects other filters.
 */
export function buildTrendsQuery(filters: AnalyticsFilters): string {
  const params = buildAnalyticsParams(filters)
  // Trends API ignores the period param for date range (always last 12 months)
  // but we still pass it for consistency — the API can choose to use it.
  return params.toString()
}

/**
 * Safely coerce any value to a finite number, defaulting to 0.
 * Prevents NaN / Infinity / undefined from reaching chart datasets.
 */
export function safeNumber(value: unknown, defaultValue = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : defaultValue
}

/**
 * Safely compute a percentage, returning 0 when total is 0.
 */
export function safePercentage(part: number, total: number): number {
  if (!total || !Number.isFinite(total)) return 0
  return Math.round((part / total) * 100)
}

/**
 * Safely compute an average, returning 0 when the array is empty.
 */
export function safeAverage(values: number[]): number {
  if (!values || values.length === 0) return 0
  const sum = values.reduce((a, b) => a + safeNumber(b), 0)
  return Math.round(sum / values.length)
}
