'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExecutiveKpiCard } from './ExecutiveKpiCard'
import type { ExecutiveKpi } from '@/lib/types/analytics'
import { useAnalytics } from '../state/useAnalytics'
import { buildOverviewQuery, buildTrendsQuery, safeNumber } from '@/lib/analytics-query'

/**
 * ExecutiveKpiGrid — 8 flagship KPI cards arranged in a responsive grid.
 *
 * LIVE DATA — fetches from /api/analytics/overview and maps the API response
 * into the ExecutiveKpi shape that ExecutiveKpiCard expects.
 * Refetches whenever the analytics filters change.
 */
export function ExecutiveKpiGrid() {
  const { state } = useAnalytics()
  const filters = state.filters
  const [kpis, setKpis] = useState<ExecutiveKpi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [overviewRes, trendsRes] = await Promise.all([
          fetch(`/api/analytics/overview?${buildOverviewQuery(filters)}`, { cache: 'no-store' }),
          fetch(`/api/analytics/trends?${buildTrendsQuery(filters)}`, { cache: 'no-store' }),
        ])
        const overview = overviewRes.ok ? await overviewRes.json() : null
        const trends = trendsRes.ok ? await trendsRes.json() : null

        if (cancelled) return

        const k = overview?.data?.kpis ?? {}
        const npsBreakdown = overview?.data?.npsBreakdown ?? {}
        const trendData: Array<{ responses: number; npsScore: number; completions: number }> = trends?.data ?? []

        const responseSpark = trendData.slice(-10).map(t => safeNumber(t.responses))
        const npsSpark = trendData.slice(-10).map(t => safeNumber(t.npsScore))
        const completionSpark = trendData.slice(-10).map(t => t.completions || t.responses)

        const totalResponses = k.totalResponses ?? 0
        const npsScore = k.npsScore ?? 0
        const responseRate = k.responseRate ?? 0
        const activeSurveys = k.activeSurveys ?? 0
        const totalSurveys = k.totalSurveys ?? 0
        const totalCampaigns = k.totalCampaigns ?? 0

        const promoters = npsBreakdown.promoters ?? 0
        const detractors = npsBreakdown.detractors ?? 0
        const passives = npsBreakdown.passives ?? 0

        const liveKpis: ExecutiveKpi[] = [
          {
            id: 'nps',
            label: 'Overall NPS',
            value: npsScore > 0 ? `+${npsScore}` : String(npsScore),
            change: npsSpark.length > 1 ? npsSpark[npsSpark.length - 1] - npsSpark[0] : 0,
            comparison: `${promoters} promoters · ${detractors} detractors`,
            sparkline: npsSpark,
            icon: 'TrendingUp',
            accent: '#0B4A8B',
            tint: { bg: '#E8F1FA', fg: '#0B4A8B' },
          },
          {
            id: 'responses',
            label: 'Total Responses',
            value: totalResponses.toLocaleString(),
            change: responseSpark.length > 1 ? Math.round(((responseSpark[responseSpark.length - 1] - responseSpark[0]) / Math.max(responseSpark[0], 1)) * 100) : 0,
            comparison: `Last ${responseSpark.length} months`,
            sparkline: responseSpark,
            icon: 'Activity',
            accent: '#17A673',
            tint: { bg: '#ECFDF5', fg: '#17A673' },
          },
          {
            id: 'response-rate',
            label: 'Response Rate',
            value: String(responseRate),
            suffix: '%',
            change: 0,
            comparison: 'Responses vs invitations',
            sparkline: responseSpark.map(() => responseRate),
            icon: 'Radio',
            accent: '#0B4A8B',
            tint: { bg: '#E8F1FA', fg: '#0B4A8B' },
          },
          {
            id: 'active-surveys',
            label: 'Active Surveys',
            value: String(activeSurveys),
            change: 0,
            comparison: `${k.publishedSurveys ?? 0} published total`,
            sparkline: responseSpark.map(() => activeSurveys),
            icon: 'BarChart3',
            accent: '#17A673',
            tint: { bg: '#ECFDF5', fg: '#17A673' },
          },
          {
            id: 'promoters',
            label: 'Promoters',
            value: String(promoters),
            change: 0,
            comparison: `${npsBreakdown.promoterPct ?? 0}% of total`,
            sparkline: responseSpark,
            icon: 'TrendingUp',
            accent: '#17A673',
            tint: { bg: '#ECFDF5', fg: '#17A673' },
          },
          {
            id: 'passives',
            label: 'Passives',
            value: String(passives),
            change: 0,
            comparison: `${npsBreakdown.passivePct ?? 0}% of total`,
            sparkline: responseSpark,
            icon: 'Activity',
            accent: '#F59E0B',
            tint: { bg: '#FFFBEB', fg: '#D97706' },
          },
          {
            id: 'detractors',
            label: 'Detractors',
            value: String(detractors),
            change: 0,
            comparison: `${npsBreakdown.detractorPct ?? 0}% of total`,
            sparkline: responseSpark,
            icon: 'AlertOctagon',
            accent: '#E5484D',
            tint: { bg: '#FEF2F2', fg: '#E5484D' },
            invertTrend: true,
          },
          {
            id: 'campaigns',
            label: 'Campaigns',
            value: String(totalCampaigns),
            change: 0,
            comparison: `${totalSurveys} total surveys`,
            sparkline: responseSpark.map(() => totalCampaigns),
            icon: 'Route',
            accent: '#7C3AED',
            tint: { bg: '#F5F3FF', fg: '#7C3AED' },
          },
        ]

        setKpis(liveKpis)
      } catch {
        if (!cancelled) setKpis([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [filters])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="min-h-[180px] rounded-[18px] bg-white shimmer" style={{ border: '1px solid var(--border)' }} />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
    >
      {kpis.map((kpi, i) => (
        <ExecutiveKpiCard key={kpi.id} kpi={kpi} delay={i * 0.05} />
      ))}
    </motion.div>
  )
}
