'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, Sparkles, X, BarChart3, GitCompare, TrendingUp, ListOrdered, PieChart as PieIcon, Clock,
} from 'lucide-react'
import { useAnalytics } from '../state/useAnalytics'

// Suggested prompts for the Ask Analytics assistant — these are just UI labels
// that trigger predefined query types. No mock data involved.
const suggestedPrompts = [
  'Show me branch performance',
  'Compare departments',
  'NPS trend over time',
  'Top touchpoints by volume',
  'Response distribution',
  'Response time analysis',
]

type ResultView = 'empty' | 'branch' | 'comparison' | 'trend' | 'touchpoint' | 'department' | 'product'

const branches = [
  { name: 'Abu Dhabi',     score: 88, color: '#17A673' },
  { name: 'Dubai',         score: 82, color: '#0B4A8B' },
  { name: 'Al Ain City',   score: 65, color: '#F5A623' },
  { name: 'Remote/Digital',score: 74, color: '#64748B' },
]

const products = [
  { name: 'Motor Takaful',    score: 88, color: '#17A673' },
  { name: 'Health Takaful',   score: 72, color: '#0B4A8B' },
  { name: 'Family Takaful',   score: 78, color: '#0B4A8B' },
  { name: 'Property Takaful', score: 65, color: '#F5A623' },
  { name: 'Travel Takaful',   score: 55, color: '#E5484D' },
]

const touchpoints = [
  { name: 'Call Center',           score: 2.1 },
  { name: 'Complaint Resolution',  score: 3.4 },
  { name: 'Claims Settlement',     score: 4.5 },
  { name: 'Mobile App',            score: 5.2 },
]

export function AskAnalytics() {
  const { state, dispatch } = useAnalytics()
  const [query, setQuery]   = useState('')
  const [view, setView]     = useState<ResultView>('empty')
  const [isLoading, setLoading] = useState(false)
  const [history, setHistory]   = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const open = state.modals.ask
  if (!open || !mounted) return null

  function close() {
    dispatch({ type: 'CLOSE_MODAL', modal: 'ask' })
  }

  function handleSearch(q: string) {
    setQuery(q)
    if (!q.trim()) { setView('empty'); return }

    setLoading(true)
    setTimeout(() => {
      const lower = q.toLowerCase()
      let matched: ResultView = 'empty'
      if (lower.includes('nps') && lower.includes('branch'))              matched = 'branch'
      else if (lower.includes('compare') && (lower.includes('claims') || lower.includes('renewal'))) matched = 'comparison'
      else if (lower.includes('response') && lower.includes('trend'))     matched = 'trend'
      else if (lower.includes('lowest') && lower.includes('touchpoint'))  matched = 'touchpoint'
      else if (lower.includes('department'))                              matched = 'department'
      else if (lower.includes('product'))                                 matched = 'product'

      setView(matched)
      setLoading(false)
      if (matched !== 'empty' && !history.includes(q)) {
        setHistory([q, ...history].slice(0, 5))
      }
    }, 600)
  }

  function renderResults() {
    if (view === 'empty') {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#E6EDF3] bg-[#F5F7FA]">
            <Search size={16} className="text-[#B0B8C4]" />
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-[#333333]">No matching insights</h4>
            <p className="mt-1 max-w-[300px] text-[11px] text-[#8A94A6]">
              I couldn&apos;t find data for that query. Try asking about branches, departments, products, or trends.
            </p>
          </div>
          <div className="mt-2 w-full max-w-[300px]">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B0B8C4]">Try one of these:</p>
            <div className="flex flex-col gap-1">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSearch(prompt)}
                  className="flex w-full items-center justify-between rounded-[6px] border border-[#E6EDF3] bg-white px-3 py-2 text-left text-[11px] text-[#555555] transition-all hover:border-[#0B4A8B] hover:text-[#0B4A8B]"
                >
                  {prompt}
                  <Sparkles size={12} className="text-[#B0B8C4]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    const ResultCard = ({ icon: Icon, title, subtitle, children }: any) => (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white shadow-sm ring-1 ring-[#E6EDF3]">
            <Icon size={14} className="text-[#0B4A8B]" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-[#333333]">{title}</h3>
            <p className="text-[11px] text-[#8A94A6]">{subtitle}</p>
          </div>
        </div>
        <div className="rounded-[10px] bg-white p-4 shadow-sm ring-1 ring-[#E6EDF3]">
          {children}
        </div>
      </div>
    )

    return (
      <div className="p-4">
        {/* Branch Performance */}
        {view === 'branch' && (
          <ResultCard icon={BarChart3} title="Branch Performance" subtitle="Top performing branches by NPS">
            <div className="space-y-3">
              {branches.map(b => (
                <div key={b.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: b.color }} />
                    <span className="text-[12px] font-medium text-[#333333]">{b.name}</span>
                  </div>
                  <span className="text-[12px] font-bold tabular-nums text-[#333333]">{b.score}</span>
                </div>
              ))}
            </div>
          </ResultCard>
        )}

        {/* Comparison */}
        {view === 'comparison' && (
          <ResultCard icon={GitCompare} title="Department Comparison" subtitle="Claims vs Renewal satisfaction">
            <div className="flex items-end gap-6 pt-2">
              <div className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[20px] font-bold text-[#17A673]">72</span>
                <div className="h-24 w-full rounded-t-[6px] bg-[#17A673]" />
                <span className="text-[11px] font-medium text-[#555555]">Claims</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[20px] font-bold text-[#F5A623]">45</span>
                <div className="h-[60px] w-full rounded-t-[6px] bg-[#F5A623]" />
                <span className="text-[11px] font-medium text-[#555555]">Renewal</span>
              </div>
            </div>
          </ResultCard>
        )}

        {/* Trend */}
        {view === 'trend' && (
          <ResultCard icon={TrendingUp} title="Response Trend" subtitle="Volume over the last 7 days">
            <div className="flex h-24 items-end gap-1">
              {[40, 55, 30, 80, 65, 90, 110].map((val, i) => (
                <div key={i} className="flex-1 rounded-t-[4px] bg-[#0B4A8B]" style={{ height: `${(val/110)*100}%` }} />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-[#8A94A6]">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </ResultCard>
        )}

        {/* Touchpoint */}
        {view === 'touchpoint' && (
          <ResultCard icon={ListOrdered} title="Lowest Performing Touchpoints" subtitle="By average rating (out of 10)">
            <div className="space-y-3">
              {touchpoints.map(t => (
                <div key={t.name} className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#333333]">{t.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#F5F7FA]">
                      <div className="h-full bg-[#E5484D]" style={{ width: `${(t.score/10)*100}%` }} />
                    </div>
                    <span className="w-6 text-right text-[12px] font-bold tabular-nums text-[#E5484D]">{t.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>
        )}

        {/* Department */}
        {view === 'department' && (
          <ResultCard icon={PieIcon} title="Department Distribution" subtitle="Share of total responses">
            <div className="flex items-center gap-6">
              <div className="relative h-20 w-20 rounded-full border-[8px] border-[#0B4A8B] border-r-[#17A673] border-t-[#F5A623]">
                <div className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-white" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px]"><span className="h-2 w-2 rounded-[2px] bg-[#0B4A8B]" />Customer Support <span className="font-medium text-[#333333]">60%</span></div>
                <div className="flex items-center gap-2 text-[11px]"><span className="h-2 w-2 rounded-[2px] bg-[#17A673]" />Sales <span className="font-medium text-[#333333]">25%</span></div>
                <div className="flex items-center gap-2 text-[11px]"><span className="h-2 w-2 rounded-[2px] bg-[#F5A623]" />Underwriting <span className="font-medium text-[#333333]">15%</span></div>
              </div>
            </div>
          </ResultCard>
        )}

        {/* Product */}
        {view === 'product' && (
          <ResultCard icon={BarChart3} title="Product Performance" subtitle="CSAT score by Takaful product">
            <div className="space-y-2.5">
              {products.map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-32 text-[11px] text-[#8A94A6]">{p.name}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F5F7FA]">
                    <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: p.color }} />
                  </div>
                  <span className="w-7 text-right text-[11px] font-semibold tabular-nums text-[#333333]">{p.score}%</span>
                </div>
              ))}
            </div>
          </ResultCard>
        )}
      </div>
    )
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-[8vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-[640px] overflow-hidden rounded-[12px] border border-[#E6EDF3] bg-[#F5F7FA] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6EDF3] px-4 py-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[rgba(11, 74, 139,0.12)]">
              <Sparkles size={14} className="text-[#0B4A8B]" />
            </div>
            <h2 className="text-[14px] font-semibold text-[#333333]">Ask Analytics</h2>
          </div>
          <button
            onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#8A94A6] transition-all hover:bg-[#F5F7FA] hover:text-[#333333]"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-[#E6EDF3] p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B8C4]" />
            <input
              placeholder="Ask a question about your data… (e.g., 'Show NPS by branch')"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
              className="w-full rounded-[8px] border border-[#E6EDF3] bg-white py-2.5 pl-9 pr-3 text-[13px] text-[#333333] outline-none transition-all placeholder:text-[#B0B8C4] focus:border-[#0B4A8B] focus:ring-2 focus:ring-[rgba(11,74,139,0.1)]"
              autoFocus
            />
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] min-h-[280px] overflow-y-auto p-3">
          {!query && (
            <div className="space-y-3 py-2">
              {/* Recent */}
              {history.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B0B8C4]">Recent</p>
                  <div className="flex flex-col gap-1">
                    {history.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(h)}
                        className="flex items-center gap-2 rounded-[6px] px-6 py-3 text-left text-[11px] text-[#8A94A6] transition-all hover:bg-[#F5F7FA] hover:text-[#333333]"
                      >
                        <Clock size={11} className="text-[#B0B8C4]" />
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Suggested */}
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B0B8C4]">Suggested Questions</p>
                <div className="flex flex-col gap-1">
                  {suggestedPrompts.map(p => (
                    <button
                      key={p}
                      onClick={() => handleSearch(p)}
                      className="rounded-[6px] border border-[#E6EDF3] bg-[#FFFFFF] px-3 py-2 text-left text-[12px] text-[#8A94A6] transition-all hover:border-[#B0B8C4] hover:text-[#333333]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {query && isLoading && (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0B4A8B] border-t-transparent" />
              <p className="text-[11px] text-[#8A94A6]">Analyzing data…</p>
            </div>
          )}

          {query && !isLoading && renderResults()}
        </div>

        {/* Footer hint */}
        <div className="border-t border-[#E6EDF3] px-6 py-3 text-[10px] text-[#B0B8C4]">
          <kbd className="rounded-[3px] border border-[#E6EDF3] bg-[#F5F7FA] px-1 py-0.5 font-mono text-[9px] text-[#8A94A6]">Esc</kbd>{' '}
          to close · results are illustrative (mock data)
        </div>
      </div>
    </div>,
    document.body
  )
}

function ResultCard({
  icon: Icon, title, subtitle, children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[10px] border border-[#E6EDF3] bg-[#FFFFFF] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={14} className="text-[#0B4A8B]" />
        <div>
          <h4 className="text-[12px] font-semibold text-[#333333]">{title}</h4>
          <p className="text-[10px] text-[#8A94A6]">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
