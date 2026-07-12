'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Mail, Phone, MapPin, FileText, Clock,
  MessageSquare, CheckCircle2, Eye, UserPlus, GitBranch,
} from 'lucide-react'
import type { ResponseRecord, TimelineEvent } from '@/lib/types/response'
import NpsScoreBadge from './NpsScoreBadge'
import { ResponseStatusBadge, SentimentBadge } from './ResponseBadges'

// ─── Timeline icon ────────────────────────────────────────────────────────────

function TimelineIcon({ type }: { type: TimelineEvent['type'] }) {
  const cls = 'h-6 w-6 flex items-center justify-center rounded-full border flex-shrink-0'
  switch (type) {
    case 'submitted':
      return <div className={cls} style={{ borderColor: 'rgba(11,74,139,0.4)', background: 'var(--tint-blue)', color: 'var(--primary)' }}><FileText size={11} /></div>
    case 'reviewed':
      return <div className={cls} style={{ borderColor: 'rgba(245,158,11,0.4)', background: 'var(--tint-amber)', color: 'var(--tint-amber-fg)' }}><Eye size={11} /></div>
    case 'assigned':
      return <div className={cls} style={{ borderColor: 'rgba(11,74,139,0.4)', background: 'var(--tint-blue)', color: 'var(--primary)' }}><UserPlus size={11} /></div>
    case 'note':
      return <div className={cls} style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-light)' }}><MessageSquare size={11} /></div>
    case 'resolved':
      return <div className={cls} style={{ borderColor: 'rgba(23,166,115,0.4)', background: 'var(--tint-emerald)', color: 'var(--emerald)' }}><CheckCircle2 size={11} /></div>
  }
}

// ─── NPS Scale visual ─────────────────────────────────────────────────────────

function NpsScaleVisual({ score }: { score: number }) {
  return (
    <div>
      <div className="flex gap-0.5">
        {Array.from({ length: 11 }, (_, i) => {
          const isActive = i === score
          const color = i <= 6 ? 'var(--red)' : i <= 8 ? 'var(--tint-amber-fg)' : 'var(--emerald)'
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="flex h-7 w-full items-center justify-center rounded-[5px] text-[10px] font-semibold transition-all"
                style={{
                  background: isActive ? color : 'var(--bg-subtle)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  boxShadow: isActive ? `0 0 0 1px ${color}` : undefined,
                }}
              >
                {i}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
        <span>Not likely</span>
        <span>Extremely likely</span>
      </div>
    </div>
  )
}

// ─── Answer renderer ──────────────────────────────────────────────────────────

function AnswerBlock({ answer }: { answer: ResponseRecord['answers'][0] }) {
  const val = Array.isArray(answer.answer) ? answer.answer.join(', ') : String(answer.answer)
  if (answer.questionType === 'nps') return null // rendered separately
  return (
    <div className="rounded-[var(--radius-sm)] p-3" style={{ background: 'var(--bg-subtle)' }}>
      <div className="mb-1.5 text-[11px]" style={{ color: 'var(--text-light)' }}>{answer.questionTitle}</div>
      <div className="text-[13px]" style={{ color: 'var(--text)' }}>{val}</div>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span style={{ color: 'var(--text-light)' }}>{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--text-light)' }}>{label}</span>
    </div>
  )
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface Props {
  response: ResponseRecord | null
  onClose: () => void
}

export default function ResponseDetailDrawer({ response, onClose }: Props) {
  const [fullResponse, setFullResponse] = useState<ResponseRecord | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Fetch full response details (answers, device info) when a response is opened
  useEffect(() => {
    if (!response) {
      setFullResponse(null)
      return
    }
    setFullResponse(response) // show the summary immediately
    const numericId = response.id.replace(/^RSP-/, '')
    fetch(`/api/responses/${numericId}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const d = json.data
        const ri = d.responseInfo ?? {}
        const si = d.surveyInfo ?? {}
        const score = ri.npsScore ?? 0
        const cat = (ri.npsCategory as any) ?? (score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor')
        const sent: any = score >= 9 ? 'positive' : score >= 7 ? 'neutral' : 'negative'
        const enriched: ResponseRecord = {
          ...response,
          customerName: d.respondentName || 'Anonymous',
          customerEmail: d.respondentEmail || '',
          customerPhone: d.respondentPhone || undefined,
          surveyTitle: si.surveyName ?? response.surveyTitle,
          npsScore: ri.npsScore ?? 0,
          npsCategory: cat,
          sentiment: sent,
          status: (d.status as any) ?? response.status,
          comments: ri.feedback ?? response.comments,
          answers: (d.answers ?? []).map((a: any, i: number) => ({
            questionId: String(a.questionId),
            questionTitle: a.question,
            questionType: a.type,
            answer: a.answer,
          })),
        }
        setFullResponse(enriched)
      })
      .catch(() => { /* keep the summary version */ })
  }, [response])

  const displayResponse = fullResponse ?? response
  const isOpen = !!response

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-AE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <AnimatePresence>
      {isOpen && displayResponse && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onClose()
            }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-[520px] flex-col border-l bg-white"
            style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow-xl)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-light)' }}
                >
                  {displayResponse.customerName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>{displayResponse.customerName}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-light)' }}>Response {displayResponse.id}</div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                aria-label="Close drawer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-light)] hover:bg-neutral-100 hover:text-[var(--text)] transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* NPS hero */}
              <div className="border-b px-6 py-6" style={{ borderColor: 'var(--border)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <NpsScoreBadge score={displayResponse.npsScore} category={displayResponse.npsCategory} size="md" />
                    <div>
                      <div className="text-[12.5px] font-medium capitalize" style={{ color: 'var(--text)' }}>{displayResponse.npsCategory}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-light)' }}>NPS Score</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SentimentBadge sentiment={displayResponse.sentiment} />
                    <ResponseStatusBadge status={displayResponse.status} />
                  </div>
                </div>
                <NpsScaleVisual score={displayResponse.npsScore} />
              </div>

              {/* Customer info */}
              <div className="border-b px-6 py-6" style={{ borderColor: 'var(--border)' }}>
                <SectionHeader icon={<Mail size={13} />} label="Respondent Information" />
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5 text-[12.5px]">
                    <Mail size={12} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <a href={`mailto:${displayResponse.customerEmail}`} style={{ color: 'var(--primary)' }} className="hover:underline">
                      {displayResponse.customerEmail}
                    </a>
                  </div>
                  {displayResponse.customerPhone && (
                    <div className="flex items-center gap-2.5 text-[12.5px]">
                      <Phone size={12} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text)' }}>{displayResponse.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-[12.5px]">
                    <MapPin size={12} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text)' }}>{displayResponse.branch}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[12.5px]">
                    <GitBranch size={12} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text)' }}>{displayResponse.department}</span>
                  </div>
                </div>
              </div>

              {/* Survey info */}
              <div className="border-b px-6 py-6" style={{ borderColor: 'var(--border)' }}>
                <SectionHeader icon={<FileText size={13} />} label="Survey Information" />
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px]" style={{ color: 'var(--text-light)' }}>Survey</span>
                    <span className="text-right text-[12.5px]" style={{ color: 'var(--text)' }}>{displayResponse.surveyTitle}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px]" style={{ color: 'var(--text-light)' }}>Touchpoint</span>
                    <span className="text-right text-[12.5px]" style={{ color: 'var(--text)' }}>{displayResponse.touchpoint}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px]" style={{ color: 'var(--text-light)' }}>Submitted</span>
                    <span className="text-right text-[12.5px]" style={{ color: 'var(--text)' }}>{formatDate(displayResponse.submittedAt)}</span>
                  </div>
                  {displayResponse.assignedTo && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[11px]" style={{ color: 'var(--text-light)' }}>Assigned To</span>
                      <span className="text-right text-[12.5px]" style={{ color: 'var(--text)' }}>{displayResponse.assignedTo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Answers */}
              {displayResponse.answers.filter((a) => a.questionType !== 'nps').length > 0 && (
                <div className="border-b px-6 py-6" style={{ borderColor: 'var(--border)' }}>
                  <SectionHeader icon={<MessageSquare size={13} />} label="Answers" />
                  <div className="flex flex-col gap-2">
                    {displayResponse.answers.filter((a) => a.questionType !== 'nps').map((a) => (
                      <AnswerBlock key={a.questionId} answer={a} />
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {displayResponse.comments && (
                <div className="border-b px-6 py-6" style={{ borderColor: 'var(--border)' }}>
                  <SectionHeader icon={<MessageSquare size={13} />} label="Comments" />
                  <div
                    className="rounded-[var(--radius-sm)] p-3 text-[13px] italic leading-relaxed"
                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
                  >
                    &ldquo;{displayResponse.comments}&rdquo;
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="px-6 py-6">
                <SectionHeader icon={<Clock size={13} />} label="Timeline" />
                <div className="flex flex-col gap-0">
                  {displayResponse.timeline.map((ev, idx) => (
                    <div key={ev.id} className="flex gap-3">
                      {/* icon + line */}
                      <div className="flex flex-col items-center">
                        <TimelineIcon type={ev.type} />
                        {idx < displayResponse.timeline.length - 1 && (
                          <div className="mt-1 min-h-[20px] w-px flex-1" style={{ background: 'var(--border)' }} />
                        )}
                      </div>
                      {/* content */}
                      <div className="min-w-0 pb-5 pt-0.5">
                        <div className="text-[12.5px]" style={{ color: 'var(--text)' }}>{ev.label}</div>
                        <div className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {ev.by && <span>{ev.by} · </span>}
                          {formatDate(ev.at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
