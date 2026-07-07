'use client'

import { useEffect, useState } from 'react'
import { InsightCard } from './InsightCard'
import type { InsightData } from '@/types/analytics'

export function InsightGrid() {
  const [insights, setInsights] = useState<InsightData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/overview?period=30d', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const k = json.data.kpis ?? {}
        const b = json.data.npsBreakdown ?? {}
        const liveInsights: InsightData[] = []
        if (k.npsScore !== undefined) {
          liveInsights.push({
            id: 'ins-nps',
            title: `NPS at ${k.npsScore > 0 ? '+' : ''}${k.npsScore}`,
            description: `${b.promoters ?? 0} promoters, ${b.detractors ?? 0} detractors.`,
            impact: 'high',
            trend: b.promoterPct >= 50 ? 'up' : 'down',
            metric: 'Promoters',
            metricValue: `${b.promoterPct ?? 0}%`,
          })
        }
        if (k.totalResponses) {
          liveInsights.push({
            id: 'ins-resp',
            title: `${k.totalResponses} total responses`,
            description: `Response rate at ${k.responseRate ?? 0}%.`,
            impact: 'medium',
            trend: 'up',
            metric: 'Responses',
            metricValue: String(k.totalResponses),
          })
        }
        if ((b.detractors ?? 0) > 0) {
          liveInsights.push({
            id: 'ins-det',
            title: `${b.detractors} detractors`,
            description: `${b.detractorPct ?? 0}% detractor rate.`,
            impact: 'high',
            trend: 'down',
            metric: 'Detractors',
            metricValue: String(b.detractors),
          })
        }
        setInsights(liveInsights)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-8 text-center text-[12px] text-[#8A94A6]">Loading insights…</div>

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {insights.slice(0, 3).map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  )
}
