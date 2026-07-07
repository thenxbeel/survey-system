'use client'

import { useState } from 'react'
import {
  X, LineChart as LineIcon, BarChart3, PieChart as PieIcon,
  ScatterChart as ScatterIcon, Grid3x3, Radar as RadarIcon, Check, Plus,
} from 'lucide-react'
import { useAnalytics } from '../state/useAnalytics'
import { ChartType, MetricType, GroupByType, WidgetConfig } from '@/types/analytics'

const chartTypes: { value: ChartType; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'line',    label: 'Trend',    icon: LineIcon,    desc: 'Time-series line chart' },
  { value: 'bar',     label: 'Bar',      icon: BarChart3,   desc: 'Horizontal bar comparison' },
  { value: 'pie',     label: 'Pie',      icon: PieIcon,     desc: 'Donut distribution chart' },
  { value: 'scatter', label: 'Scatter',  icon: ScatterIcon, desc: 'Two-axis correlation' },
  { value: 'radar',   label: 'Radar',    icon: RadarIcon,   desc: 'Multi-axis performance' },
  { value: 'heatmap', label: 'Heatmap',  icon: Grid3x3,     desc: 'Day × hour density grid' },
]

const metrics: { value: MetricType; label: string }[] = [
  { value: 'responses',  label: 'Total Submissions'  },
  { value: 'completions',label: 'Total Completions'  },
  { value: 'time',       label: 'Avg. Handling Time' },
  { value: 'rate',       label: 'CSAT Score'         },
]

const groupBys: { value: GroupByType; label: string }[] = [
  { value: 'date',     label: 'Date / Time' },
  { value: 'survey',   label: 'Branch'      },
  { value: 'category', label: 'Department'  },
  { value: 'status',   label: 'Touchpoint'  },
]

export function AddWidgetDrawer() {
  const { state, dispatch } = useAnalytics()
  const [chartType, setChartType] = useState<ChartType>('line')
  const [metric,    setMetric]    = useState<MetricType>('responses')
  const [groupBy,   setGroupBy]   = useState<GroupByType>('date')
  const [title,     setTitle]     = useState('New Visualization')
  const [added,     setAdded]     = useState(false)

  const open = state.modals.addWidget
  if (!open) return null

  function close() {
    dispatch({ type: 'CLOSE_MODAL', modal: 'addWidget' })
    setTimeout(() => setAdded(false), 200)
  }

  function add() {
    const widget: WidgetConfig = {
      id: `w${Date.now()}`,
      title: title.trim() || `${chartTypes.find(c => c.value === chartType)?.label} — ${metrics.find(m => m.value === metric)?.label}`,
      chartType,
      metric,
      groupBy,
      w: chartType === 'heatmap' ? 2 : 1,
      h: 1,
    }
    dispatch({ type: 'ADD_WIDGET', widget })
    setAdded(true)
    setTimeout(close, 700)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="flex h-full w-full max-w-[420px] flex-col border-l border-[#E6EDF3] bg-[#F5F7FA] shadow-[-16px_0_40px_rgba(0,0,0,0.4)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6EDF3] px-4 py-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[#333333]">Add Widget</h2>
            <p className="text-[11px] text-[#8A94A6]">Configure and append to active dashboard</p>
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
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A94A6]">Widget Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="h-9 w-full rounded-[7px] border border-[#E6EDF3] bg-[#FFFFFF] px-3 text-[12px] text-[#333333] focus:border-[#0B4A8B] focus:outline-none"
              placeholder="e.g. Monthly Submission Trend"
            />
          </div>

          {/* Chart Type */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A94A6]">Chart Type</label>
            <div className="grid grid-cols-2 gap-2.5">
              {chartTypes.map(c => {
                const Icon = c.icon
                const active = chartType === c.value
                return (
                  <button
                    key={c.value}
                    onClick={() => setChartType(c.value)}
                    className={`flex items-start gap-2 rounded-[8px] border p-2.5 text-left transition-all
                      ${active
                        ? 'border-[#0B4A8B] bg-[rgba(11, 74, 139,0.08)]'
                        : 'border-[#E6EDF3] bg-[#FFFFFF] hover:border-[#B0B8C4]'
                      }`}
                  >
                    <Icon size={14} className={active ? 'text-[#0B4A8B]' : 'text-[#8A94A6]'} />
                    <div className="min-w-0">
                      <div className={`text-[11px] font-medium ${active ? 'text-[#0B4A8B]' : 'text-[#333333]'}`}>{c.label}</div>
                      <div className="truncate text-[10px] text-[#8A94A6]">{c.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Metric */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A94A6]">Metric</label>
            <div className="grid grid-cols-2 gap-2.5">
              {metrics.map(m => {
                const active = metric === m.value
                return (
                  <button
                    key={m.value}
                    onClick={() => setMetric(m.value)}
                    className={`rounded-[6px] border px-3 py-2 text-left text-[11px] font-medium transition-all
                      ${active
                        ? 'border-[#0B4A8B] bg-[rgba(11, 74, 139,0.08)] text-[#0B4A8B]'
                        : 'border-[#E6EDF3] bg-[#FFFFFF] text-[#8A94A6] hover:border-[#B0B8C4] hover:text-[#333333]'
                      }`}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Group By */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A94A6]">Group By</label>
            <div className="grid grid-cols-2 gap-2.5">
              {groupBys.map(g => {
                const active = groupBy === g.value
                return (
                  <button
                    key={g.value}
                    onClick={() => setGroupBy(g.value)}
                    className={`rounded-[6px] border px-3 py-2 text-left text-[11px] font-medium transition-all
                      ${active
                        ? 'border-[#0B4A8B] bg-[rgba(11, 74, 139,0.08)] text-[#0B4A8B]'
                        : 'border-[#E6EDF3] bg-[#FFFFFF] text-[#8A94A6] hover:border-[#B0B8C4] hover:text-[#333333]'
                      }`}
                  >
                    {g.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-[#E6EDF3] px-4 py-3">
          <button
            onClick={close}
            className="flex items-center justify-center text-center h-8 rounded-[7px] border border-[#E6EDF3] bg-[#FFFFFF] px-4 text-[12px] font-medium text-[#8A94A6] transition-all hover:border-[#B0B8C4] hover:text-[#333333]"
          >
            Cancel
          </button>
          <button
            onClick={add}
            disabled={added}
            className={`inline-flex h-8 items-center gap-2.5 rounded-[7px] px-4 text-[12px] font-medium transition-all
              ${added ? 'bg-[#17A673] text-white' : 'bg-[#0B4A8B] text-white hover:opacity-90'}`}
          >
            {added ? <><Check size={13} /> Added</> : <><Plus size={13} /> Add Widget</>}
          </button>
        </div>
      </div>
    </div>
  )
}
