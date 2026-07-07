'use client'

import type { SurveyDraft, SurveyQuestion } from '@/lib/builderTypes'
import { QUESTION_TYPE_META } from '@/lib/builderTypes'
import { Eye, FileText, MapPin, Building2 } from 'lucide-react'

interface Props {
  draft: SurveyDraft
}

function QuestionPreview({ q, idx }: { q: SurveyQuestion; idx: number }) {
  const inputBase =
    'w-full rounded-[10px] border border-[#E6EDF3] bg-[#F8FAFC] px-3 py-2 text-[12px] text-[#4A5568] placeholder:text-[#B0B8C4] outline-none pointer-events-none'

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-start gap-2.5">
        <span className="mt-0.5 text-[11px] font-medium text-[#8A94A6]">{idx + 1}.</span>
        <div className="flex-1">
          <span className="text-[13px] font-medium text-[#333333]">
            {q.title || <span className="text-[#B0B8C4] italic">Untitled question</span>}
          </span>
          {q.required && <span className="ml-1 text-[#E5484D]">*</span>}
          {q.helpText && (
            <p className="mt-0.5 text-[11px] text-[#8A94A6]">{q.helpText}</p>
          )}
        </div>
      </div>

      <div className="ml-4">
        {q.type === 'nps' && (
          <div>
            <div className="flex gap-1 mb-1">
              {Array.from({ length: 11 }, (_, i) => (
                <div key={i} className="flex-1 rounded-[4px] border border-[#E6EDF3] py-1.5 text-center text-[10px] text-[#8A94A6]">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-[#B0B8C4]">
              <span>Not likely</span><span>Extremely likely</span>
            </div>
          </div>
        )}
        {q.type === 'short_answer' && (
          <input className={inputBase} style={{ padding: "12px 16px" }} placeholder="Short answer..." readOnly />
        )}
        {q.type === 'long_answer' && (
          <textarea className={inputBase + ' resize-none'} rows={3} placeholder="Long answer..." readOnly />
        )}
        {q.type === 'yes_no' && (
          <div className="flex gap-2">
            {['Yes', 'No'].map((l) => (
              <div key={l} className="flex-1 rounded-[7px] border border-[#E6EDF3] py-2 text-center text-[12px] text-[#8A94A6]">{l}</div>
            ))}
          </div>
        )}
        {q.type === 'email' && (
          <input className={inputBase} style={{ padding: "12px 16px" }} placeholder="email@example.com" type="email" readOnly />
        )}
        {q.type === 'phone' && (
          <input className={inputBase} style={{ padding: "12px 16px" }} placeholder="+971 50 000 0000" type="tel" readOnly />
        )}
        {q.type === 'date' && (
          <input className={inputBase} style={{ padding: "12px 16px" }} type="date" readOnly />
        )}
        {['multiple_choice', 'checkbox', 'dropdown'].includes(q.type) && q.type !== 'dropdown' && (
          <div className="flex flex-col gap-2">
            {q.options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2 rounded-[6px] border border-[#E6EDF3] px-3 py-2">
                <div className={`h-3.5 w-3.5 flex-shrink-0 border border-[#B0B8C4] ${q.type === 'checkbox' ? 'rounded-[3px]' : 'rounded-full'}`} />
                <span className="text-[12px] text-[#8A94A6]">{opt.label}</span>
              </div>
            ))}
          </div>
        )}
        {q.type === 'dropdown' && (
          <select className={inputBase + ' cursor-pointer'} disabled>
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
      {/* Preview header */}
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-[rgba(11,74,139,0.1)] text-[#0B4A8B]">
          <Eye size={12} />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8FA0B5]">
          Live Preview
        </span>
      </div>

      {/* Preview Content Area */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto pt-4 pb-12">
        
        {!hasContent ? (
          /* Empty State matches target design exactly */
          <div className="relative mt-8 flex w-full max-w-[480px] flex-col items-center rounded-[20px] bg-white px-8 py-12 text-center shadow-[0_8px_32px_rgba(11,74,139,0.06)] border border-[#E6EDF3]">
            <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-[#EFF6FF] text-[#0B4A8B] shadow-inner">
              <FileText size={32} />
            </div>
            <h3 className="mb-2 text-[16px] font-bold text-[#333333]">Your survey preview will appear here</h3>
            <p className="text-[12.5px] leading-relaxed text-[#8FA0B5]">
              Add a title and questions to see how your survey will look to respondents.
            </p>
          </div>
        ) : (
          /* Populated State (floating card) */
          <div className="w-full max-w-[560px] rounded-[16px] border border-[#E6EDF3] bg-white p-8 shadow-sm">
            {/* Survey header */}
            <div className="mb-8 rounded-[12px] bg-[#F9FAFB] p-6 border border-[#F0F4F8]">
              <div className="mb-2 text-[18px] font-bold leading-tight text-[#333333]">
                {draft.title || <span className="text-[#B0B8C4]">Survey Title</span>}
              </div>
              {draft.description && (
                <div className="text-[13px] leading-relaxed text-[#6B7A90]">{draft.description}</div>
              )}
              <div className="mt-4 flex items-center gap-3 text-[11px] font-medium text-[#8FA0B5]">
                {draft.touchpoint && <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm border border-[#E6EDF3]"><MapPin size={12} /> {draft.touchpoint}</span>}
                {draft.branch && <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm border border-[#E6EDF3]"><Building2 size={12} /> {draft.branch}</span>}
              </div>
            </div>

            {/* Questions */}
            {draft.questions.length === 0 ? (
              <div className="py-12 text-center text-[12px] text-[#B0B8C4]">
                Add questions to continueâ€¦
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {draft.questions.map((q, i) => (
                  <QuestionPreview key={q.id} q={q} idx={i} />
                ))}
              </div>
            )}

            {/* Submit button */}
            {draft.questions.length > 0 && (
              <div className="mt-10 border-t border-[#E6EDF3] pt-6">
                <button
                  disabled
                  className="w-full rounded-[10px] bg-[#0B4A8B] text-[13px] font-bold text-white opacity-50 shadow-sm"
                  style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
