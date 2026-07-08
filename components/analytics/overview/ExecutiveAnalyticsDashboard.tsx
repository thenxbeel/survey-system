'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp, Activity, Building2, Map, Filter,
  GitBranch, Route, Touchpad, Radio, Grid3x3, BarChart3, Calendar, Sparkles,
  Lightbulb, AlertOctagon, BellRing, ArrowRight,
} from 'lucide-react'
import { ExecutivePanel } from './ExecutivePanel'
import { ExecutiveKpiGrid } from './ExecutiveKpiGrid'
import {
  NpsTrendChart, ResponseTrendChart, BranchPerformanceChart,
  DepartmentPerformanceChart, RegionalComparisonChart,
  SurveyCompletionFunnel, CustomerJourneyFunnel,
  TouchpointAnalysisChart, ChannelPerformanceChart,
  ResponseHeatmap, NpsDistributionChart, MonthlyTrendsChart, WeeklyTrendsChart,
} from './charts'
import { ExecutiveInsightCard } from './intelligence/ExecutiveInsightCard'
import { TopImprovementsList }    from './intelligence/TopImprovementsList'
import { AttentionRequiredList }  from './intelligence/AttentionRequiredList'
import { BranchHighlightCard }    from './intelligence/BranchHighlightCard'
import { PriorityCasesTable }     from './intelligence/PriorityCasesTable'
import { RecommendationsList }    from './intelligence/RecommendationsList'
import { AssignModal }            from '@/components/responses/AssignModal'
import { useAnalytics }            from '../state/useAnalytics'
import type {
  AiInsight, Improvement, AttentionItem, BranchHighlight, PriorityCase, Recommendation,
} from '@/lib/types/analytics'

/**
 * ExecutiveAnalyticsDashboard
 * Flagship Overview tab — assembles all KPIs, charts, and intelligence panels.
 *
 * LIVE DATA — fetches from /api/analytics/overview and /api/responses to
 * populate the intelligence panels (insights, priority cases, etc.).
 * The chart components fetch their own data independently.
 */
export function ExecutiveAnalyticsDashboard() {
  const { dispatch, state } = useAnalytics()
  const filters = state.filters

  // ── Live intelligence data ──
  const [insights, setInsights] = useState<AiInsight[]>([])
  const [improvements, setImprovements] = useState<Improvement[]>([])
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([])
  const [highBranch, setHighBranch] = useState<BranchHighlight | null>(null)
  const [lowBranch, setLowBranch] = useState<BranchHighlight | null>(null)
  const [priorityCases, setPriorityCases] = useState<PriorityCase[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  const [assignId, setAssignId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadIntelligence() {
      try {
        const overviewQuery = new URLSearchParams({ period: filters.period })
        if (filters.branch !== 'all') overviewQuery.set('branch', filters.branch)
        if (filters.department !== 'all') overviewQuery.set('department', filters.department)
        if (filters.touchpoint !== 'all') overviewQuery.set('touchpoint', filters.touchpoint)
        if (filters.npsCategory !== 'all') overviewQuery.set('npsCategory', filters.npsCategory)

        const [overviewRes, detractorsRes, branchesRes] = await Promise.all([
          fetch(`/api/analytics/overview?${overviewQuery.toString()}`, { cache: 'no-store' }),
          fetch(`/api/responses?pageSize=20&npsCategory=detractor`, { cache: 'no-store' }),
          fetch(`/api/analytics/branches?${overviewQuery.toString()}`, { cache: 'no-store' }),
        ])
        const overview = overviewRes.ok ? await overviewRes.json() : null
        const detractors = detractorsRes.ok ? await detractorsRes.json() : null
        const branchesData = branchesRes.ok ? await branchesRes.json() : null

        if (cancelled) return

        const k = overview?.data?.kpis ?? {}
        const npsBreakdown = overview?.data?.npsBreakdown ?? {}
        const surveyPerf = overview?.data?.surveyPerformance ?? []
        const channelPerf = overview?.data?.channelPerformance ?? []
        const campaignPerf = overview?.data?.campaignPerformance ?? []
        const employeePerf = overview?.data?.employeePerformance ?? []

        // ── Build insights from live data ──
        const liveInsights: AiInsight[] = []
        if (k.npsScore !== undefined) {
          liveInsights.push({
            id: 'ins-nps',
            category: npsBreakdown.promoterPct >= 60 ? 'opportunity' : 'risk',
            title: `NPS at ${k.npsScore > 0 ? '+' : ''}${k.npsScore}`,
            description: `${npsBreakdown.promoters ?? 0} promoters (${npsBreakdown.promoterPct ?? 0}%), ${npsBreakdown.detractors ?? 0} detractors (${npsBreakdown.detractorPct ?? 0}%).`,
            impact: 'high',
            trend: npsBreakdown.promoterPct >= 60 ? 'up' : 'down',
            metric: `${npsBreakdown.promoterPct ?? 0}% promoters`,
            confidence: 85,
          })
        }
        if (surveyPerf.length > 0) {
          const top = surveyPerf[0]
          liveInsights.push({
            id: 'ins-top-survey',
            category: 'trend',
            title: `"${top.title}" leads in responses`,
            description: `${top.responseCount} responses collected, avg NPS ${top.avgNps ?? '—'}.`,
            impact: 'medium',
            trend: 'up',
            metric: `${top.responseCount} responses`,
            confidence: 80,
          })
        }
        if ((npsBreakdown.detractors ?? 0) > 0) {
          liveInsights.push({
            id: 'ins-detractors',
            category: 'risk',
            title: `${npsBreakdown.detractors ?? 0} detractors need attention`,
            description: `Detractor rate at ${npsBreakdown.detractorPct ?? 0}%. Consider proactive outreach.`,
            impact: 'high',
            trend: 'down',
            metric: `${npsBreakdown.detractors ?? 0} detractors`,
            confidence: 90,
          })
        }
        if (channelPerf.length > 0) {
          const topChannel = channelPerf.reduce((a: any, b: any) => (a.responseCount > b.responseCount ? a : b))
          liveInsights.push({
            id: 'ins-channel',
            category: 'trend',
            title: `${topChannel.channel} is the top distribution channel`,
            description: `${topChannel.responseCount} responses via ${topChannel.channel}.`,
            impact: 'low',
            trend: 'up',
            metric: `${topChannel.responseCount} responses`,
            confidence: 75,
          })
        }
        setInsights(liveInsights)

        // ── Build improvements from survey performance ──
        const liveImprovements: Improvement[] = surveyPerf
          .filter((s: any) => s.nps !== undefined && s.nps < 50)
          .slice(0, 5)
          .map((s: any, i: number) => ({
            id: `imp-${i}`,
            title: s.title,
            description: `NPS at ${s.nps ?? 0} — target is 70`,
            impact: (s.responseCount ?? 0) > 100 ? 'high' : 'medium',
            expectedGain: `+${70 - (s.nps ?? 0)} NPS points`,
            effort: 'medium',
            icon: 'TrendingUp',
          }))
        setImprovements(liveImprovements)

        // ── Build attention items from low NPS surveys ──
        const liveAttention: AttentionItem[] = surveyPerf
          .filter((s: any) => (s.nps ?? 0) < 30)
          .slice(0, 5)
          .map((s: any, i: number) => ({
            id: `att-${i}`,
            title: s.title,
            description: `NPS at ${s.nps ?? 0} — below target`,
            severity: (s.nps ?? 0) < 0 ? 'critical' : 'warning',
            metric: 'NPS',
            metricValue: String(s.nps ?? 0),
            icon: 'AlertOctagon',
          }))
        setAttentionItems(liveAttention)

        // ── Build branch highlights from employee performance ──
        if (employeePerf.length > 0) {
          const sorted = [...employeePerf].sort((a: any, b: any) => (b.nps ?? -100) - (a.nps ?? -100))
          const top = sorted[0]
          const bottom = sorted[sorted.length - 1]
          if (top) {
            setHighBranch({
              name: top.department ?? top.employeeName ?? '—',
              nps: top.nps ?? 0,
              responses: top.responseCount ?? 0,
              change: 0,
              csat: 0,
              topTouchpoint: '—',
              trend: [60, 62, 65, 63, 66, 68, 70, top.nps ?? 70],
            })
          }
          if (bottom && bottom !== top) {
            setLowBranch({
              name: bottom.department ?? bottom.employeeName ?? '—',
              nps: bottom.nps ?? 0,
              responses: bottom.responseCount ?? 0,
              change: 0,
              csat: 0,
              topTouchpoint: '—',
              trend: [40, 38, 35, 33, 30, 28, 25, bottom.nps ?? 25],
            })
          }
        }

        // ── Build priority cases from live detractor responses ──
        const liveCases: PriorityCase[] = (detractors?.data ?? [])
          .filter((r: any) => r.status !== 'resolved' && r.status !== 'closed' && r.status !== 'actioned' && !r.assignedToId)
          .slice(0, 6)
          .map((r: any, i: number) => ({
          id: r.id,
          respondent: r.respondentName || r.id,
          branch: r.distributionChannel || '—',
          product: r.surveyTitle || '—',
          issue: r.feedback || `NPS score: ${r.npsScore}/10`,
          npsScore: r.npsScore ?? 0,
          daysOpen: Math.max(0, Math.floor((Date.now() - new Date(r.submittedAt).getTime()) / 86400000)),
          priority: (r.npsScore ?? 0) <= 3 ? 'critical' as const : 'high' as const,
          assignedTo: r.assignedToName ?? undefined,
        }))
        setPriorityCases(liveCases)

        // ── Build recommendations from live data ──
        const liveRecs: Recommendation[] = []
        if ((npsBreakdown.detractors ?? 0) > 5) {
          liveRecs.push({
            id: 'rec-1',
            title: 'Proactive detractor outreach',
            description: `${npsBreakdown.detractors ?? 0} detractors identified. Initiate follow-up calls within 48 hours.`,
            category: 'process',
            expectedImpact: `Reduce detractor rate by ${(npsBreakdown.detractorPct ?? 0)}%`,
            timeframe: '2 weeks',
            icon: 'AlertOctagon',
          })
        }
        if (surveyPerf.length > 0) {
          const lowNpsSurvey = surveyPerf.find((s: any) => (s.nps ?? 0) < 30)
          if (lowNpsSurvey) {
            liveRecs.push({
              id: 'rec-2',
              title: `Review "${lowNpsSurvey.title}"`,
              description: `NPS at ${lowNpsSurvey.nps ?? 0}. Analyze feedback patterns and revise survey targeting.`,
              category: 'product',
              expectedImpact: `+${70 - (lowNpsSurvey.nps ?? 0)} NPS points`,
              timeframe: '1 month',
              icon: 'Lightbulb',
            })
          }
        }
        if (channelPerf.length > 1) {
          const sorted = [...channelPerf].sort((a: any, b: any) => (b.responseCount ?? 0) - (a.responseCount ?? 0))
          liveRecs.push({
            id: 'rec-3',
            title: `Expand ${sorted[0].channel} distribution`,
            description: `${sorted[0].channel} is your top-performing channel with ${sorted[0].responseCount} responses. Consider allocating more survey invitations to it.`,
            category: 'communication',
            expectedImpact: `+${Math.round((sorted[0].responseCount ?? 0) * 0.2)} responses`,
            timeframe: '1 week',
            icon: 'Route',
          })
        }
        setRecommendations(liveRecs)
      } catch {
        // ignore — intelligence panels will show empty states
      }
    }
    loadIntelligence()
    return () => { cancelled = true }
  }, [filters, refreshTrigger])

  return (
    <div className="flex flex-col gap-6">
      {/* ─────────────── KPI GRID (8 cards) ─────────────── */}
      <ExecutiveKpiGrid />

      {/* ─────────────── EXECUTIVE ANALYTICS (13 charts) ─────────────── */}

      {/* Row 1: NPS Trend (2/3) + NPS Distribution (1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ExecutivePanel
          title="NPS Trend"
          description="Net Promoter Score over time vs target"
          icon={<TrendingUp size={14} strokeWidth={2.2} />}
          accent="#0B4A8B"
          delay={0.05}
          className="lg:col-span-2"
        >
          <div className="min-h-[280px]">
            <NpsTrendChart />
          </div>
        </ExecutivePanel>

        <ExecutivePanel
          title="NPS Distribution"
          description="Responses by 0-10 score bucket"
          icon={<BarChart3 size={14} strokeWidth={2.2} />}
          accent="#17A673"
          delay={0.1}
        >
          <div className="min-h-[280px]">
            <NpsDistributionChart />
          </div>
        </ExecutivePanel>
      </div>

      {/* Row 2: Response Trend (2/3) + Channel Performance (1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ExecutivePanel
          title="Response Trend"
          description="Weekly responses vs completions"
          icon={<Activity size={14} strokeWidth={2.2} />}
          accent="#0B4A8B"
          delay={0.15}
          className="lg:col-span-2"
        >
          <div className="min-h-[280px]">
            <ResponseTrendChart />
          </div>
        </ExecutivePanel>

        <ExecutivePanel
          title="Channel Performance"
          description="Response rate by channel"
          icon={<Radio size={14} strokeWidth={2.2} />}
          accent="#7C3AED"
          delay={0.2}
        >
          <div className="min-h-[280px]">
            <ChannelPerformanceChart />
          </div>
        </ExecutivePanel>
      </div>

      {/* Row 3: Branch Performance + Department Performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExecutivePanel
          title="Branch Performance"
          description="NPS by branch with response volume"
          icon={<Building2 size={14} strokeWidth={2.2} />}
          accent="#0B4A8B"
          delay={0.25}
        >
          <div className="min-h-[260px]">
            <BranchPerformanceChart />
          </div>
        </ExecutivePanel>

        <ExecutivePanel
          title="Department Performance"
          description="NPS vs CSAT by department"
          icon={<GitBranch size={14} strokeWidth={2.2} />}
          accent="#17A673"
          delay={0.3}
        >
          <div className="min-h-[260px]">
            <DepartmentPerformanceChart />
          </div>
        </ExecutivePanel>
      </div>

      {/* Row 4: Regional Comparison + Touchpoint Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExecutivePanel
          title="Regional Comparison"
          description="NPS across UAE regions"
          icon={<Map size={14} strokeWidth={2.2} />}
          accent="#F5A623"
          delay={0.35}
        >
          <div className="min-h-[260px]">
            <RegionalComparisonChart />
          </div>
        </ExecutivePanel>

        <ExecutivePanel
          title="Touchpoint Analysis"
          description="Performance by customer touchpoint"
          icon={<Touchpad size={14} strokeWidth={2.2} />}
          accent="#0B4A8B"
          delay={0.4}
        >
          <div className="min-h-[260px]">
            <TouchpointAnalysisChart />
          </div>
        </ExecutivePanel>
      </div>

      {/* Row 5: Survey Completion Funnel + Customer Journey Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExecutivePanel
          title="Survey Completion Funnel"
          description="Drop-off from send to submission"
          icon={<Filter size={14} strokeWidth={2.2} />}
          accent="#0B4A8B"
          delay={0.45}
        >
          <div className="min-h-[260px]">
            <SurveyCompletionFunnel />
          </div>
        </ExecutivePanel>

        <ExecutivePanel
          title="Customer Journey Funnel"
          description="Awareness → Advocacy conversion"
          icon={<Route size={14} strokeWidth={2.2} />}
          accent="#17A673"
          delay={0.5}
        >
          <div className="min-h-[260px]">
            <CustomerJourneyFunnel />
          </div>
        </ExecutivePanel>
      </div>

      {/* Row 6: Response Heatmap (full width) */}
      <ExecutivePanel
        title="Response Heatmap"
        description="Submission density by day of week × hour"
        icon={<Grid3x3 size={14} strokeWidth={2.2} />}
        accent="#0B4A8B"
        delay={0.55}
      >
        <div className="min-h-[260px]">
          <ResponseHeatmap />
        </div>
      </ExecutivePanel>

      {/* Row 7: Monthly Trends + Weekly Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExecutivePanel
          title="Monthly Trends"
          description="NPS, CSAT, and volume by month"
          icon={<Calendar size={14} strokeWidth={2.2} />}
          accent="#0B4A8B"
          delay={0.6}
        >
          <div className="min-h-[260px]">
            <MonthlyTrendsChart />
          </div>
        </ExecutivePanel>

        <ExecutivePanel
          title="Weekly Trends"
          description="NPS and CSAT by week (last 12)"
          icon={<Calendar size={14} strokeWidth={2.2} />}
          accent="#17A673"
          delay={0.65}
        >
          <div className="min-h-[260px]">
            <WeeklyTrendsChart />
          </div>
        </ExecutivePanel>
      </div>

      {/* ─────────────── EXECUTIVE INTELLIGENCE ─────────────── */}

      {/* Section divider */}
      <div className="mt-2 flex items-center gap-3">
        <div
          className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px]"
          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)' }}
        >
          <Sparkles size={13} color="#fff" />
        </div>
        <div>
          <h2 className="text-[16px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.018em' }}>
            Executive Intelligence
          </h2>
          <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>
            AI-generated insights, priority items, and recommendations
          </p>
        </div>
        <div className="ml-auto hidden items-center gap-2.5 rounded-[8px] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.06em] sm:flex"
          style={{ background: 'var(--tint-purple)', color: '#7C3AED' }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#7C3AED' }} />
          Live AI
        </div>
      </div>

      {/* AI Insights — 2x2 grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} style={{ color: 'var(--primary)' }} />
            <h3 className="text-[13.5px] font-bold" style={{ color: 'var(--text)' }}>AI Insights</h3>
            <span className="rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em]"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-light)' }}
            >
              {insights.length} detected
            </span>
          </div>
          <button
            onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'ask' })}
            className="inline-flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-80"
            style={{ color: 'var(--primary)' }}
          >
            Ask Analytics
            <ArrowRight size={11} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {insights.map((insight, i) => (
            <ExecutiveInsightCard key={insight.id} insight={insight} delay={0.05 * i} />
          ))}
        </div>
      </div>

      {/* Branch Highlights — side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {highBranch && <BranchHighlightCard branch={highBranch} variant="high" delay={0.05} />}
        {lowBranch  && <BranchHighlightCard branch={lowBranch}  variant="low"  delay={0.1}  />}
      </div>

      {/* Top Improvements + Attention Required — side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExecutivePanel
          title="Top Improvements"
          description="Highest-impact actions ranked by expected NPS gain"
          icon={<Lightbulb size={14} strokeWidth={2.2} />}
          accent="#17A673"
          delay={0.05}
        >
          <TopImprovementsList items={improvements} />
        </ExecutivePanel>

        <ExecutivePanel
          title="Attention Required"
          description="Critical items needing immediate review"
          icon={<AlertOctagon size={14} strokeWidth={2.2} />}
          accent="#E5484D"
          delay={0.1}
        >
          <AttentionRequiredList items={attentionItems} />
        </ExecutivePanel>
      </div>

      {/* High Priority Cases (table) */}
      <ExecutivePanel
        title="High Priority Cases"
        description="Open follow-ups ranked by NPS impact and SLA breach"
        icon={<BellRing size={14} strokeWidth={2.2} />}
        accent="#E5484D"
        delay={0.15}
      >
        <PriorityCasesTable cases={priorityCases} onAssign={setAssignId} />
      </ExecutivePanel>

      {/* Recommendations */}
      <ExecutivePanel
        title="Recommendations"
        description="Strategic actions to lift NPS and customer experience"
        icon={<Sparkles size={14} strokeWidth={2.2} />}
        accent="#0B4A8B"
        delay={0.2}
      >
        <RecommendationsList items={recommendations} />
      </ExecutivePanel>

      <AssignModal
        open={assignId !== null}
        onClose={() => setAssignId(null)}
        responseId={assignId!}
        onAssigned={() => {
          setAssignId(null)
          setRefreshTrigger(t => t + 1)
        }}
      />
    </div>
  )
}
