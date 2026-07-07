'use client'

import { useEffect, useState } from 'react'
import { KpiCard } from './KpiCard'
import type { KpiData } from '@/types/analytics'

export function KpiGrid() {
  const [kpis, setKpis] = useState<KpiData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [overviewRes, trendsRes] = await Promise.all([
          fetch('/api/analytics/overview?period=30d', { cache: 'no-store' }),
          fetch('/api/analytics/trends?period=monthly', { cache: 'no-store' }),
        ])
        const overview = overviewRes.ok ? await overviewRes.json() : null
        const trends = trendsRes.ok ? await trendsRes.json() : null
        if (cancelled) return

        const k = overview?.data?.kpis ?? {}
        const npsBreakdown = overview?.data?.npsBreakdown ?? {}
        const trendData: Array<{ responses: number; npsScore: number }> = trends?.data ?? []
        const spark = trendData.slice(-8).map(t => t.npsScore ?? 0)
        const respSpark = trendData.slice(-8).map(t => t.responses ?? 0)

        const liveKpis: KpiData[] = [
          {
            id: 'nps',
            title: 'Overall NPS',
            value: (k.npsScore ?? 0) > 0 ? `+${k.npsScore}` : String(k.npsScore ?? 0),
            change: spark.length > 1 ? spark[spark.length - 1] - spark[0] : 0,
            trend: spark.length > 1 && spark[spark.length - 1] >= spark[0] ? 'up' : 'down',
            sparkline: spark.length > 0 ? spark : [0],
            accent: '#0B4A8B',
            sub: `${npsBreakdown.promoters ?? 0} promoters`,
          },
          {
            id: 'responses',
            title: 'Total Responses',
            value: String(k.totalResponses ?? 0),
            change: respSpark.length > 1 ? Math.round(((respSpark[respSpark.length - 1] - respSpark[0]) / Math.max(respSpark[0], 1)) * 100) : 0,
            trend: respSpark.length > 1 && respSpark[respSpark.length - 1] >= respSpark[0] ? 'up' : 'down',
            sparkline: respSpark.length > 0 ? respSpark : [0],
            accent: '#17A673',
            sub: 'All surveys',
          },
          {
            id: 'active',
            title: 'Active Surveys',
            value: String(k.activeSurveys ?? 0),
            change: 0,
            trend: 'up',
            sparkline: [k.activeSurveys ?? 0],
            accent: '#F5A623',
            sub: `${k.publishedSurveys ?? 0} published`,
          },
          {
            id: 'rate',
            title: 'Response Rate',
            value: String(k.responseRate ?? 0),
            suffix: '%',
            change: 0,
            trend: 'up',
            sparkline: [k.responseRate ?? 0],
            accent: '#7C3AED',
            sub: 'Live',
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
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-h-[140px] rounded-[12px] bg-white shimmer" style={{ border: '1px solid var(--border)' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  )
}
