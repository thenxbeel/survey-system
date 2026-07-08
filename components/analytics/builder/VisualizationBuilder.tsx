'use client'

import { useState } from 'react'
import {
  BarChart3, LineChart as LineIcon, PieChart as PieIcon, ScatterChart as ScatterIcon,
  Grid3x3, Radar as RadarIcon, Check, X,
} from 'lucide-react'
import { ChartContainer } from '../charts/ChartContainer'
import { TrendChart } from '../charts/TrendChart'
import { VolumeBarChart } from '../charts/VolumeBarChart'
import { DistributionPieChart } from '../charts/DistributionPieChart'
import { CompletionScatter } from '../charts/CompletionScatter'
import { PerformanceRadar } from '../charts/PerformanceRadar'
import { ActivityHeatmap } from '../charts/ActivityHeatmap'
import { useAnalytics } from '../state/useAnalytics'
import {
  ChartType, MetricType, GroupByType, FilterType, VisualizationConfig, WidgetConfig,
} from '@/types/analytics'

const chartOptions: { value: ChartType; label: string; icon: React.ElementType }[] = [
  { value: 'line',     label: 'Trend',     icon: LineIcon     },
  { value: 'bar',      label: 'Bar',       icon: BarChart3    },
  { value: 'pie',      label: 'Pie',       icon: PieIcon      },
  { value: 'scatter',  label: 'Scatter',   icon: ScatterIcon  },
  { value: 'radar',    label: 'Radar',     icon: RadarIcon    },
  { value: 'heatmap',  label: 'Heatmap',   icon: Grid3x3      },
]

const metricOptions: { value: MetricType; label: string }[] = [
  { value: 'responses',  label: 'Total Submissions' },
  { value: 'completions',label: 'Total Completions' },
  { value: 'time',       label: 'Avg. Handling Time' },
  { value: 'rate',       label: 'CSAT Score'         },
]

const groupByOptions: { value: GroupByType; label: string }[] = [
  { value: 'date',     label: 'Date / Time'    },
  { value: 'survey',   label: 'Branch'         },
  { value: 'category', label: 'Department'     },
  { value: 'status',   label: 'Touchpoint'     },
]

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all',       label: 'All'         },
  { value: 'active',    label: 'Abu Dhabi'   },
  { value: 'completed', label: 'Dubai'       },
  { value: 'draft',     label: 'Al Ain City' },
]

function renderPreview(chartType: ChartType, config: VisualizationConfig) {
  switch (chartType) {
    case 'line':    return <TrendChart metric={config.metric} groupBy={config.groupBy} filterOverride={config.filter} />
    case 'bar':     return <VolumeBarChart metric={config.metric} groupBy={config.groupBy} filterOverride={config.filter} />
    case 'pie':     return <DistributionPieChart metric={config.metric} groupBy={config.groupBy} filterOverride={config.filter} />
    case 'scatter': return <CompletionScatter metric={config.metric} groupBy={config.groupBy} filterOverride={config.filter} />
    case 'radar':   return <PerformanceRadar metric={config.metric} groupBy={config.groupBy} filterOverride={config.filter} />
    case 'heatmap': return <ActivityHeatmap metric={config.metric} groupBy={config.groupBy} filterOverride={config.filter} />
    default:        return null
  }
}

function chartTitleFor(type: ChartType) {
  return chartOptions.find(o => o.value === type)?.label ?? 'Chart'
}

export function VisualizationBuilder() {
  const { state, dispatch } = useAnalytics()
  const [config, setConfig] = useState<VisualizationConfig>({
    chartType: 'line', metric: 'responses', groupBy: 'date', filter: 'all',
  })
  const [saved, setSaved] = useState(false)

  const open = state.modals.vizBuilder
  if (!open) return null

  function close() {
    dispatch({ type: 'CLOSE_MODAL', modal: 'vizBuilder' })
    // Reset saved indicator after close animation
    setTimeout(() => setSaved(false), 200)
  }

  function addToDashboard() {
    const newWidget: WidgetConfig = {
      id: `w${Date.now()}`,
      title: `${chartTitleFor(config.chartType)} — ${metricOptions.find(m => m.value === config.metric)?.label}`,
      description: `Grouped by ${groupByOptions.find(g => g.value === config.groupBy)?.label}`,
      chartType: config.chartType,
      metric: config.metric,
      groupBy: config.groupBy,
      w: config.chartType === 'heatmap' ? 2 : 1,
      h: 1,
    }
    dispatch({ type: 'ADD_WIDGET', widget: newWidget })
    setSaved(true)
    setTimeout(close, 900)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[860px] flex-col overflow-hidden rounded-[12px] border border-[#E6EDF3] bg-[#F5F7FA] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6EDF3] px-4 py-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[#333333]">Create Visualization</h2>
            <p className="text-[11px] text-[#8A94A6]">Configure chart type, metric, and group-by — preview live</p>
          </div>
          <button
            onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#8A94A6] transition-all hover:bg-[#F5F7FA] hover:text-[#333333]"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2">
          {/* Config column */}
          <div className="space-y-4">
            {/* Chart Type */}
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A94A6]">Chart Type</label>
              <div className="grid grid-cols-3 gap-2.5">
                {chartOptions.map(opt => {
                  const Icon = opt.icon
                  const active = config.chartType === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setConfig(p => ({ ...p, chartType: opt.value }))}
                      className={`flex flex-col items-center gap-2.5 rounded-[8px] border p-3 text-[11px] font-medium transition-all
                        ${active
                          ? 'border-[#0B4A8B] bg-[rgba(11, 74, 139,0.08)] text-[#0B4A8B]'
                          : 'border-[#E6EDF3] bg-[#FFFFFF] text-[#8A94A6] hover:border-[#B0B8C4] hover:text-[#333333]'
                        }`}
                    >
                      <Icon size={16} />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Metric */}
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A94A6]">Metric</label>
              <select
                value={config.metric}
                onChange={e => setConfig(p => ({ ...p, metric: e.target.value as MetricType }))}
                className="h-9 w-full rounded-[7px] border border-[#E6EDF3] bg-[#FFFFFF] px-3 text-[12px] text-[#333333] focus:border-[#0B4A8B] focus:outline-none"
              >
                {metricOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Group By */}
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A94A6]">Group By</label>
              <select
                value={config.groupBy}
                onChange={e => setConfig(p => ({ ...p, groupBy: e.target.value as GroupByType }))}
                className="h-9 w-full rounded-[7px] border border-[#E6EDF3] bg-[#FFFFFF] px-3 text-[12px] text-[#333333] focus:border-[#0B4A8B] focus:outline-none"
              >
                {groupByOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Filter */}
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A94A6]">Branch Filter</label>
              <div className="grid grid-cols-4 gap-0.5 rounded-[7px] border border-[#E6EDF3] bg-[#F5F7FA] p-0.5">
                {filterOptions.map(f => {
                  const active = config.filter === f.value
                  return (
                    <button
                      key={f.value}
                      onClick={() => setConfig(p => ({ ...p, filter: f.value as FilterType }))}
                      className={`rounded-[5px] py-1.5 text-[11px] font-medium transition-all
                        ${active
                          ? 'bg-[#F5F7FA] text-[#333333]'
                          : 'text-[#8A94A6] hover:text-[#333333]'
                        }`}
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Preview column */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A94A6]">Live Preview</label>
            <div className="flex-1 rounded-[10px] border border-dashed border-[#E6EDF3] bg-[#F5F7FA] p-2">
              <ChartContainer
                title={`${metricOptions.find(m => m.value === config.metric)?.label} by ${groupByOptions.find(g => g.value === config.groupBy)?.label}`}
                description={`Filter: ${filterOptions.find(f => f.value === config.filter)?.label}`}
                className="h-full border-0 shadow-none"
              >
                {renderPreview(config.chartType, config)}
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E6EDF3] bg-[#F5F7FA] px-4 py-3">
          <p className="text-[11px] text-[#B0B8C4]">
            Will be added to <span className="text-[#8A94A6]">{
              state.savedDashboards.find(d => d.id === state.activeDashboardId)?.name ?? 'current dashboard'
            }</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={close}
              className="flex items-center justify-center text-center h-8 rounded-[7px] border border-[#E6EDF3] bg-[#FFFFFF] px-4 text-[12px] font-medium text-[#8A94A6] transition-all hover:border-[#B0B8C4] hover:text-[#333333]"
            >
              Cancel
            </button>
            <button
              onClick={addToDashboard}
              disabled={saved}
              className={`inline-flex h-8 items-center gap-2.5 rounded-[7px] px-4 text-[12px] font-medium transition-all
                ${saved
                  ? 'bg-[#17A673] text-white'
                  : 'bg-[#0B4A8B] text-white hover:opacity-90'
                }`}
            >
              {saved ? <><Check size={13} /> Added</> : <><Check size={13} /> Add to Dashboard</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
