'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Icons from 'lucide-react'
import {
  Sparkles, FileText, Calendar, ChevronDown, BarChart3, Loader2, Check,
  Wand2,
} from 'lucide-react'
import {
  REPORT_TEMPLATES, REPORT_TYPES, REPORT_FORMATS, SCHEDULE_FREQS, PERIODS,
  REPORT_BRANCHES, REPORT_DEPARTMENTS, DEFAULT_QUICK_CONFIG,
  type ReportTemplate, type QuickReportConfig, type ReportFormat, type ScheduleFreq, type SavedReport,
} from '@/lib/types/report'
import { useBranches } from '@/lib/hooks/useBranches'
import { useDepartmentNames } from '@/lib/hooks/useDepartments'

function resolveIcon(name: string): Icons.LucideIcon {
  return (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? FileText
}

const CATEGORY_LABELS: Record<ReportTemplate['category'], { label: string; color: string }> = {
  executive:  { label: 'Executive',  color: '#0B4A8B' },
  operational:{ label: 'Operational',color: '#F5A623' },
  analytics:  { label: 'Analytics',  color: '#17A673' },
  customer:   { label: 'Customer',   color: '#7C3AED' },
}

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
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={selectCls}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--text-light)' }}
      />
    </div>
  )
}

interface Props {
  onGenerate: (config: QuickReportConfig) => void
  onSchedule: (config: QuickReportConfig, freq: ScheduleFreq) => void
  savedReports?: SavedReport[]
}

export function QuickReportGenerator({ onGenerate, onSchedule, savedReports = [] }: Props) {
  const [config, setConfig] = useState<QuickReportConfig>(DEFAULT_QUICK_CONFIG)
  const [selectedTpl, setSelectedTpl] = useState<ReportTemplate | null>(REPORT_TEMPLATES[0])
  const [generating, setGenerating] = useState(false)
  const [scheduleFreq, setScheduleFreq] = useState<ScheduleFreq>('weekly')
  const [showSchedulePanel, setShowSchedulePanel] = useState(false)

  const liveBranches = useBranches()
  const liveDepts = useDepartmentNames()

  const branchOptions = liveBranches.map(b => ({
    value: b === 'All Branches' ? 'All' : b,
    label: b
  }))

  const deptOptions = [
    { value: 'All', label: 'All Departments' },
    ...liveDepts.map(d => ({ value: d, label: d }))
  ]

  function patch<K extends keyof QuickReportConfig>(key: K, value: QuickReportConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  function selectTemplate(tpl: ReportTemplate) {
    setSelectedTpl(tpl)
    patch('type', tpl.type)
    patch('format', tpl.defaultFormat)
  }

  function handleGenerate() {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      onGenerate(config)
    }, 1200)
  }

  function handleSchedule() {
    onSchedule(config, scheduleFreq)
    setShowSchedulePanel(false)
  }

  return (
    <div
      className="rounded-[18px] bg-white p-8"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[28px] w-[28px] items-center justify-center rounded-[9px]"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
              color: '#fff',
            }}
          >
            <Sparkles size={14} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-[14.5px] font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}>
              Quick Report Generator
            </h2>
            <p className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>
              Pick a template, configure parameters, generate or schedule
            </p>
          </div>
        </div>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TEMPLATES.map((tpl, idx) => {
          const Icon = resolveIcon(tpl.icon)
          const active = selectedTpl?.id === tpl.id
          const catCfg = CATEGORY_LABELS[tpl.category]
          return (
            <motion.button
              key={tpl.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2 }}
              onClick={() => selectTemplate(tpl)}
              className="group flex items-start gap-2.5 rounded-[12px] border p-3 text-left transition-all"
              style={active
                ? { background: 'var(--tint-blue)', borderColor: 'rgba(11,74,139,0.3)' }
                : { background: 'white', borderColor: 'var(--border)' }
              }
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.borderColor = 'var(--border-strong)'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <div
                className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] transition-all"
                style={active
                  ? { background: 'rgba(11,74,139,0.15)', color: 'var(--primary)' }
                  : { background: 'var(--bg-subtle)', color: 'var(--text-light)' }
                }
              >
                <Icon size={14} strokeWidth={2.1} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="truncate text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>{tpl.name}</span>
                </div>
                <div className="mt-0.5 line-clamp-2 text-[10.5px]" style={{ color: 'var(--text-secondary)' }}>{tpl.description}</div>
                <div className="mt-1.5 flex items-center gap-2.5">
                  <span
                    className="inline-flex items-center rounded-[4px] border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em]"
                    style={{ borderColor: `${catCfg.color}40`, color: catCfg.color, background: `${catCfg.color}1A` }}
                  >
                    {catCfg.label}
                  </span>
                  <span className="text-[9.5px] font-medium" style={{ color: 'var(--text-muted)' }}>· {tpl.estimatedTime}</span>
                  <span className="text-[9.5px] font-medium" style={{ color: 'var(--text-muted)' }}>· {tpl.runCount} runs</span>
                </div>
              </div>
              {active && (
                <div
                  className="flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  <Check size={11} strokeWidth={2.5} />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Configuration */}
      <AnimatePresence>
        {selectedTpl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className="mt-4 rounded-[12px] p-4"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-light)' }}>
                Configuration
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Field label="Report Type">
                  <NativeSelect
                    value={config.type}
                    onChange={v => patch('type', v as QuickReportConfig['type'])}
                    options={REPORT_TYPES.map(t => ({ value: t.value, label: t.label }))}
                  />
                </Field>
                <Field label="Period">
                  <NativeSelect
                    value={config.period}
                    onChange={v => patch('period', v)}
                    options={PERIODS.map(p => ({ value: p.value, label: p.label }))}
                  />
                </Field>
                <Field label="Branch">
                  <NativeSelect
                    value={config.branch}
                    onChange={v => patch('branch', v)}
                    options={branchOptions}
                  />
                </Field>
                <Field label="Department">
                  <NativeSelect
                    value={config.department}
                    onChange={v => patch('department', v)}
                    options={deptOptions}
                  />
                </Field>
                <Field label="Format" className="md:col-span-2">
                  <div className="flex gap-2.5">
                    {REPORT_FORMATS.filter(f => f.value !== 'excel').map(f => {
                      const Icon = resolveIcon(f.icon)
                      const active = config.format === f.value
                      return (
                        <button
                          key={f.value}
                          onClick={() => patch('format', f.value as ReportFormat)}
                          className="flex h-[34px] flex-1 items-center justify-center gap-2.5 rounded-[8px] border text-[10.5px] font-semibold transition-all"
                          style={active
                            ? { background: 'var(--tint-blue)', borderColor: 'rgba(11,74,139,0.3)', color: 'var(--primary)' }
                            : { background: 'white', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
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
                              e.currentTarget.style.color = 'var(--text-secondary)'
                            }
                          }}
                          title={f.label}
                        >
                          <Icon size={12} strokeWidth={2.2} style={{ color: active ? 'var(--primary)' : f.color }} />
                          {f.label}
                        </button>
                      )
                    })}
                  </div>
                </Field>
                <Field label="Options" className="md:col-span-2">
                  <div className="flex flex-col gap-2.5">
                    <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={config.includeCharts} onChange={e => patch('includeCharts', e.target.checked)} className="h-3.5 w-3.5 cursor-pointer accent-[var(--primary)]" />
                      Include charts
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={config.includeRawData} onChange={e => patch('includeRawData', e.target.checked)} className="h-3.5 w-3.5 cursor-pointer accent-[var(--primary)]" />
                      Include raw data
                    </label>
                  </div>
                </Field>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <div className="text-[10.5px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  <Calendar size={10} className="mr-1 inline" strokeWidth={2.1} />
                  Last run {(() => {
                    const last = savedReports.find(r => r.type === selectedTpl.type)
                    const dateVal = last ? last.generatedAt : selectedTpl.lastGenerated
                    const nameVal = last ? last.generatedBy : selectedTpl.lastGeneratedBy
                    return `${new Date(dateVal).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' })} · by ${nameVal}`
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSchedulePanel(s => !s)}
                    className="inline-flex h-[34px] items-center gap-2.5 rounded-[9px] border bg-white px-3 text-[11.5px] font-semibold transition-all"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    <Calendar size={12} strokeWidth={2.1} /> Schedule
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="inline-flex h-[34px] items-center gap-2.5 rounded-[9px] px-3 text-[11.5px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 items-center justify-center text-center"
                    style={{ background: 'var(--primary)' }}
                  >
                    {generating
                      ? <><Loader2 size={12} className="animate-spin" /> Generating…</>
                      : <><BarChart3 size={12} strokeWidth={2.2} /> Generate Now</>
                    }
                  </button>
                </div>
              </div>

              {/* Schedule panel */}
              <AnimatePresence>
                {showSchedulePanel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-3 rounded-[10px] p-3"
                      style={{
                        background: 'var(--tint-blue)',
                        border: '1px solid rgba(11,74,139,0.25)',
                      }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Wand2 size={12} style={{ color: 'var(--primary)' }} strokeWidth={2.1} />
                        <span className="text-[11.5px] font-bold" style={{ color: 'var(--text)' }}>Schedule Recurring Report</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {SCHEDULE_FREQS.map(f => (
                          <button
                            key={f.value}
                            onClick={() => setScheduleFreq(f.value)}
                            className="inline-flex h-[28px] items-center rounded-[6px] border px-2.5 text-[11px] font-semibold capitalize transition-all"
                            style={scheduleFreq === f.value
                              ? { background: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff' }
                              : { background: 'white', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                            }
                            onMouseEnter={(e) => {
                              if (scheduleFreq !== f.value) {
                                e.currentTarget.style.borderColor = 'var(--border-strong)'
                                e.currentTarget.style.color = 'var(--text)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (scheduleFreq !== f.value) {
                                e.currentTarget.style.borderColor = 'var(--border)'
                                e.currentTarget.style.color = 'var(--text-secondary)'
                              }
                            }}
                          >
                            {f.label}
                          </button>
                        ))}
                        <div className="flex-1" />
                        <button
                          onClick={() => setShowSchedulePanel(false)}
                          className="inline-flex h-[28px] items-center rounded-[6px] border bg-white px-2.5 text-[10.5px] font-semibold transition-all"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSchedule}
                          className="inline-flex h-[28px] items-center rounded-[6px] px-2.5 text-[10.5px] font-semibold text-white transition-all hover:opacity-90 items-center justify-center text-center"
                          style={{ background: 'var(--primary)' }}
                        >
                          Schedule
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-light)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
