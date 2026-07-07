// lib/types/analytics.ts
//
// Analytics type definitions — extracted from the former lib/mock-data/executiveAnalytics.ts.
// All analytics data now comes from /api/analytics/* (Prisma-backed).

export interface ExecutiveKpi {
  id: string
  label: string
  value: string
  suffix?: string
  change: number
  comparison: string
  sparkline: number[]
  icon: string
  accent: string
  tint: { bg: string; fg: string }
  invertTrend?: boolean
}

export interface AiInsight {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  trend: 'up' | 'down'
  metric?: string
  metricValue?: string
  confidence: number
  category: 'opportunity' | 'risk' | 'trend' | 'anomaly'
}

export interface Improvement {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  expectedGain: string
  effort: 'low' | 'medium' | 'high'
  icon: string
}

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

export interface BranchHighlight {
  name: string
  nps: number
  change: number
  responses: number
  csat: number
  topTouchpoint: string
  trend: number[]
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

export interface Recommendation {
  id: string
  title: string
  description: string
  category: 'process' | 'training' | 'product' | 'communication'
  expectedImpact: string
  timeframe: string
  icon: string
}
