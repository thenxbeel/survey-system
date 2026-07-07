'use client'
import { useAnalytics } from '../../state/useAnalytics'
import { buildOverviewQuery, safeNumber } from '@/lib/analytics-query'

import { useEffect, useState } from 'react'

interface FunnelStage { stage: string; value: number; pct: number; color: string }

const COLORS = ['#0B4A8B', '#1E5FA8', '#3A7CC0', '#17A673', '#0F6866']

export function SurveyCompletionFunnel() {
  const { state } = useAnalytics()
  const filters = state.filters
  const [stages, setStages] = useState<FunnelStage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/overview?${buildOverviewQuery(filters)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.kpis) return
        const k = json.data.kpis
        const totalResponses = k.totalResponses ?? 0
        const totalSurveys = k.totalSurveys ?? 0
        const publishedSurveys = k.publishedSurveys ?? 0
        const activeSurveys = k.activeSurveys ?? 0
        // Build a funnel: Surveys Created → Published → Active → Responses → NPS Responses
        const npsCount = (json.data.npsBreakdown?.promoters ?? 0) + (json.data.npsBreakdown?.passives ?? 0) + (json.data.npsBreakdown?.detractors ?? 0)
        const max = Math.max(totalSurveys, publishedSurveys, activeSurveys, totalResponses, npsCount, 1)
        const funnel: FunnelStage[] = [
          { stage: 'Surveys Created', value: totalSurveys, pct: 100, color: COLORS[0] },
          { stage: 'Published', value: publishedSurveys, pct: totalSurveys > 0 ? Math.round((publishedSurveys / totalSurveys) * 100) : 0, color: COLORS[1] },
          { stage: 'Active', value: activeSurveys, pct: totalSurveys > 0 ? Math.round((activeSurveys / totalSurveys) * 100) : 0, color: COLORS[2] },
          { stage: 'Responses', value: totalResponses, pct: max > 0 ? Math.round((totalResponses / max) * 100) : 0, color: COLORS[3] },
          { stage: 'NPS Scored', value: npsCount, pct: totalResponses > 0 ? Math.round((npsCount / totalResponses) * 100) : 0, color: COLORS[4] },
        ]
        setStages(funnel)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
  }, [filters])

  if (loading) return <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>

  const max = Math.max(...stages.map(s => safeNumber(s.value)), 1)

  return (
    <div className="flex h-full flex-col justify-center gap-2.5 py-1">
      {stages.length === 0 ? (
        <div className="text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>No data available</div>
      ) : (
        stages.map((stage, i) => {
          const widthPct = (stage.value / max) * 100
          const dropoff = i > 0 ? ((stages[i - 1].value - stage.value) / Math.max(stages[i - 1].value, 1)) * 100 : 0
          return (
            <div key={stage.stage} className="group">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
                  <span className="text-[11.5px] font-semibold" style={{ color: 'var(--text)' }}>{stage.stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11.5px] tabular font-bold" style={{ color: 'var(--text)' }}>{stage.value.toLocaleString()}</span>
                  <span className="text-[10px] tabular font-semibold rounded-[4px] px-1.5 py-0.5" style={{ background: 'var(--bg-subtle)', color: 'var(--text-light)' }}>{stage.pct}%</span>
                  {dropoff > 0 && <span className="text-[10px] tabular font-semibold" style={{ color: '#E5484D' }}>-{dropoff.toFixed(1)}%</span>}
                </div>
              </div>
              <div className="h-[14px] rounded-full transition-all duration-300 group-hover:brightness-110" style={{ width: `${widthPct}%`, background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}cc 100%)` }} />
            </div>
          )
        })
      )}
    </div>
  )
}
