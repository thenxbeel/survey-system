'use client'
import { useAnalytics } from '../../state/useAnalytics'
import { buildOverviewQuery, safeNumber } from '@/lib/analytics-query'

import { useEffect, useState } from 'react'

interface FunnelStage { stage: string; value: number; color: string }

const COLORS = ['#0B4A8B', '#1E5FA8', '#3A7CC0', '#17A673', '#0F6866', '#7C3AED']

export function CustomerJourneyFunnel() {
  const { state } = useAnalytics()
  const filters = state.filters
  const [stages, setStages] = useState<FunnelStage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pull live counts for every journey stage. No stage is fabricated — each
    // value comes straight from the database. (The platform has no
    // invite/open tracking, so the funnel uses real Survey + Response counts.)
    const overviewQ = buildOverviewQuery(filters)
    Promise.all([
      fetch(`/api/analytics/overview?${overviewQ}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      fetch(`/api/analytics/nps?${overviewQ}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
    ])
      .then(([overview, nps]) => {
        const k = overview?.data?.kpis ?? {}
        const totalResponses = k.totalResponses ?? 0
        const publishedSurveys = k.publishedSurveys ?? 0
        const activeSurveys = k.activeSurveys ?? 0
        const npsScored = nps?.data?.total
          ?? ((overview?.data?.npsBreakdown?.promoters ?? 0)
            + (overview?.data?.npsBreakdown?.passives ?? 0)
            + (overview?.data?.npsBreakdown?.detractors ?? 0))
        const promoters = nps?.data?.promoters ?? overview?.data?.npsBreakdown?.promoters ?? 0

        const funnel: FunnelStage[] = [
          { stage: 'Published Surveys', value: publishedSurveys, color: COLORS[0] },
          { stage: 'Active Surveys',    value: activeSurveys,    color: COLORS[1] },
          { stage: 'Responses Received', value: totalResponses,  color: COLORS[2] },
          { stage: 'NPS Scored',        value: npsScored,        color: COLORS[3] },
          { stage: 'Promoters',         value: promoters,        color: COLORS[4] },
        ]
        setStages(funnel)
      })
      .catch(() => { /* ignore — empty state will render */ })
      .finally(() => setLoading(false))
  }, [filters])

  if (loading) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>

  const max = Math.max(...stages.map(s => safeNumber(s.value)), 1)

  return (
    <div className="flex h-full flex-col justify-center gap-2 py-1">
      {stages.length === 0 ? (
        <div className="text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>No data available</div>
      ) : (
        stages.map((stage, i) => {
          const widthPct = (stage.value / max) * 100
          const conversion = i > 0 ? (stage.value / Math.max(stages[i - 1].value, 1)) * 100 : 100
          return (
            <div key={stage.stage} className="group">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] text-[9.5px] font-bold text-white" style={{ background: stage.color }}>{i + 1}</span>
                  <span className="text-[11.5px] font-semibold" style={{ color: 'var(--text)' }}>{stage.stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11.5px] tabular font-bold" style={{ color: 'var(--text)' }}>{stage.value.toLocaleString()}</span>
                  {i > 0 && <span className="text-[10px] tabular font-semibold" style={{ color: 'var(--text-light)' }}>{conversion.toFixed(1)}%</span>}
                </div>
              </div>
              <div className="h-[12px] rounded-full transition-all duration-300 group-hover:brightness-110" style={{ width: `${widthPct}%`, background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}cc 100%)` }} />
            </div>
          )
        })
      )}
    </div>
  )
}
