'use client'

import { useEffect, useState } from 'react'
import { AnalyticsProvider } from '@/components/analytics/state/AnalyticsProvider'
import { useAnalytics } from '@/components/analytics/state/useAnalytics'
import { AnalyticsHeader }    from '@/components/analytics/layout/AnalyticsHeader'
import { AnalyticsToolbar }   from '@/components/analytics/layout/AnalyticsToolbar'
import { ExecutiveAnalyticsDashboard } from '@/components/analytics/overview/ExecutiveAnalyticsDashboard'
import { DashboardBuilder }   from '@/components/analytics/builder/DashboardBuilder'
import { SavedDashboardsList } from '@/components/analytics/builder/SavedDashboardsList'
import { VisualizationBuilder } from '@/components/analytics/builder/VisualizationBuilder'
import { AddWidgetDrawer }    from '@/components/analytics/builder/AddWidgetDrawer'
import { AskAnalytics }       from '@/components/analytics/assistant/AskAnalytics'
import { ExportCenter }       from '@/components/analytics/export/ExportCenter'
import { CommandPalette }     from '@/components/analytics/command/CommandPalette'
import { ChartLoadingSkeleton } from '@/components/analytics/charts/ChartLoadingSkeleton'
import { ChartContainer }   from '@/components/analytics/charts/ChartContainer'
import { TrendChart }       from '@/components/analytics/charts/TrendChart'
import { VolumeBarChart }   from '@/components/analytics/charts/VolumeBarChart'
import { DistributionPieChart } from '@/components/analytics/charts/DistributionPieChart'
import { PerformanceRadar } from '@/components/analytics/charts/PerformanceRadar'
import { ActivityHeatmap }  from '@/components/analytics/charts/ActivityHeatmap'
import { CompletionScatter } from '@/components/analytics/charts/CompletionScatter'

/**
 * OverviewTab — flagship Executive Analytics Dashboard.
 * Replaces the previous Overview with 8 KPIs, 13 charts, and Executive Intelligence.
 */
function OverviewTab() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {/* KPI skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[180px] rounded-[18px] bg-white shimmer"
              style={{ border: '1px solid var(--border)' }}
            />
          ))}
        </div>
        {/* Chart skeletons */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="min-h-[360px] rounded-[18px] bg-white shimmer lg:col-span-2" style={{ border: '1px solid var(--border)' }} />
          <div className="min-h-[360px] rounded-[18px] bg-white shimmer" style={{ border: '1px solid var(--border)' }} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="min-h-[340px] rounded-[18px] bg-white shimmer" style={{ border: '1px solid var(--border)' }} />
          <div className="min-h-[340px] rounded-[18px] bg-white shimmer" style={{ border: '1px solid var(--border)' }} />
        </div>
      </div>
    )
  }

  return <ExecutiveAnalyticsDashboard />
}

/**
 * CustomTab — preserves existing Custom Dashboards functionality.
 */
function CustomTab() {
  return (
    <div className="flex flex-col gap-6">
      <SavedDashboardsList />
      <DashboardBuilder />
    </div>
  )
}

/**
 * BuilderTab — Visualization Builder with LIVE chart previews.
 * Charts are wired to the existing mock analytics data (no placeholders).
 */
function BuilderTab() {
  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-[14px] bg-white p-8"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <h2 className="text-[14px] font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.012em' }}>
          Visualization Builder
        </h2>
        <p className="mt-0.5 text-[12px]" style={{ color: 'var(--text-light)' }}>
          Configure chart type, metric, and group-by — preview live — then push the widget to your active custom dashboard.
        </p>
        <button
          onClick={() => {
            const ev = new CustomEvent('open-viz-builder')
            window.dispatchEvent(ev)
          }}
          className="mt-4 inline-flex h-9 items-center gap-2.5 rounded-[9px] px-4 text-[12px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}
        >
          Open Builder
        </button>
      </div>

      {/* Live chart previews — wired to real mock data, NOT skeletons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          title="Response Timeline"
          description="Monthly submission & completion trend"
        >
          <TrendChart />
        </ChartContainer>
        <ChartContainer
          title="Volume by Product"
          description="Total submissions per Takaful product line"
        >
          <VolumeBarChart />
        </ChartContainer>
        <ChartContainer
          title="Branch Distribution"
          description="Response share by UAE branch"
        >
          <DistributionPieChart />
        </ChartContainer>
        <ChartContainer
          title="Department Performance"
          description="CSAT score by department (radar)"
        >
          <PerformanceRadar />
        </ChartContainer>
        <ChartContainer
          title="Touchpoint Analysis"
          description="Time vs completion rate by touchpoint"
        >
          <CompletionScatter />
        </ChartContainer>
        <ChartContainer
          title="Activity Heatmap"
          description="Response volume by day × hour"
        >
          <ActivityHeatmap />
        </ChartContainer>
      </div>
    </div>
  )
}

function AnalyticsContent() {
  const { state, dispatch } = useAnalytics()

  // Listen for the "open builder" event triggered by the Builder tab's CTA
  useEffect(() => {
    function onOpen() { dispatch({ type: 'OPEN_MODAL', modal: 'vizBuilder' }) }
    window.addEventListener('open-viz-builder', onOpen)
    return () => window.removeEventListener('open-viz-builder', onOpen)
  }, [dispatch])

  return (
    <div className="flex flex-col gap-6 p-7">
      <AnalyticsHeader />
      <AnalyticsToolbar />

      {state.tab === 'overview' && <OverviewTab />}
      {state.tab === 'custom'   && <CustomTab />}
      {state.tab === 'builder'  && <BuilderTab />}

      {/* Global modals & overlays — always mounted, conditionally visible via state */}
      <AskAnalytics />
      <VisualizationBuilder />
      <AddWidgetDrawer />
      <ExportCenter />
      <CommandPalette />
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <AnalyticsProvider>
      <AnalyticsContent />
    </AnalyticsProvider>
  )
}
