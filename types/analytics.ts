// ───────────────────────────────────────────────────────────────────────────
// types/analytics.ts
// Type definitions for the Enterprise Analytics & Insight Center (Module 4).
// Shared by ALL analytics components — do not duplicate interfaces elsewhere.
// ───────────────────────────────────────────────────────────────────────────

export interface KpiData {
  id: string;
  title: string;
  value: string;
  change: number;            // signed percent
  trend: 'up' | 'down';
  sparkline: number[];       // 0–100 normalized for sparkline rendering
  accent?: string;           // optional override for value color
  suffix?: string;           // optional suffix rendered muted
  sub?: string;              // optional caption under value
}

export interface InsightData {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  trend: 'up' | 'down';
  metric?: string;           // related metric label
  metricValue?: string;      // related metric value
}

export interface TrendDataPoint {
  date: string;
  responses: number;
  completions: number;
}

export interface BarDataPoint {
  label: string;
  value: number;
}

export interface PieDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface HeatmapPoint {
  day: string;
  hour: string;
  value: number; // 0-4 intensity
}

export interface RadarDataPoint {
  metric: string;
  value: number; // 0-100
}

export interface ScatterDataPoint {
  x: number; // e.g., time in minutes
  y: number; // e.g., completion rate %
  label: string;
}

export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'heatmap';
export type MetricType = 'responses' | 'completions' | 'time' | 'rate';
export type GroupByType = 'date' | 'survey' | 'category' | 'status';
export type FilterType = 'all' | 'Abu Dhabi' | 'Dubai' | 'Al Ain City' | 'Remote/Digital';

export interface VisualizationConfig {
  chartType: ChartType;
  metric: MetricType;
  groupBy: GroupByType;
  filter: FilterType;
}

export interface WidgetConfig {
  id: string;
  title: string;
  description?: string;
  chartType: ChartType;
  w: number; // 1-4 grid columns
  h: number; // 1-2 grid rows
  metric?: MetricType;
  groupBy?: GroupByType;
}

// ───────────────────────────────────────────────────────────────────────────
// Module 4 additions (filters, saved dashboards, command palette)
// ───────────────────────────────────────────────────────────────────────────

export type TabKey = 'overview' | 'custom' | 'builder';

export type BranchKey    = 'all' | 'Abu Dhabi' | 'Dubai' | 'Al Ain City' | 'Remote/Digital';
export type PeriodKey    = '7d' | '30d' | '90d' | 'qtr' | 'ytd' | 'all';
export type ProductKey   = 'all' | 'Motor Takaful' | 'Health Takaful' | 'Family Takaful' | 'Property Takaful' | 'Travel Takaful';
export type DepartmentKey= 'all' | 'Claims Handling' | 'Customer Support' | 'Sales' | 'Underwriting';
export type TouchpointKey= 'all' | 'Policy Purchase' | 'Policy Renewal' | 'Claims Submission' | 'Claims Settlement' | 'Call Center' | 'Mobile App' | 'Website';
export type NpsCategoryKey = 'all' | 'promoter' | 'passive' | 'detractor';

export interface AnalyticsFilters {
  branch:      BranchKey;
  period:      PeriodKey;
  product:     ProductKey;
  department:  DepartmentKey;
  touchpoint:  TouchpointKey;
  npsCategory: NpsCategoryKey;
}

export const DEFAULT_FILTERS: AnalyticsFilters = {
  branch:      'all',
  period:      '30d',
  product:     'all',
  department:  'all',
  touchpoint:  'all',
  npsCategory: 'all',
};

export type ModalKey = 'ask' | 'vizBuilder' | 'export' | 'command' | 'addWidget';

export interface SavedDashboard {
  id: string;
  name: string;
  description?: string;
  icon: string;              // lucide icon name (resolved at render time)
  widgetIds: string[];       // references widget ids in the active layout
  lastModified: string;      // ISO date
}

export interface CommandItem {
  id: string;
  group: 'Navigate' | 'Actions' | 'Dashboards' | 'Recent Queries';
  label: string;
  icon: string;              // lucide icon name
  shortcut?: string;         // e.g. "⌘K A" or "G O"
  action?: () => void;       // wired at runtime by CommandPalette
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}
