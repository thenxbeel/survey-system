'use client'

import {
  ArrowLeft, ArrowRight, Maximize2, Minimize2, Copy, Trash2, GripVertical,
} from 'lucide-react'
import { ChartContainer } from '../charts/ChartContainer'
import { TrendChart } from '../charts/TrendChart'
import { VolumeBarChart } from '../charts/VolumeBarChart'
import { DistributionPieChart } from '../charts/DistributionPieChart'
import { PerformanceRadar } from '../charts/PerformanceRadar'
import { CompletionScatter } from '../charts/CompletionScatter'
import { ActivityHeatmap } from '../charts/ActivityHeatmap'
import { WidgetConfig, MetricType, GroupByType } from '@/types/analytics'

interface DashboardWidgetProps {
  widget: WidgetConfig
  isEditMode: boolean
  onMove:      (id: string, dir: 'left' | 'right') => void
  onResize:    (id: string, axis: 'w' | 'h', delta: number) => void
  onDuplicate: (id: string) => void
  onDelete:    (id: string) => void
}

const METRIC_LABELS: Record<MetricType, string> = {
  responses:   'Total Submissions',
  completions: 'Total Completions',
  time:        'Avg. Handling Time',
  rate:        'CSAT Score',
}

const GROUPBY_LABELS: Record<GroupByType, string> = {
  date:     'By Date / Time',
  survey:   'By Branch',
  category: 'By Department',
  status:   'By Touchpoint',
}

function renderChart(type: WidgetConfig['chartType']) {
  switch (type) {
    case 'line':    return <TrendChart />
    case 'bar':     return <VolumeBarChart />
    case 'pie':     return <DistributionPieChart />
    case 'scatter': return <CompletionScatter />
    case 'radar':   return <PerformanceRadar />
    case 'heatmap': return <ActivityHeatmap />
    default:        return null
  }
}

export function DashboardWidget({
  widget, isEditMode, onMove, onResize, onDuplicate, onDelete,
}: DashboardWidgetProps) {
  // Build a description from the widget's metric + groupBy so each card
  // shows what it's actually measuring (real analytics metadata).
  const description = [
    widget.metric    ? METRIC_LABELS[widget.metric]    : null,
    widget.groupBy   ? GROUPBY_LABELS[widget.groupBy]  : null,
  ].filter(Boolean).join(' · ') || widget.description

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-[12px] border bg-[#FFFFFF] transition-all
        ${isEditMode
          ? 'border-dashed border-[rgba(11, 74, 139,0.4)] ring-1 ring-[rgba(11, 74, 139,0.1)]'
          : 'border-[#E6EDF3] hover:border-[#B0B8C4]'
        }`}
    >
      {isEditMode && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-[6px] border border-[#E6EDF3] bg-[#F5F7FA]/90 p-0.5 backdrop-blur-sm">
          <button
            className="flex h-6 w-6 cursor-grab items-center justify-center rounded-[4px] text-[#B0B8C4]"
            disabled
            aria-label="Drag widget"
          >
            <GripVertical size={12} />
          </button>
          <span className="mx-0.5 h-3 w-px bg-[#E6EDF3]" />
          <button
            className="flex h-6 w-6 items-center justify-center rounded-[4px] text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333]"
            onClick={() => onMove(widget.id, 'left')}
            aria-label="Move left"
          >
            <ArrowLeft size={12} />
          </button>
          <button
            className="flex h-6 w-6 items-center justify-center rounded-[4px] text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333]"
            onClick={() => onMove(widget.id, 'right')}
            aria-label="Move right"
          >
            <ArrowRight size={12} />
          </button>
          <span className="mx-0.5 h-3 w-px bg-[#E6EDF3]" />
          <button
            className="flex h-6 w-6 items-center justify-center rounded-[4px] text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333]"
            onClick={() => onResize(widget.id, 'w', -1)}
            aria-label="Shrink width"
          >
            <Minimize2 size={12} />
          </button>
          <button
            className="flex h-6 w-6 items-center justify-center rounded-[4px] text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333]"
            onClick={() => onResize(widget.id, 'w', 1)}
            aria-label="Grow width"
          >
            <Maximize2 size={12} />
          </button>
          <span className="mx-0.5 h-3 w-px bg-[#E6EDF3]" />
          <button
            className="flex h-6 w-6 items-center justify-center rounded-[4px] text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333]"
            onClick={() => onDuplicate(widget.id)}
            aria-label="Duplicate"
          >
            <Copy size={12} />
          </button>
          <button
            className="flex h-6 w-6 items-center justify-center rounded-[4px] text-[#8A94A6] hover:bg-[rgba(229, 72, 77,0.12)] hover:text-[#E5484D]"
            onClick={() => onDelete(widget.id)}
            aria-label="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      <ChartContainer
        title={widget.title}
        description={description}
        className="flex-1 border-0 shadow-none"
      >
        {renderChart(widget.chartType)}
      </ChartContainer>
    </div>
  )
}
