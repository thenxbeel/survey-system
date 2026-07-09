// ───────────────────────────────────────────────────────────────────────────
// lib/mock-data/analytics.ts
// Mock data for the Enterprise Analytics & Insight Center (Module 4).
// No APIs. No Prisma. No fetch. Pure static data + tiny client-side helpers.
// ───────────────────────────────────────────────────────────────────────────

import {
  KpiData, InsightData, TrendDataPoint, BarDataPoint, PieDataPoint,
  HeatmapPoint, RadarDataPoint, ScatterDataPoint,
  SavedDashboard, CommandItem, FilterOption, WidgetConfig,
} from '@/types/analytics';

// ─── KPIs ──────────────────────────────────────────────────────────────────

export const mockKpis: KpiData[] = [
  {
    id: 'total-submissions',
    title: 'Total Submissions',
    value: '24,891',
    change: 12.5,
    trend: 'up',
    sparkline: [20, 35, 25, 45, 35, 55, 65, 60, 75, 80],
    accent: '#0B4A8B',
    sub: 'Across all surveys',
  },
  {
    id: 'csat-score',
    title: 'CSAT Score',
    value: '87.4',
    suffix: '%',
    change: 4.2,
    trend: 'up',
    sparkline: [60, 62, 65, 63, 68, 70, 75, 78, 82, 87],
    accent: '#17A673',
    sub: 'Industry avg 78%',
  },
  {
    id: 'handling-time',
    title: 'Avg. Handling Time',
    value: '4m 12s',
    change: -8.1,
    trend: 'down',
    sparkline: [80, 75, 78, 70, 65, 60, 55, 50, 45, 42],
    accent: '#0B4A8B',
    sub: 'Lower is better',
  },
  {
    id: 'active-touchpoints',
    title: 'Active Touchpoints',
    value: '42',
    change: 2.4,
    trend: 'up',
    sparkline: [30, 32, 35, 34, 38, 40, 39, 41, 40, 42],
    accent: '#0B4A8B',
    sub: '6 branches • 7 products',
  },
];

// ─── Insights ──────────────────────────────────────────────────────────────

export const mockInsights: InsightData[] = [
  {
    id: 'insight-1',
    title: 'Claims Submission Drop Detected',
    description: 'The "Claims Submission" touchpoint saw a 15% drop in CSAT over the last 7 days, primarily on the Mobile App. Affected branches: Dubai (-21%), Al Ain City (-12%).',
    impact: 'high',
    trend: 'down',
    metric: 'CSAT (Mobile App)',
    metricValue: '62% (was 77%)',
  },
  {
    id: 'insight-2',
    title: 'Peak Engagement Hours',
    description: 'Highest submission volume for Motor Takaful occurs between 2 PM and 4 PM on Tuesdays in the Dubai branch. Consider scheduling survey sends in this window for maximum response rate.',
    impact: 'medium',
    trend: 'up',
    metric: 'Peak hour response rate',
    metricValue: '38% (vs 24% avg)',
  },
  {
    id: 'insight-3',
    title: 'Policy Renewal Correlation',
    description: 'Surveys triggered after Policy Renewal have a 22% higher NPS score compared to Claims Handling surveys. Renewal NPS averages +58, Claims averages +36.',
    impact: 'high',
    trend: 'up',
    metric: 'Renewal vs Claims NPS',
    metricValue: '+22% delta',
  },
  {
    id: 'insight-4',
    title: 'Detractor Cluster — Abu Dhabi Branch',
    description: '14 detractors in the past 30 days cluster around the Health Takaful product line. Common verbatim theme: "slow claim approval". Consider process review.',
    impact: 'high',
    trend: 'down',
    metric: 'Detractors (Health Takaful, AUH)',
    metricValue: '14 responses',
  },
  {
    id: 'insight-5',
    title: 'Underwriting Touchpoint Improvement',
    description: 'Underwriting CSAT rose 9.3% month-over-month — the strongest mover across all departments. Likely driven by the new digital intake form launched May 12.',
    impact: 'medium',
    trend: 'up',
    metric: 'Underwriting CSAT',
    metricValue: '+9.3% MoM',
  },
  {
    id: 'insight-6',
    title: 'Weekend Volume Anomaly',
    description: 'Saturday submission volume dropped 41% versus the prior 4-week average. Investigate whether scheduled sends were paused.',
    impact: 'low',
    trend: 'down',
    metric: 'Saturday volume',
    metricValue: '-41% vs 4wk avg',
  },
];

// ─── Ask Analytics ─────────────────────────────────────────────────────────

export const suggestedPrompts = [
  'Show NPS by branch',
  'Compare Claims Handling vs Policy Renewal',
  'Show response trend',
  'Lowest scoring touchpoint',
  'Department performance',
  'Product performance',
];

// ─── Charts ────────────────────────────────────────────────────────────────

export const mockTrendData: TrendDataPoint[] = [
  { date: 'Jan', responses: 1200, completions: 1000 },
  { date: 'Feb', responses: 1400, completions: 1250 },
  { date: 'Mar', responses: 1100, completions: 950  },
  { date: 'Apr', responses: 1800, completions: 1600 },
  { date: 'May', responses: 2100, completions: 1900 },
  { date: 'Jun', responses: 1950, completions: 1750 },
  { date: 'Jul', responses: 2400, completions: 2200 },
  { date: 'Aug', responses: 2800, completions: 2600 },
];

export const mockBarData: BarDataPoint[] = [
  { label: 'Motor Takaful',   value: 4200 },
  { label: 'Health Takaful',  value: 3800 },
  { label: 'Family Takaful',  value: 3100 },
  { label: 'Property Takaful',value: 2500 },
  { label: 'Travel Takaful',  value: 1800 },
];

export const mockPieData: PieDataPoint[] = [
  { label: 'Abu Dhabi',       value: 45, color: '#0B4A8B' },
  { label: 'Dubai',           value: 30, color: '#17A673' },
  { label: 'Al Ain City',     value: 15, color: '#F5A623' },
  { label: 'Remote/Digital',  value: 10, color: '#64748B' },
];

// Deterministic 7×24 heatmap (no Math.random — stable across renders)
export const mockHeatmapData: HeatmapPoint[] = (() => {
  const out: HeatmapPoint[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      // Higher intensity during business hours (9–17) on weekdays (0–4)
      const businessHour = h >= 9 && h <= 17 ? 1 : 0;
      const weekday      = d < 5 ? 1 : 0;
      const peak         = (h === 14 || h === 15) && d === 1 ? 2 : 0; // Tue 2-4 PM spike
      const base         = (h * 7 + d * 3) % 3;                       // pseudo-noise
      const v = Math.min(4, base + businessHour + weekday + peak);
      out.push({ day: d.toString(), hour: h.toString(), value: v });
    }
  }
  return out;
})();

export const mockRadarData: RadarDataPoint[] = [
  { metric: 'Claims Handling',  value: 85 },
  { metric: 'Policy Renewal',   value: 70 },
  { metric: 'Customer Support', value: 92 },
  { metric: 'Sales',            value: 65 },
  { metric: 'Underwriting',     value: 78 },
];

export const mockScatterData: ScatterDataPoint[] = [
  { x: 2,  y: 95, label: 'Policy Purchase'    },
  { x: 5,  y: 88, label: 'Policy Renewal'     },
  { x: 8,  y: 75, label: 'Claims Submission'  },
  { x: 12, y: 60, label: 'Claims Settlement'  },
  { x: 15, y: 45, label: 'Website'            },
  { x: 18, y: 30, label: 'Mobile App'         },
  { x: 3,  y: 92, label: 'Call Center'        },
];

// ─── Filter Options (Phase 1) ──────────────────────────────────────────────

export const filterOptions: {
  branches:      FilterOption[];
  periods:       FilterOption[];
  products:      FilterOption[];
  departments:   FilterOption[];
  touchpoints:   FilterOption[];
  npsCategories: FilterOption[];
} = {
  branches: [
    { value: 'all',            label: 'All Branches'     },
    { value: 'Abu Dhabi',      label: 'Abu Dhabi'        },
    { value: 'Dubai',          label: 'Dubai'            },
    { value: 'Al Ain City',    label: 'Al Ain City'      },
    { value: 'Remote/Digital', label: 'Remote / Digital' },
  ],
  periods: [
    { value: '7d',  label: 'Last 7 days'   },
    { value: '30d', label: 'Last 30 days'  },
    { value: '90d', label: 'Last 90 days'  },
    { value: 'qtr', label: 'This Quarter'  },
    { value: 'ytd', label: 'Year to Date'  },
    { value: 'all', label: 'All Time'      },
  ],
  products: [
    { value: 'all',              label: 'All Products'    },
    { value: 'Motor Takaful',    label: 'Motor Takaful'   },
    { value: 'Health Takaful',   label: 'Health Takaful'  },
    { value: 'Family Takaful',   label: 'Family Takaful'  },
    { value: 'Property Takaful', label: 'Property Takaful'},
    { value: 'Travel Takaful',   label: 'Travel Takaful'  },
  ],
  departments: [
    { value: 'all',              label: 'All Departments'   },
    { value: 'Claims Handling',  label: 'Claims Handling'   },
    { value: 'Customer Support', label: 'Customer Support'  },
    { value: 'Sales',            label: 'Sales'             },
    { value: 'Underwriting',     label: 'Underwriting'      },
  ],
  touchpoints: [
    { value: 'all',                label: 'All Touchpoints'    },
    { value: 'Policy Purchase',    label: 'Policy Purchase'    },
    { value: 'Policy Renewal',     label: 'Policy Renewal'     },
    { value: 'Claims Submission',  label: 'Claims Submission'  },
    { value: 'Claims Settlement',  label: 'Claims Settlement'  },
    { value: 'Call Center',        label: 'Call Center'        },
    { value: 'Mobile App',         label: 'Mobile App'         },
    { value: 'Website',            label: 'Website'            },
  ],
  npsCategories: [
    { value: 'all',      label: 'All Categories' },
    { value: 'promoter', label: 'Promoters'      },
    { value: 'passive',  label: 'Passives'       },
    { value: 'detractor',label: 'Detractors'     },
  ],
};

// ─── Saved Dashboards (Phase 5) ────────────────────────────────────────────

export const mockSavedDashboards: SavedDashboard[] = [
  {
    id: 'd1',
    name: 'Executive Brief',
    description: 'Headline KPIs + trend for board review',
    icon: 'LayoutDashboard',
    widgetIds: ['w1', 'w2', 'w3'],
    lastModified: '2026-06-20',
  },
  {
    id: 'd2',
    name: 'Claims Deep-Dive',
    description: 'Claims touchpoint analytics & detractor analysis',
    icon: 'ShieldAlert',
    widgetIds: ['w4', 'w5'],
    lastModified: '2026-06-18',
  },
  {
    id: 'd3',
    name: 'Branch Comparison',
    description: 'NPS by branch with weekly trend',
    icon: 'GitCompare',
    widgetIds: ['w6', 'w1'],
    lastModified: '2026-06-15',
  },
];

export const mockWidgetLibrary: WidgetConfig[] = [
  { id: 'w1',  title: 'Submission Trend',         chartType: 'line',     w: 2, h: 1, metric: 'responses', groupBy: 'date'     },
  { id: 'w2',  title: 'Branch Distribution',      chartType: 'pie',      w: 1, h: 1, metric: 'responses', groupBy: 'survey'   },
  { id: 'w3',  title: 'Volume by Product',        chartType: 'bar',      w: 1, h: 1, metric: 'responses', groupBy: 'category' },
  { id: 'w4',  title: 'Activity Heatmap',         chartType: 'heatmap',  w: 2, h: 1, metric: 'responses', groupBy: 'date'     },
  { id: 'w5',  title: 'Touchpoint Time vs Rate',  chartType: 'scatter',  w: 1, h: 1, metric: 'rate',      groupBy: 'status'   },
  { id: 'w6',  title: 'Department Performance',   chartType: 'radar',    w: 1, h: 1, metric: 'rate',      groupBy: 'category' },
  // ─── Additional widgets per spec ──
  { id: 'w7',  title: 'Response Timeline',        chartType: 'line',     w: 2, h: 1, metric: 'responses', groupBy: 'date',     description: 'Monthly submission & completion trend' },
  { id: 'w8',  title: 'Customer Satisfaction',    chartType: 'line',     w: 1, h: 1, metric: 'rate',      groupBy: 'date',     description: 'CSAT score trend over time' },
  { id: 'w9',  title: 'Survey Distribution',      chartType: 'pie',      w: 1, h: 1, metric: 'responses', groupBy: 'category', description: 'Response share by survey type' },
  { id: 'w10', title: 'Branch Performance',       chartType: 'bar',      w: 2, h: 1, metric: 'rate',      groupBy: 'survey',   description: 'NPS score by branch' },
  { id: 'w11', title: 'Touchpoint Analysis',      chartType: 'scatter',  w: 2, h: 1, metric: 'time',      groupBy: 'status',   description: 'Time vs satisfaction by touchpoint' },
  { id: 'w12', title: 'Recent Activity',          chartType: 'heatmap',  w: 2, h: 1, metric: 'responses', groupBy: 'date',     description: 'Recent response volume density' },
];

// ─── Command Palette (Phase 6) ─────────────────────────────────────────────

export const commandPaletteItems: Omit<CommandItem, 'action'>[] = [
  // Navigate
  { id: 'nav-overview',  group: 'Navigate',   label: 'Go to Overview',            icon: 'LayoutDashboard', shortcut: 'G O' },
  { id: 'nav-custom',    group: 'Navigate',   label: 'Go to Custom Dashboards',   icon: 'LayoutGrid',      shortcut: 'G C' },
  { id: 'nav-builder',   group: 'Navigate',   label: 'Open Visualization Builder',icon: 'Wand2',           shortcut: 'G B' },
  // Actions
  { id: 'act-ask',       group: 'Actions',    label: 'Ask Analytics',             icon: 'Sparkles',        shortcut: '⌘K A' },
  { id: 'act-export',    group: 'Actions',    label: 'Export Report',             icon: 'Download',        shortcut: '⌘E'   },
  { id: 'act-new-viz',   group: 'Actions',    label: 'New Visualization',         icon: 'Plus',            shortcut: 'N'    },
  { id: 'act-add-widget',group: 'Actions',    label: 'Add Widget to Dashboard',   icon: 'LayoutPanelTop',  shortcut: 'A'    },
  { id: 'act-edit-mode', group: 'Actions',    label: 'Toggle Edit Mode',          icon: 'Pencil',          shortcut: '⌘.'   },
  // Dashboards
  { id: 'dash-exec',     group: 'Dashboards', label: 'Load "Executive Brief"',    icon: 'LayoutDashboard' },
  { id: 'dash-claims',   group: 'Dashboards', label: 'Load "Claims Deep-Dive"',   icon: 'ShieldAlert'     },
  { id: 'dash-branch',   group: 'Dashboards', label: 'Load "Branch Comparison"',  icon: 'GitCompare'      },
  // Recent queries (mock — for the "Ask Analytics" recent history)
  { id: 'rec-1',         group: 'Recent Queries', label: 'Show NPS by branch',    icon: 'Clock' },
  { id: 'rec-2',         group: 'Recent Queries', label: 'Compare Claims vs Renewal', icon: 'Clock' },
  { id: 'rec-3',         group: 'Recent Queries', label: 'Lowest scoring touchpoint', icon: 'Clock' },
];
