'use client'

import { useEffect, useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import { InsightCard } from '../assistant/InsightCard'
import { useAnalytics } from '../state/useAnalytics'
import type { InsightData } from '@/types/analytics'

export function InsightFeed() {
  const { dispatch } = useAnalytics()
  const [insights, setInsights] = useState<InsightData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/overview?period=30d', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const k = json.data.kpis ?? {}
        const b = json.data.npsBreakdown ?? {}
        const surveyPerf = json.data.surveyPerformance ?? []
        const channelPerf = json.data.channelPerformance ?? []
        const liveInsights: InsightData[] = []

        if (k.npsScore !== undefined) {
          liveInsights.push({
            id: 'ins-nps',
            title: `NPS at ${k.npsScore > 0 ? '+' : ''}${k.npsScore}`,
            description: `${b.promoters ?? 0} promoters (${b.promoterPct ?? 0}%), ${b.detractors ?? 0} detractors (${b.detractorPct ?? 0}%).`,
            impact: 'high',
            trend: b.promoterPct >= 50 ? 'up' : 'down',
            metric: 'Promoters',
            metricValue: `${b.promoterPct ?? 0}%`,
          })
        }
        if (surveyPerf.length > 0) {
          const top = surveyPerf[0]
          liveInsights.push({
            id: 'ins-top',
            title: `"${top.title}" leads responses`,
            description: `${top.responseCount} responses, avg NPS ${top.avgNps ?? '—'}.`,
            impact: 'medium',
            trend: 'up',
            metric: 'Responses',
            metricValue: String(top.responseCount),
          })
        }
        if ((b.detractors ?? 0) > 0) {
          liveInsights.push({
            id: 'ins-detractors',
            title: `${b.detractors ?? 0} detractors need attention`,
            description: `Detractor rate at ${b.detractorPct ?? 0}%.`,
            impact: 'high',
            trend: 'down',
            metric: 'Detractors',
            metricValue: String(b.detractors ?? 0),
          })
        }
        if (channelPerf.length > 0) {
          const top = channelPerf.reduce((a: any, c: any) => (a.responseCount > c.responseCount ? a : c))
          liveInsights.push({
            id: 'ins-channel',
            title: `${top.channel} is the top channel`,
            description: `${top.responseCount} responses via ${top.channel}.`,
            impact: 'low',
            trend: 'up',
            metric: 'Channel',
            metricValue: top.channel,
          })
        }
        setInsights(liveInsights)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[rgba(11, 74, 139,0.12)]">
            <Sparkles size={12} className="text-[#0B4A8B]" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold tracking-[-0.2px] text-[#333333]">AI-Generated Insights</h2>
            <p className="text-[11px] text-[#8A94A6]">{loading ? 'Loading…' : `${insights.length} insights from live data`}</p>
          </div>
        </div>
        <button onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'ask' })} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0B4A8B] hover:underline">
          Ask Analytics <ArrowRight size={11} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-[12px] text-[#8A94A6]">Loading insights…</div>
        ) : insights.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[12px] text-[#8A94A6]">No insights available yet</div>
        ) : (
          insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))
        )}
      </div>
    </div>
  )
}
