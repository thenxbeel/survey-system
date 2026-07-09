'use client'

import { useState } from 'react'
import {
  LineChart as LineIcon, BarChart3, PieChart as PieIcon, Grid3x3, Radar as RadarIcon,
  Wand2, Eye, Download, Loader2, Check, Plus, X, ChevronDown,
} from 'lucide-react'
import { ChartContainer } from '@/components/analytics/charts/ChartContainer'
import { ChartTooltip } from '@/components/analytics/charts/ChartTooltip'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useEffect } from 'react'
import {
  reportRoleDistribution, reportHeatmapData,
  PERIODS,
} from '@/lib/types/report'

type ChartType = 'trend' | 'bar' | 'pie' | 'heatmap' | 'radar'

const CHART_OPTIONS: { value: ChartType; label: string; icon: React.ElementType }[] = [
  { value: 'trend',   label: 'Trend',   icon: LineIcon  },
  { value: 'bar',     label: 'Bar',     icon: BarChart3 },
  { value: 'pie',     label: 'Pie',     icon: PieIcon   },
  { value: 'radar',   label: 'Radar',   icon: RadarIcon },
  { value: 'heatmap', label: 'Heatmap', icon: Grid3x3   },
]

const METRIC_OPTIONS = [
  { value: 'nps',        label: 'NPS Score'        },
  { value: 'responses',  label: 'Response Count'   },
  { value: 'csat',       label: 'CSAT %'           },
  { value: 'resolution', label: 'Resolution Time'  },
]

const GROUP_BY_OPTIONS = [
  { value: 'branch',     label: 'By Branch'       },
  { value: 'department', label: 'By Department'   },
  { value: 'time',       label: 'By Time Period'  },
  { value: 'touchpoint', label: 'By Touchpoint'   },
]

const COLORS = ['#0B4A8B', '#17A673', '#F5A623', '#E5484D', '#7C3AED', '#0A84FF', '#64D2FF']

const selectCls =
  'h-[34px] w-full appearance-none rounded-[9px] border border-[var(--border)] bg-white pl-3 pr-9 text-[12px] font-medium text-[var(--text)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(11,74,139,0.1)] cursor-pointer'

function NativeSelect({
  value, onChange, options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-light)' }} />
    </div>
  )
}

function renderChart(type: ChartType, metric: string, groupBy: string, period: string, data: any[]) {
  let xKey = ''
  let dKey = ''
  
  if (groupBy === 'branch') {
    xKey = 'branchName'
    dKey = metric === 'responses' ? 'responseCount' : 'nps'
  } else if (groupBy === 'department') {
    xKey = 'department'
    dKey = metric === 'responses' ? 'responseCount' : 'nps'
  } else if (groupBy === 'touchpoint') {
    xKey = 'touchpoint'
    dKey = metric === 'responses' ? 'responseCount' : 'nps'
  } else {
    // time
    xKey = 'date'
    dKey = metric === 'responses' ? 'responses' : 'npsScore'
  }

  const name = METRIC_OPTIONS.find(m => m.value === metric)?.label || 'Value'

  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-[12px] text-gray-500">No data available</div>
  }

  switch (type) {
    case 'trend':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="cb-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B4A8B" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#0B4A8B" stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
            <XAxis dataKey={xKey} tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={6} />
            <YAxis orientation="right" tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(138, 148, 166, 0.2)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey={dKey} name={name} stroke="#0B4A8B" strokeWidth={2.2} fill="url(#cb-trend)" dot={{ r: 3, fill: '#0B4A8B', stroke: '#FFFFFF', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#0B4A8B', stroke: '#FFFFFF', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      )
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid horizontal={false} stroke="rgba(138, 148, 166, 0.12)" strokeDasharray="" />
            <XAxis type="number" tick={{ fill: '#8FA0B5', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xKey} tick={{ fill: '#4A5568', fontSize: 11, fontFamily: 'Inter', fontWeight: 500 }} axisLine={false} tickLine={false} width={90} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }} />
            <Bar dataKey={dKey} name={name} radius={[0, 5, 5, 0]} barSize={18}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )
    case 'pie':
      const pieData = data.map((d, i) => ({ label: d[xKey], value: Math.max(0, d[dKey] || 0), color: COLORS[i % COLORS.length] }))
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius="58%" outerRadius="85%" paddingAngle={3} stroke="none" isAnimationActive>
              {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip content={<ChartTooltip valueFormatter={v => `${v}`} />} cursor={{ fill: 'rgba(138, 148, 166, 0.10)' }} />
          </PieChart>
        </ResponsiveContainer>
      )
    case 'radar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="rgba(138, 148, 166, 0.18)" />
            <PolarAngleAxis dataKey={xKey} tick={{ fill: '#4A5568', fontSize: 10.5, fontFamily: 'Inter', fontWeight: 500 }} />
            <Tooltip content={<ChartTooltip valueFormatter={v => `${v} ${name}`} />} cursor={{ stroke: 'rgba(138, 148, 166, 0.15)' }} />
            <Radar name={name} dataKey={dKey} stroke="#0B4A8B" strokeWidth={2} fill="#0B4A8B" fillOpacity={0.25} dot={{ r: 3, fill: '#0B4A8B', stroke: '#FFFFFF', strokeWidth: 2 }} />
          </RadarChart>
        </ResponsiveContainer>
      )
    case 'heatmap':
      return null
  }
}

interface Props {
  onSave?: (config: { name: string; chartType: ChartType; metric: string; groupBy: string; period: string }) => Promise<void> | void
  onExport?: (config: { name: string; chartType: ChartType; metric: string; groupBy: string; period: string }) => void
  onNotify?: (n: { type: 'success' | 'info' | 'warning'; title: string; message: string }) => void
}

export function CustomReportBuilder({ onSave, onExport, onNotify }: Props) {
  const [chartType, setChartType] = useState<ChartType>('trend')
  const [reportName, setReportName] = useState('Custom NPS Analysis')
  const [metric, setMetric] = useState('nps')
  const [groupBy, setGroupBy] = useState('time')
  const [period, setPeriod] = useState('30d')
  const [generating, setGenerating] = useState(false)
  
  const [liveData, setLiveData] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    setLoadingData(true)
    if (groupBy === 'time') {
      const groupPeriod = (period === '7d' || period === '30d') ? 'daily' : (period === 'all' || period === '1y' || period === 'ytd') ? 'monthly' : 'weekly'
      fetch(`/api/analytics/trends?range=${period}&period=${groupPeriod}`, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (json?.data) {
            setLiveData(json.data)
          } else {
            setLiveData([])
          }
        })
        .finally(() => setLoadingData(false))
    } else {
      fetch(`/api/analytics/overview?period=${period}`, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (json?.data) {
            if (groupBy === 'branch') {
              setLiveData(json.data.branchPerformance || [])
            } else if (groupBy === 'department') {
              const mapped = (json.data.employeePerformance || []).map((e: any) => ({
                department: e.department || e.employeeName || 'Unknown',
                nps: e.nps,
                responseCount: e.responseCount
              }))
              setLiveData(mapped)
            } else if (groupBy === 'touchpoint') {
              setLiveData(json.data.surveyPerformance || [])
            }
          } else {
            setLiveData([])
          }
        })
        .finally(() => setLoadingData(false))
    }
  }, [groupBy, period])

  async function handleGenerate() {
    setGenerating(true)
    try {
      await onSave?.({
        name: reportName,
        chartType,
        metric,
        groupBy,
        period,
      })
    } catch {
      onNotify?.({ type: 'warning', title: 'Save failed', message: 'Could not save report to library.' })
    } finally {
      setGenerating(false)
    }
  }

  function handleExport() {
    onExport?.({
      name: reportName,
      chartType,
      metric,
      groupBy,
      period,
    })
  }

  return (
    <div
      className="rounded-[18px] bg-white p-8"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[28px] w-[28px] items-center justify-center rounded-[9px]"
            style={{ background: 'var(--tint-purple)', color: '#7C3AED' }}
          >
            <Wand2 size={14} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-[14.5px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>
              Custom Report Builder
            </h2>
            <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>
              Configure chart type, metric, group-by — preview live — export or save
            </p>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex h-[34px] items-center gap-2.5 rounded-[9px] border bg-white px-3 text-[11.5px] font-semibold transition-all items-center justify-center text-center"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <Download size={12} strokeWidth={2.1} /> Export PDF
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex h-[34px] items-center gap-2.5 rounded-[9px] px-3 text-[11.5px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 items-center justify-center text-center"
            style={{ background: 'var(--primary)' }}
          >
            {generating
              ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
              : <><Check size={12} strokeWidth={2.2} /> Save to Library</>
            }
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Config */}
        <div className="space-y-4">
          <Field label="Report Name">
            <input
              value={reportName}
              onChange={e => setReportName(e.target.value)}
              className="h-[36px] w-full rounded-[9px] border bg-white px-3 text-[12px] font-medium outline-none transition-all focus:ring-2"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,74,139,0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </Field>

          <Field label="Chart Type">
            <div className="grid grid-cols-5 gap-2.5">
              {CHART_OPTIONS.map(opt => {
                const Icon = opt.icon
                const active = chartType === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setChartType(opt.value)}
                    className="flex flex-col items-center gap-1 rounded-[9px] border p-2 transition-all"
                    style={active
                      ? { background: 'var(--tint-blue)', borderColor: 'rgba(11,74,139,0.3)', color: 'var(--primary)' }
                      : { background: 'white', borderColor: 'var(--border)', color: 'var(--text-light)' }
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = 'var(--border-strong)'
                        e.currentTarget.style.color = 'var(--text)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--text-light)'
                      }
                    }}
                  >
                    <Icon size={14} strokeWidth={2.1} />
                    <span className="text-[10px] font-semibold">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Metric">
              <NativeSelect value={metric} onChange={setMetric} options={METRIC_OPTIONS} />
            </Field>
            <Field label="Group By">
              <NativeSelect value={groupBy} onChange={setGroupBy} options={GROUP_BY_OPTIONS} />
            </Field>
          </div>

          <Field label="Period">
            <NativeSelect value={period} onChange={setPeriod} options={PERIODS.map(p => ({ value: p.value, label: p.label }))} />
          </Field>
        </div>

        {/* Preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-light)' }}>
              Live Preview
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
              <Eye size={10} strokeWidth={2.1} /> {CHART_OPTIONS.find(c => c.value === chartType)?.label}
            </span>
          </div>
          <ChartContainer
            title={reportName}
            description={`${METRIC_OPTIONS.find(m => m.value === metric)?.label} · ${GROUP_BY_OPTIONS.find(g => g.value === groupBy)?.label} · ${PERIODS.find(p => p.value === period)?.label}`}
            className="h-full"
          >
            {chartType === 'heatmap' ? (
              <ReportHeatmapInline />
            ) : loadingData ? (
              <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : (
              renderChart(chartType, metric, groupBy, period, liveData)
            )}
          </ChartContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
        <div className="text-[10.5px] font-medium text-right" style={{ color: 'var(--text-muted)' }}>
          {liveData.length} data points
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-light)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// Inline heatmap renderer for the Custom Report Builder preview
function ReportHeatmapInline() {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const HOURS = Array.from({ length: 24 }, (_, i) => i)
  function cellColor(value: number): string {
    switch (value) {
      case 0:  return 'var(--bg-subtle)'
      case 1:  return 'rgba(11, 74, 139, 0.20)'
      case 2:  return 'rgba(11, 74, 139, 0.40)'
      case 3:  return 'rgba(11, 74, 139, 0.65)'
      default: return '#0B4A8B'
    }
  }
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex flex-1 gap-2.5">
        <div className="flex w-7 flex-col justify-around text-[9px] font-semibold" style={{ color: 'var(--text-light)' }}>
          {DAYS.map(d => <span key={d} className="text-right">{d}</span>)}
        </div>
        <div className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]">
          {DAYS.map((_, dIdx) =>
            HOURS.map(h => {
              const point = reportHeatmapData.find(p => p.day === dIdx.toString() && p.hour === h.toString())
              const value = point?.value ?? 0
              return (
                <div
                  key={`${dIdx}-${h}`}
                  className="rounded-[2px] transition-transform hover:scale-110 hover:ring-1"
                  style={{ background: cellColor(value), '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                  title={`Value: ${value}`}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
