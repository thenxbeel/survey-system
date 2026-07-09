// ───────────────────────────────────────────────────────────────────────────
// lib/mock-data/executiveAnalytics.ts
// Mock data for the Executive Analytics Dashboard (flagship Overview tab).
// All values are static — purely presentational, no backend calls.
// ───────────────────────────────────────────────────────────────────────────

// ─── Executive KPIs (8 cards) ──────────────────────────────────────────────

export interface ExecutiveKpi {
  id: string
  label: string
  value: string
  suffix?: string
  change: number                 // signed percent vs previous period
  comparison: string             // e.g. "vs +64 last period"
  sparkline: number[]            // 7-12 points
  icon: string                   // lucide icon name (resolved at render)
  accent: string                 // hex color
  tint: { bg: string; fg: string }
  invertTrend?: boolean          // true for metrics where down = good (e.g. open follow-ups)
}

export const executiveKpis: ExecutiveKpi[] = [
  {
    id: 'nps',
    label: 'Overall NPS',
    value: '+68',
    change: 6.3,
    comparison: 'vs +64 last 30 days',
    sparkline: [55, 58, 56, 60, 62, 61, 64, 66, 65, 68],
    icon: 'TrendingUp',
    accent: '#0B4A8B',
    tint: { bg: '#E8F1FA', fg: '#0B4A8B' },
  },
  {
    id: 'response-rate',
    label: 'Response Rate',
    value: '38.4',
    suffix: '%',
    change: 4.1,
    comparison: 'vs 36.9% last 30 days',
    sparkline: [28, 30, 31, 33, 32, 35, 36, 37, 38, 38.4],
    icon: 'MailCheck',
    accent: '#17A673',
    tint: { bg: '#ECFDF5', fg: '#17A673' },
  },
  {
    id: 'promoters',
    label: 'Promoters',
    value: '17,842',
    change: 8.7,
    comparison: 'vs 16,410 last 30 days',
    sparkline: [14200, 14800, 15100, 15600, 16100, 16410, 16900, 17200, 17500, 17842],
    icon: 'ThumbsUp',
    accent: '#17A673',
    tint: { bg: '#ECFDF5', fg: '#17A673' },
  },
  {
    id: 'passives',
    label: 'Passives',
    value: '5,217',
    change: -2.3,
    comparison: 'vs 5,340 last 30 days',
    sparkline: [5600, 5500, 5480, 5420, 5390, 5340, 5310, 5280, 5240, 5217],
    icon: 'Minus',
    accent: '#F5A623',
    tint: { bg: '#FFFBEB', fg: '#D97706' },
  },
  {
    id: 'detractors',
    label: 'Detractors',
    value: '1,832',
    change: -12.4,
    comparison: 'vs 2,091 last 30 days',
    sparkline: [2400, 2300, 2250, 2200, 2150, 2091, 2020, 1970, 1900, 1832],
    icon: 'ThumbsDown',
    accent: '#E5484D',
    tint: { bg: '#FEF2F2', fg: '#E5484D' },
    invertTrend: true,
  },
  {
    id: 'csat',
    label: 'CSAT Score',
    value: '87.4',
    suffix: '%',
    change: 3.2,
    comparison: 'vs 84.7% last 30 days',
    sparkline: [78, 79, 81, 80, 82, 83, 84, 85, 86, 87.4],
    icon: 'Smile',
    accent: '#0B4A8B',
    tint: { bg: '#E8F1FA', fg: '#0B4A8B' },
  },
  {
    id: 'ces',
    label: 'CES Score',
    value: '4.3',
    suffix: '/5',
    change: 2.1,
    comparison: 'vs 4.21 last 30 days',
    sparkline: [3.9, 4.0, 4.05, 4.1, 4.15, 4.18, 4.21, 4.25, 4.28, 4.3],
    icon: 'Zap',
    accent: '#7C3AED',
    tint: { bg: '#F5F3FF', fg: '#7C3AED' },
  },
  {
    id: 'active-surveys',
    label: 'Active Surveys',
    value: '12',
    change: 9.1,
    comparison: 'vs 11 last 30 days',
    sparkline: [8, 9, 9, 10, 10, 11, 11, 12, 12, 12],
    icon: 'FileText',
    accent: '#17A673',
    tint: { bg: '#ECFDF5', fg: '#17A673' },
    invertTrend: true,
  },
]

// ─── NPS Trend (8 monthly points) ──────────────────────────────────────────

export const npsTrendData = [
  { month: 'Jan', nps: 52, target: 60 },
  { month: 'Feb', nps: 55, target: 60 },
  { month: 'Mar', nps: 53, target: 60 },
  { month: 'Apr', nps: 58, target: 60 },
  { month: 'May', nps: 61, target: 65 },
  { month: 'Jun', nps: 64, target: 65 },
  { month: 'Jul', nps: 66, target: 68 },
  { month: 'Aug', nps: 68, target: 70 },
]

// ─── Response Trend (12 weeks) ─────────────────────────────────────────────

export const responseTrendData = [
  { week: 'W1', responses: 410, completions: 360, rate: 87.8 },
  { week: 'W2', responses: 480, completions: 420, rate: 87.5 },
  { week: 'W3', responses: 445, completions: 400, rate: 89.9 },
  { week: 'W4', responses: 510, completions: 470, rate: 92.2 },
  { week: 'W5', responses: 530, completions: 490, rate: 92.5 },
  { week: 'W6', responses: 495, completions: 450, rate: 90.9 },
  { week: 'W7', responses: 580, completions: 540, rate: 93.1 },
  { week: 'W8', responses: 620, completions: 580, rate: 93.5 },
  { week: 'W9', responses: 645, completions: 600, rate: 93.0 },
  { week: 'W10', responses: 690, completions: 645, rate: 93.5 },
  { week: 'W11', responses: 720, completions: 680, rate: 94.4 },
  { week: 'W12', responses: 760, completions: 720, rate: 94.7 },
]

// ─── Branch Performance ────────────────────────────────────────────────────

export const branchPerformanceData = [
  { branch: 'Abu Dhabi',     nps: 72, responses: 11200, change: 4.2 },
  { branch: 'Dubai',         nps: 68, responses: 8400,  change: 2.8 },
  { branch: 'Al Ain City',   nps: 61, responses: 4200,  change: -1.4 },
  { branch: 'Remote/Digital',nps: 74, responses: 2800,  change: 8.6 },
]

// ─── Department Performance ────────────────────────────────────────────────

export const departmentPerformanceData = [
  { department: 'Customer Support', nps: 78, csat: 92, responses: 5400 },
  { department: 'Sales',            nps: 65, csat: 84, responses: 4200 },
  { department: 'Claims Handling',  nps: 58, csat: 81, responses: 6800 },
  { department: 'Underwriting',     nps: 71, csat: 88, responses: 3100 },
  { department: 'Policy Services',  nps: 75, csat: 90, responses: 5300 },
]

// ─── Regional Comparison (UAE Emirates) ────────────────────────────────────

export const regionalComparisonData = [
  { region: 'Abu Dhabi Emirate',  nps: 71, promoters: 9200, detractors: 880,  color: '#0B4A8B' },
  { region: 'Dubai Emirate',      nps: 68, promoters: 6800, detractors: 720,  color: '#17A673' },
  { region: 'Al Ain Region',      nps: 61, promoters: 3400, detractors: 540,  color: '#F5A623' },
  { region: 'Sharjah & N.Emirates',nps: 64, promoters: 2100, detractors: 380, color: '#7C3AED' },
  { region: 'Digital (Remote)',   nps: 74, promoters: 2400, detractors: 210,  color: '#06B6D4' },
]

// ─── Survey Completion Funnel ──────────────────────────────────────────────

export const surveyCompletionFunnel = [
  { stage: 'Surveys Sent',        value: 24891, pct: 100, color: '#0B4A8B' },
  { stage: 'Surveys Opened',      value: 18420, pct: 74,  color: '#1E5FA8' },
  { stage: 'Surveys Started',     value: 14280, pct: 57.4, color: '#3A7CC0' },
  { stage: 'Surveys Completed',   value: 11530, pct: 46.3, color: '#17A673' },
  { stage: 'Responses Submitted', value: 10847, pct: 43.6, color: '#0F6866' },
]

// ─── Response Funnel (survey distribution funnel) ──────────────────────────

export const customerJourneyFunnel = [
  { stage: 'Survey Sent',         value: 84500, pct: 100,  color: '#0B4A8B' },
  { stage: 'Survey Opened',       value: 41200, pct: 48.8, color: '#1E5FA8' },
  { stage: 'Started',             value: 24891, pct: 29.5, color: '#3A7CC0' },
  { stage: 'Partially Completed', value: 22340, pct: 26.4, color: '#17A673' },
  { stage: 'Fully Submitted',     value: 18620, pct: 22.0, color: '#0F6866' },
  { stage: 'With NPS Score',      value: 12480, pct: 14.8, color: '#7C3AED' },
]

// ─── Touchpoint Analysis ───────────────────────────────────────────────────

export const touchpointAnalysisData = [
  { touchpoint: 'Policy Purchase',    nps: 78, csat: 92, volume: 4200 },
  { touchpoint: 'Policy Renewal',     nps: 74, csat: 89, volume: 3800 },
  { touchpoint: 'Claims Submission',  nps: 52, csat: 76, volume: 5400 },
  { touchpoint: 'Claims Settlement',  nps: 58, csat: 81, volume: 4100 },
  { touchpoint: 'Call Center',        nps: 65, csat: 85, volume: 6800 },
  { touchpoint: 'Mobile App',         nps: 71, csat: 88, volume: 5900 },
  { touchpoint: 'Website',           nps: 69, csat: 86, volume: 5200 },
]

// ─── Channel Performance ───────────────────────────────────────────────────

export const channelPerformanceData = [
  { channel: 'Mobile App', responses: 8400, rate: 42.1, nps: 71, color: '#0B4A8B' },
  { channel: 'Email',      responses: 6200, rate: 34.8, nps: 67, color: '#17A673' },
  { channel: 'SMS',        responses: 5400, rate: 38.2, nps: 65, color: '#F5A623' },
  { channel: 'Website',    responses: 3100, rate: 28.6, nps: 69, color: '#7C3AED' },
  { channel: 'Call Center',responses: 1791, rate: 44.5, nps: 73, color: '#06B6D4' },
]

// ─── Response Heatmap (7 days × 12 hours, 8 AM → 8 PM) ─────────────────────

export const responseHeatmapHours = [
  '8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm',
]

export const responseHeatmapDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// Deterministic intensity 0..4 — no Math.random
export const responseHeatmapData: number[][] = responseHeatmapDays.map((_, d) =>
  responseHeatmapHours.map((_, h) => {
    const businessHour = h >= 2 && h <= 8 ? 1 : 0   // 10am–4pm peak
    const weekday      = d < 5 ? 1 : 0
    const lunchDip     = h === 4 ? -1 : 0            // 12pm dip
    const peak         = (h === 6 || h === 7) && d === 2 ? 2 : 0  // Tue 2-4pm spike
    const base         = (h * 7 + d * 3) % 3
    return Math.max(0, Math.min(4, base + businessHour + weekday + lunchDip + peak))
  })
)

// ─── NPS Distribution (0-10 scale buckets) ─────────────────────────────────

export const npsDistributionData = [
  { score: '0', count: 142,  category: 'detractor' },
  { score: '1', count: 98,   category: 'detractor' },
  { score: '2', count: 121,  category: 'detractor' },
  { score: '3', count: 187,  category: 'detractor' },
  { score: '4', count: 224,  category: 'detractor' },
  { score: '5', count: 318,  category: 'detractor' },
  { score: '6', count: 742,  category: 'detractor' },
  { score: '7', count: 5217, category: 'passive'   },
  { score: '8', count: 6842, category: 'promoter'  },
  { score: '9', count: 5420, category: 'promoter'  },
  { score: '10',count: 5580, category: 'promoter'  },
]

// ─── Monthly Trends (12 months) ────────────────────────────────────────────

export const monthlyTrendsData = [
  { month: 'Sep', nps: 48, csat: 81, responses: 1820 },
  { month: 'Oct', nps: 51, csat: 82, responses: 2100 },
  { month: 'Nov', nps: 49, csat: 81, responses: 1980 },
  { month: 'Dec', nps: 54, csat: 83, responses: 2400 },
  { month: 'Jan', nps: 52, csat: 82, responses: 2200 },
  { month: 'Feb', nps: 55, csat: 83, responses: 2580 },
  { month: 'Mar', nps: 53, csat: 82, responses: 2380 },
  { month: 'Apr', nps: 58, csat: 84, responses: 2740 },
  { month: 'May', nps: 61, csat: 85, responses: 3120 },
  { month: 'Jun', nps: 64, csat: 86, responses: 3480 },
  { month: 'Jul', nps: 66, csat: 87, responses: 3820 },
  { month: 'Aug', nps: 68, csat: 87, responses: 4080 },
]

// ─── Weekly Trends (12 weeks — NPS by week) ────────────────────────────────

export const weeklyTrendsData = [
  { week: 'W1', nps: 58, csat: 84, responses: 410 },
  { week: 'W2', nps: 60, csat: 85, responses: 480 },
  { week: 'W3', nps: 59, csat: 84, responses: 445 },
  { week: 'W4', nps: 62, csat: 86, responses: 510 },
  { week: 'W5', nps: 64, csat: 86, responses: 530 },
  { week: 'W6', nps: 63, csat: 85, responses: 495 },
  { week: 'W7', nps: 65, csat: 87, responses: 580 },
  { week: 'W8', nps: 66, csat: 87, responses: 620 },
  { week: 'W9', nps: 67, csat: 88, responses: 645 },
  { week: 'W10',nps: 67, csat: 88, responses: 690 },
  { week: 'W11',nps: 68, csat: 88, responses: 720 },
  { week: 'W12',nps: 68, csat: 87, responses: 760 },
]

// ─── Executive Intelligence ────────────────────────────────────────────────

export interface AiInsight {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  trend: 'up' | 'down'
  metric?: string
  metricValue?: string
  confidence: number         // 0-100
  category: 'opportunity' | 'risk' | 'trend' | 'anomaly'
}

export const aiInsights: AiInsight[] = [
  {
    id: 'ai-1',
    title: 'Mobile App NPS surge detected',
    description: 'Mobile App NPS rose 14 points over the last 30 days, driven by the new digital intake flow launched May 12. Abu Dhabi and Dubai branches show the strongest gains.',
    impact: 'high',
    trend: 'up',
    metric: 'Mobile App NPS',
    metricValue: '+14 pts',
    confidence: 94,
    category: 'trend',
  },
  {
    id: 'ai-2',
    title: 'Claims Submission detractor cluster',
    description: '14 detractors in the past 30 days cluster around Health Takaful claims at the Abu Dhabi branch. Common verbatim: "slow claim approval". Recommend process review.',
    impact: 'high',
    trend: 'down',
    metric: 'Detractors (Health Takaful, AUH)',
    metricValue: '14 responses',
    confidence: 91,
    category: 'risk',
  },
  {
    id: 'ai-3',
    title: 'Renewal touchpoint outperforms Claims',
    description: 'Policy Renewal surveys show 22% higher NPS than Claims Handling surveys (+58 vs +36). Consider applying renewal journey patterns to claims workflow.',
    impact: 'high',
    trend: 'up',
    metric: 'Renewal vs Claims NPS delta',
    metricValue: '+22%',
    confidence: 88,
    category: 'opportunity',
  },
  {
    id: 'ai-4',
    title: 'Saturday volume anomaly',
    description: 'Saturday submission volume dropped 41% vs the prior 4-week average. Likely caused by scheduled-send pause during system maintenance.',
    impact: 'low',
    trend: 'down',
    metric: 'Saturday volume',
    metricValue: '-41% vs 4wk avg',
    confidence: 76,
    category: 'anomaly',
  },
]

export interface Improvement {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  expectedGain: string
  effort: 'low' | 'medium' | 'high'
  icon: string
}

export const topImprovements: Improvement[] = [
  {
    id: 'imp-1',
    title: 'Reduce claims approval cycle time',
    description: 'Average approval takes 6.2 days. Target: 4 days. Detractors cite "slow approval" as top friction.',
    impact: 'high',
    expectedGain: '+8 NPS pts',
    effort: 'medium',
    icon: 'Clock',
  },
  {
    id: 'imp-2',
    title: 'Extend Mobile App intake to Health Takaful',
    description: 'Mobile App intake lifted Motor NPS by 14 pts. Replicate for Health Takaful claims.',
    impact: 'high',
    expectedGain: '+6 NPS pts',
    effort: 'medium',
    icon: 'Smartphone',
  },
  {
    id: 'imp-3',
    title: 'Schedule sends for Tue 2-4pm peak window',
    description: 'Peak engagement window in Dubai. Scheduling sends here could lift response rate by ~6%.',
    impact: 'medium',
    expectedGain: '+6% response rate',
    effort: 'low',
    icon: 'CalendarClock',
  },
  {
    id: 'imp-4',
    title: 'Personalize renewal follow-up calls',
    description: 'Renewal NPS already strong (+58). Personalized callbacks for premium-tier customers could push to +70.',
    impact: 'medium',
    expectedGain: '+4 NPS pts',
    effort: 'low',
    icon: 'PhoneCall',
  },
]

export interface AttentionItem {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  metric: string
  metricValue: string
  branch?: string
  icon: string
}

export const attentionRequired: AttentionItem[] = [
  {
    id: 'att-1',
    title: 'Claims Submission CSAT decline',
    description: 'CSAT dropped from 77% to 62% on Mobile App at the Dubai branch over 7 days.',
    severity: 'critical',
    metric: 'CSAT (Dubai, Mobile App)',
    metricValue: '62% (-15 pts)',
    branch: 'Dubai',
    icon: 'AlertTriangle',
  },
  {
    id: 'att-2',
    title: 'Detractor cluster — Abu Dhabi',
    description: '14 detractors in Health Takaful claims at AUH branch in past 30 days.',
    severity: 'critical',
    metric: 'Detractors (Health Takaful, AUH)',
    metricValue: '14 responses',
    branch: 'Abu Dhabi',
    icon: 'Users',
  },
  {
    id: 'att-3',
    title: 'Saturday volume anomaly',
    description: 'Saturday submissions -41% vs prior 4-week average. Possible send-schedule issue.',
    severity: 'warning',
    metric: 'Saturday volume',
    metricValue: '-41%',
    icon: 'CalendarX',
  },
  {
    id: 'att-4',
    title: '47 open follow-ups overdue',
    description: 'High-priority follow-ups past SLA. 12 are critical and older than 48 hours.',
    severity: 'warning',
    metric: 'Open follow-ups',
    metricValue: '47 overdue',
    icon: 'BellRing',
  },
]

export interface BranchHighlight {
  name: string
  nps: number
  change: number
  responses: number
  csat: number
  topTouchpoint: string
  trend: number[]   // 8 points sparkline
}

export const highestPerformingBranch: BranchHighlight = {
  name: 'Remote / Digital',
  nps: 74,
  change: 8.6,
  responses: 2800,
  csat: 91,
  topTouchpoint: 'Mobile App',
  trend: [58, 60, 62, 65, 68, 70, 72, 74],
}

export const lowestPerformingBranch: BranchHighlight = {
  name: 'Al Ain City',
  nps: 61,
  change: -1.4,
  responses: 4200,
  csat: 82,
  topTouchpoint: 'Claims Submission',
  trend: [68, 66, 65, 64, 63, 62, 61, 61],
}

export interface PriorityCase {
  id: string
  respondent: string
  branch: string
  product: string
  issue: string
  npsScore: number
  daysOpen: number
  priority: 'critical' | 'high' | 'medium'
  assignedTo?: string
}

export const highPriorityCases: PriorityCase[] = [
  {
    id: 'PC-2048',
    respondent: 'Khalid Al Rashid',
    branch: 'Abu Dhabi',
    product: 'Health Takaful',
    issue: 'Claim approval delayed 21 days',
    npsScore: 3,
    daysOpen: 9,
    priority: 'critical',
    assignedTo: 'Sara A.',
  },
  {
    id: 'PC-2051',
    respondent: 'Aisha Al Marzooqi',
    branch: 'Dubai',
    product: 'Motor Takaful',
    issue: 'Mobile app crash during submission',
    npsScore: 2,
    daysOpen: 7,
    priority: 'critical',
    assignedTo: 'Omar K.',
  },
  {
    id: 'PC-2063',
    respondent: 'Mohammed Saeed',
    branch: 'Al Ain City',
    product: 'Family Takaful',
    issue: 'Renewal premium dispute',
    npsScore: 4,
    daysOpen: 5,
    priority: 'high',
    assignedTo: 'Layla M.',
  },
  {
    id: 'PC-2071',
    respondent: 'Fatima Al Zaabi',
    branch: 'Abu Dhabi',
    product: 'Property Takaful',
    issue: 'Documentation request loop',
    npsScore: 5,
    daysOpen: 4,
    priority: 'high',
  },
  {
    id: 'PC-2082',
    respondent: 'Ahmed Al Hosani',
    branch: 'Dubai',
    product: 'Travel Takaful',
    issue: 'Refund not processed',
    npsScore: 3,
    daysOpen: 3,
    priority: 'medium',
    assignedTo: 'Yousef A.',
  },
]

export interface Recommendation {
  id: string
  title: string
  description: string
  category: 'process' | 'training' | 'product' | 'communication'
  expectedImpact: string
  timeframe: string
  icon: string
}

export const recommendations: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Launch digital-first claims intake',
    description: 'Extend the Mobile App intake (currently Motor-only) to Health and Family Takaful. The current Motor App lift was +14 NPS pts.',
    category: 'product',
    expectedImpact: '+8 NPS pts',
    timeframe: '4-6 weeks',
    icon: 'Smartphone',
  },
  {
    id: 'rec-2',
    title: 'SLA enforcement for claims approval',
    description: 'Auto-escalate any claim open > 5 days. Current avg is 6.2 days; target 4.0 days.',
    category: 'process',
    expectedImpact: '+6 NPS pts',
    timeframe: '2 weeks',
    icon: 'Timer',
  },
  {
    id: 'rec-3',
    title: 'Schedule sends in peak windows',
    description: 'Target Tue 2-4pm and Thu 10am-12pm. Expected response-rate lift +6%.',
    category: 'communication',
    expectedImpact: '+6% response rate',
    timeframe: '1 week',
    icon: 'CalendarClock',
  },
  {
    id: 'rec-4',
    title: 'Claims handler empathy training',
    description: 'Verbatim analysis shows 38% of detractors cite tone. Run empathy workshop for 12 claims handlers in AUH and DXB.',
    category: 'training',
    expectedImpact: '+4 NPS pts',
    timeframe: '3 weeks',
    icon: 'GraduationCap',
  },
]
