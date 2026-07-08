'use client'

import type { SurveyDraft, SurveyQuestion } from '@/lib/builderTypes'
import { Eye, FileText, MapPin, Building2 } from 'lucide-react'

interface Props {
  draft: SurveyDraft
}

function QuestionPreview({ q, idx }: { q: SurveyQuestion; idx: number }) {
  const inputBase =
    'w-full rounded-[10px] border px-3 py-2 text-[12px] outline-none pointer-events-none'

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-start gap-2.5">
        <span className="mt-0.5 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{idx + 1}.</span>
        <div className="flex-1">
          <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
            {q.title || <span className="italic" style={{ color: 'var(--text-muted)' }}>Untitled question</span>}
          </span>
          {q.required && <span className="ml-1 text-[#E5484D]">*</span>}
          {q.helpText && <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>{q.helpText}</p>}
        </div>
      </div>

      <div className="ml-4">
        {q.type === 'nps' && (
          <div>
            <div className="mb-1 flex gap-1">
              {Array.from({ length: 11 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-[4px] border py-1.5 text-center text-[10px]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px]" style={{ color: 'var(--text-muted)' }}>
              <span>Not likely</span>
              <span>Extremely likely</span>
            </div>
          </div>
        )}
        {q.type === 'short_answer' && (
          <input className={inputBase} style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', padding: '12px 16px' }} placeholder="Short answer..." readOnly />
        )}
        {q.type === 'long_answer' && (
          <textarea className={inputBase + ' resize-none'} style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)' }} rows={3} placeholder="Long answer..." readOnly />
        )}
        {q.type === 'yes_no' && (
          <div className="flex gap-2">
            {['Yes', 'No'].map((l) => (
              <div key={l} className="flex-1 rounded-[7px] border py-2 text-center text-[12px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>{l}</div>
            ))}
          </div>
        )}
        {q.type === 'email' && (
          <input className={inputBase} style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', padding: '12px 16px' }} placeholder="email@example.com" type="email" readOnly />
        )}
        {q.type === 'phone' && (
          <input className={inputBase} style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', padding: '12px 16px' }} placeholder="+971 50 000 0000" type="tel" readOnly />
        )}
        {q.type === 'date' && (
          <input className={inputBase} style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', padding: '12px 16px' }} type="date" readOnly />
        )}
        {['multiple_choice', 'checkbox', 'dropdown'].includes(q.type) && q.type !== 'dropdown' && (
          <div className="flex flex-col gap-2">
            {q.options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2 rounded-[6px] border px-3 py-2" style={{ borderColor: 'var(--border)' }}>
                <div className={`h-3.5 w-3.5 flex-shrink-0 border ${q.type === 'checkbox' ? 'rounded-[3px]' : 'rounded-full'}`} style={{ borderColor: 'var(--text-muted)' }} />
                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{opt.label}</span>
              </div>
            ))}
          </div>
        )}
        {q.type === 'dropdown' && (
          <select className={inputBase + ' cursor-pointer'} style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)' }} disabled>
            <option value="">Select an option...</option>
            {q.options.map((opt) => (
              <option key={opt.id}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}

export default function PreviewPanel({ draft }: Props) {
  const hasContent = draft.title || draft.questions.length > 0

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-[rgba(11,74,139,0.1)]" style={{ color: 'var(--primary)' }}>
          <Eye size={12} />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Live Preview
        </span>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-y-auto pb-12 pt-4">
        {!hasContent ? (
          <div className="relative mt-8 flex w-full max-w-[480px] flex-col items-center rounded-[20px] border px-8 py-12 text-center shadow-[0_8px_32px_rgba(11,74,139,0.06)]" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-[20px] shadow-inner" style={{ background: 'var(--tint-blue)', color: 'var(--primary)' }}>
              <FileText size={32} />
            </div>
            <h3 className="mb-2 text-[16px] font-bold" style={{ color: 'var(--text)' }}>Your survey preview will appear here</h3>
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Add a title and questions to see how your survey will look to respondents.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-[560px] rounded-[16px] border p-8 shadow-sm" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            <div className="mb-8 rounded-[12px] border p-6" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
              <div className="mb-2 text-[18px] font-bold leading-tight" style={{ color: 'var(--text)' }}>
                {draft.title || <span style={{ color: 'var(--text-muted)' }}>Survey Title</span>}
              </div>
              {draft.description && (
                <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{draft.description}</div>
              )}
              <div className="mt-4 flex items-center gap-3 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {draft.touchpoint && <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 shadow-sm" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}><MapPin size={12} /> {draft.touchpoint}</span>}
                {draft.branch && <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 shadow-sm" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}><Building2 size={12} /> {draft.branch}</span>}
              </div>
            </div>

            {draft.questions.length === 0 ? (
              <div className="py-12 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Add questions to continue...
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {draft.questions.map((q, i) => (
                  <QuestionPreview key={q.id} q={q} idx={i} />
                ))}
              </div>
            )}

            {draft.questions.length > 0 && (
              <div className="mt-10 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                <button
                  disabled
                  className="w-full rounded-[10px] text-[13px] font-bold text-white opacity-50 shadow-sm"
                  style={{ background: 'var(--primary)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Submit Response
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
