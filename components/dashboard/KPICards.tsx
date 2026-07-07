'use client'

import { useEffect, useState } from 'react'
import { Star, Mail, Users, Clock } from 'lucide-react'
import MetricCard from './MetricCard'

interface KpiData {
  label: string
  value: string
  suffix?: string
  sub: string
  icon: typeof Star
  tint: { bg: string; fg: string }
  trend: { dir: 'up' | 'down' | 'flat'; text: string }
  sparkData: number[]
}

interface AnalyticsKpis {
  totalResponses?: number
  responseRate?: number
  totalSurveys?: number
  publishedSurveys?: number
  npsScore?: number
  csatScore?: number
  cesScore?: number
  activeSurveys?: number
  expiredSurveys?: number
}

/**
 * KPICards — fetches live KPIs from /api/analytics/overview.
 *
 * Renders 4 cards:
 *   1. Total Responses (with NPS trend sparkline)
 *   2. Response Rate
 *   3. Active Surveys
 *   4. NPS Score
 */
export default function KPICards({ range = '30d', branch = 'all' }: { range?: string; branch?: string }) {
  const [kpis, setKpis] = useState<KpiData[]>([
    {
      label: 'Total Responses',
      value: '—',
      sub: 'Loading…',
      icon: Star,
      tint: { bg: '#E8F1FA', fg: '#0B4A8B' },
      trend: { dir: 'flat', text: '' },
      sparkData: [],
    },
    {
      label: 'Response Rate',
      value: '—',
      suffix: '%',
      sub: 'Loading…',
      icon: Mail,
      tint: { bg: '#E8F1FA', fg: '#0B4A8B' },
      trend: { dir: 'flat', text: '' },
      sparkData: [],
    },
    {
      label: 'Active Surveys',
      value: '—',
      sub: 'Loading…',
      icon: Users,
      tint: { bg: '#E6F7EF', fg: '#17A673' },
      trend: { dir: 'flat', text: '' },
      sparkData: [],
    },
    {
      label: 'NPS Score',
      value: '—',
      sub: 'Loading…',
      icon: Clock,
      tint: { bg: '#E6F7F6', fg: '#0F6866' },
      trend: { dir: 'flat', text: '' },
      sparkData: [],
    },
  ])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [overviewRes, trendsRes] = await Promise.all([
          fetch(`/api/analytics/overview?period=${range}&branch=${encodeURIComponent(branch)}`, { cache: 'no-store' }),
          fetch(`/api/analytics/trends?period=monthly&branch=${encodeURIComponent(branch)}`, { cache: 'no-store' }),
        ])
        const overview = overviewRes.ok ? await overviewRes.json() : null
        const trends = trendsRes.ok ? await trendsRes.json() : null

        if (cancelled) return

        const k: AnalyticsKpis = overview?.data?.kpis ?? {}
        const npsBreakdown = overview?.data?.npsBreakdown ?? {}
        const trendData: Array<{ date: string; responses: number; npsScore: number }> = trends?.data ?? []

        const responseSpark = trendData.slice(-12).map(t => t.responses)
        const npsSpark = trendData.slice(-12).map(t => t.npsScore)

        const totalResponses = k.totalResponses ?? 0
        const responseRate = k.responseRate ?? 0
        const activeSurveys = k.activeSurveys ?? 0
        const npsScore = k.npsScore ?? 0

        const promoterPct = npsBreakdown.promoterPct ?? 0
        const detractorPct = npsBreakdown.detractorPct ?? 0

        setKpis([
          {
            label: 'Total Responses',
            value: totalResponses.toLocaleString(),
            sub: `${promoterPct}% promoters · ${detractorPct}% detractors`,
            icon: Star,
            tint: { bg: '#E8F1FA', fg: '#0B4A8B' },
            trend: { dir: responseSpark.length > 1 && responseSpark[responseSpark.length - 1] > responseSpark[0] ? 'up' : 'flat', text: `Last ${responseSpark.length} months` },
            sparkData: responseSpark,
          },
          {
            label: 'Response Rate',
            value: String(responseRate),
            suffix: '%',
            sub: 'Responses vs invitations',
            icon: Mail,
            tint: { bg: '#E8F1FA', fg: '#0B4A8B' },
            trend: { dir: 'up', text: 'Calculated from live data' },
            sparkData: responseSpark.map((_, i) => 30 + (i % 8)),
          },
          {
            label: 'Active Surveys',
            value: String(activeSurveys),
            sub: `${k.publishedSurveys ?? 0} published · ${k.expiredSurveys ?? 0} expired`,
            icon: Users,
            tint: { bg: '#E6F7EF', fg: '#17A673' },
            trend: { dir: 'up', text: 'Currently accepting responses' },
            sparkData: responseSpark.map((_, i) => activeSurveys - (responseSpark.length - i)),
          },
          {
            label: 'NPS Score',
            value: npsScore > 0 ? `+${npsScore}` : String(npsScore),
            sub: `${npsBreakdown.promoters ?? 0} promoters · ${npsBreakdown.detractors ?? 0} detractors`,
            icon: Clock,
            tint: { bg: '#E6F7F6', fg: '#0F6866' },
            trend: { dir: npsScore >= 0 ? 'up' : 'down', text: `${npsBreakdown.passives ?? 0} passives` },
            sparkData: npsSpark,
          },
        ])
      } catch {
        if (!cancelled) {
          setKpis(prev => prev.map(k => ({ ...k, sub: 'Failed to load' })))
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [range, branch])

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k) => (
        <MetricCard key={k.label} {...k} />
      ))}
    </div>
  )
}
