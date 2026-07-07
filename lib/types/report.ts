// lib/types/report.ts
//
// Report types, constants & helpers — extracted from the former lib/mockReports.ts.
// All report downloads go through /api/reports/export (Prisma-backed).

// ─── Types ──────────────────────────────────────────────────────────────────

export type ReportType =
  | 'executive_summary' | 'branch_performance' | 'department_performance'
  | 'nps_trend' | 'survey_performance' | 'customer_satisfaction'
  | 'response_rate' | 'detractor_analysis' | 'promoter_analysis'

export type ReportFormat = 'pdf' | 'excel' | 'csv'
export type ScheduleFreq = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'once'
export type ReportStatus = 'ready' | 'generating' | 'scheduled' | 'failed'

export interface ReportTemplate {
  id: string
  type: ReportType
  name: string
  description: string
  icon: string                 // lucide name (resolved at render)
  defaultFormat: ReportFormat
  estimatedTime: string        // generation time
  lastGenerated: string        // ISO
  lastGeneratedBy: string
  runCount: number
  category: 'executive' | 'operational' | 'analytics' | 'customer'
  tags: string[]
}

export interface SavedReport {
  id: string
  name: string
  type: ReportType
  format: ReportFormat
  size: string
  status: ReportStatus
  generatedAt: string
  generatedBy: string
  period: string
  parameters: { label: string; value: string }[]
  description?: string
}

export interface ScheduledReport {
  id: string
  name: string
  type: ReportType
  frequency: ScheduleFreq
  nextRunAt: string
  lastRunAt: string | null
  recipients: string[]
  format: ReportFormat
  status: 'active' | 'paused'
  owner: string
}

export interface QuickReportConfig {
  type: ReportType
  period: string        // '7d' | '30d' | '90d' | 'qtr' | 'ytd' | 'all'
  branch: string
  department: string
  format: ReportFormat
  includeCharts: boolean
  includeRawData: boolean
}

// ─── Constants ──────────────────────────────────────────────────────────────

export const BRANCHES    = ['Abu Dhabi', 'Murror', 'Al Ain', 'Al Ain City', 'Dubai']
export const DEPARTMENTS = ['Claims Handling', 'Customer Support', 'Policy Renewal', 'Sales', 'Underwriting', 'Digital Experience', 'Operations']

export const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'executive_summary',     label: 'Executive Summary'      },
  { value: 'branch_performance',    label: 'Branch Performance'     },
  { value: 'department_performance',label: 'Department Performance' },
  { value: 'nps_trend',             label: 'NPS Trend'              },
  { value: 'survey_performance',    label: 'Survey Performance'     },
  { value: 'customer_satisfaction', label: 'Customer Satisfaction'  },
  { value: 'response_rate',         label: 'Response Rate'          },
  { value: 'detractor_analysis',    label: 'Detractor Analysis'     },
  { value: 'promoter_analysis',     label: 'Promoter Analysis'      },
]

export const REPORT_FORMATS: { value: ReportFormat; label: string; icon: string; color: string }[] = [
  { value: 'pdf',   label: 'PDF',         icon: 'FileText',        color: '#E5484D' },
  { value: 'excel', label: 'Excel',       icon: 'FileSpreadsheet', color: '#17A673' },
  { value: 'csv',   label: 'CSV',         icon: 'FileBarChart',    color: '#0B4A8B' },
]

export const SCHEDULE_FREQS: { value: ScheduleFreq; label: string }[] = [
  { value: 'daily',     label: 'Daily'      },
  { value: 'weekly',    label: 'Weekly'     },
  { value: 'monthly',   label: 'Monthly'    },
  { value: 'quarterly', label: 'Quarterly'  },
  { value: 'once',      label: 'One-time'   },
]

export const PERIODS = [
  { value: '7d',  label: 'Last 7 days'   },
  { value: '30d', label: 'Last 30 days'  },
  { value: '90d', label: 'Last 90 days'  },
  { value: 'qtr', label: 'This Quarter'  },
  { value: 'ytd', label: 'Year to Date'  },
  { value: 'all', label: 'All Time'      },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function iso(daysAgo: number, hour = 10, min = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

function pickIdx<T>(arr: T[], i: number): T { return arr[i % arr.length] }

// ─── Templates ──────────────────────────────────────────────────────────────

export const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 'tpl_1', type: 'executive_summary',      name: 'Executive Summary',       description: 'C-suite snapshot — KPIs, NPS, trends, and key risks', icon: 'LayoutDashboard',  defaultFormat: 'pdf',   estimatedTime: '~30s', lastGenerated: iso(1),  lastGeneratedBy: 'Sara Al Mansoori', runCount: 48, category: 'executive', tags: ['C-suite', 'KPI', 'Board'] },
  { id: 'tpl_2', type: 'branch_performance',     name: 'Branch Performance',      description: 'NPS, response rate, and CSAT by branch',              icon: 'GitCompare',       defaultFormat: 'pdf',   estimatedTime: '~45s', lastGenerated: iso(2),  lastGeneratedBy: 'Ahmed Khalid',     runCount: 32, category: 'operational', tags: ['Branch', 'NPS'] },
  { id: 'tpl_3', type: 'department_performance', name: 'Department Performance',  description: 'Department-level satisfaction and resolution metrics', icon: 'Building2',       defaultFormat: 'excel', estimatedTime: '~40s', lastGenerated: iso(3),  lastGeneratedBy: 'Fatima Hassan',    runCount: 21, category: 'operational', tags: ['Department', 'Resolution'] },
  { id: 'tpl_4', type: 'nps_trend',              name: 'NPS Trend Analysis',      description: '12-month NPS trend with cohort breakdown',            icon: 'TrendingUp',       defaultFormat: 'pdf',   estimatedTime: '~25s', lastGenerated: iso(1),  lastGeneratedBy: 'Omar Al Rashid',   runCount: 67, category: 'analytics', tags: ['NPS', 'Trend'] },
  { id: 'tpl_5', type: 'survey_performance',     name: 'Survey Performance',      description: 'Response rates, completion times, dropout points',    icon: 'ClipboardList',    defaultFormat: 'excel', estimatedTime: '~35s', lastGenerated: iso(4),  lastGeneratedBy: 'Sara Al Mansoori', runCount: 18, category: 'analytics', tags: ['Survey', 'Response Rate'] },
  { id: 'tpl_6', type: 'customer_satisfaction',  name: 'Customer Satisfaction',   description: 'CSAT distribution and verbatim themes',               icon: 'Smile',            defaultFormat: 'pdf',   estimatedTime: '~30s', lastGenerated: iso(2),  lastGeneratedBy: 'Layla Al Zaabi',   runCount: 25, category: 'customer',  tags: ['CSAT', 'Verbatim'] },
  { id: 'tpl_7', type: 'response_rate',          name: 'Response Rate Report',    description: 'Survey invitation → response funnel by channel',      icon: 'Mail',             defaultFormat: 'csv',   estimatedTime: '~20s', lastGenerated: iso(5),  lastGeneratedBy: 'Ahmed Khalid',     runCount: 12, category: 'analytics', tags: ['Funnel', 'Channel'] },
  { id: 'tpl_8', type: 'detractor_analysis',     name: 'Detractor Analysis',      description: 'Detractor root-cause clustering and verbatim themes', icon: 'AlertCircle',      defaultFormat: 'pdf',   estimatedTime: '~50s', lastGenerated: iso(3),  lastGeneratedBy: 'Fatima Hassan',    runCount: 14, category: 'customer',  tags: ['Detractors', 'Root Cause'] },
  { id: 'tpl_9', type: 'promoter_analysis',      name: 'Promoter Analysis',       description: 'Promoter themes, referral potential, advocates',      icon: 'ThumbsUp',         defaultFormat: 'pdf',   estimatedTime: '~40s', lastGenerated: iso(6),  lastGeneratedBy: 'Omar Al Rashid',   runCount: 9,  category: 'customer',  tags: ['Promoters', 'Advocacy'] },
]

// ─── Saved reports (library) ────────────────────────────────────────────────

// ─── Stats ──────────────────────────────────────────────────────────────────

export interface ReportStats {
  totalReports: number
  totalScheduled: number
  totalTemplates: number
  readyReports: number
  generatingReports: number
  failedReports: number
  activeSchedules: number
  pausedSchedules: number
  totalRunsThisMonth: number
  totalDownloads: number
  avgGenerationTime: string
}

export function computeReportStats(saved: SavedReport[], scheduled: ScheduledReport[], templates: ReportTemplate[]): ReportStats {
  const totalRuns = templates.reduce((s, t) => s + t.runCount, 0)
  return {
    totalReports: saved.length,
    totalScheduled: scheduled.length,
    totalTemplates: templates.length,
    readyReports: saved.filter(r => r.status === 'ready').length,
    generatingReports: saved.filter(r => r.status === 'generating').length,
    failedReports: saved.filter(r => r.status === 'failed').length,
    activeSchedules: scheduled.filter(s => s.status === 'active').length,
    pausedSchedules: scheduled.filter(s => s.status === 'paused').length,
    totalRunsThisMonth: totalRuns,
    totalDownloads: Math.round(totalRuns * 1.4),
    avgGenerationTime: '~32s',
  }
}

// ─── Mock chart datasets (for report preview) ───────────────────────────────

export const reportNpsTrendData = [
  { period: 'Jul', nps: 38, responses: 1240 },
  { period: 'Aug', nps: 40, responses: 1380 },
  { period: 'Sep', nps: 37, responses: 1100 },
  { period: 'Oct', nps: 42, responses: 1620 },
  { period: 'Nov', nps: 44, responses: 1840 },
  { period: 'Dec', nps: 41, responses: 1720 },
  { period: 'Jan', nps: 45, responses: 2010 },
  { period: 'Feb', nps: 47, responses: 2180 },
  { period: 'Mar', nps: 46, responses: 2050 },
  { period: 'Apr', nps: 50, responses: 2340 },
  { period: 'May', nps: 51, responses: 2480 },
  { period: 'Jun', nps: 49, responses: 2620 },
]

export const reportBranchData = [
  { branch: 'Dubai',      nps: 54, responses: 1820 },
  { branch: 'Abu Dhabi',  nps: 48, responses: 1640 },
  { branch: 'Murror',     nps: 42, responses: 980  },
  { branch: 'Al Ain',     nps: 39, responses: 720  },
  { branch: 'Al Ain City',nps: 41, responses: 640  },
]

export const reportDeptData = [
  { dept: 'Customer Support', nps: 58 },
  { dept: 'Sales',            nps: 52 },
  { dept: 'Policy Renewal',   nps: 49 },
  { dept: 'Underwriting',     nps: 44 },
  { dept: 'Claims Handling',  nps: 38 },
  { dept: 'Operations',       nps: 41 },
]

export const reportRoleDistribution = [
  { label: 'Promoters', value: 62, color: '#17A673' },
  { label: 'Passives',  value: 23, color: '#F5A623' },
  { label: 'Detractors',value: 15, color: '#E5484D' },
]

export const reportHeatmapData: { day: string; hour: string; value: number }[] = (() => {
  const out: { day: string; hour: string; value: number }[] = []
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const businessHour = h >= 9 && h <= 17 ? 1 : 0
      const weekday = d < 5 ? 1 : 0
      const peak = (h === 14 || h === 15) && d === 1 ? 2 : 0
      const base = (h * 7 + d * 3) % 3
      out.push({ day: d.toString(), hour: h.toString(), value: Math.min(4, base + businessHour + weekday + peak) })
    }
  }
  return out
})()

// ─── Default quick-report config ────────────────────────────────────────────

export const DEFAULT_QUICK_CONFIG: QuickReportConfig = {
  type: 'executive_summary',
  period: '30d',
  branch: 'All',
  department: 'All',
  format: 'pdf',
  includeCharts: true,
  includeRawData: false,
}

export const REPORT_BRANCHES    = ['All', ...BRANCHES]
export const REPORT_DEPARTMENTS = ['All', ...DEPARTMENTS]
