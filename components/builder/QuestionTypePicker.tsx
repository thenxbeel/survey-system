'use client'

import { QUESTION_TYPE_META, type QuestionType } from '@/lib/builderTypes'

interface Props {
  onPick: (type: QuestionType) => void
  onClose: () => void
}

const GROUPS: { label: string; types: QuestionType[] }[] = [
  { label: 'Ratings', types: ['nps'] },
  { label: 'Text', types: ['short_answer', 'long_answer'] },
  { label: 'Choice', types: ['multiple_choice', 'checkbox', 'dropdown', 'yes_no'] },
  { label: 'Contact', types: ['email', 'phone'] },
  { label: 'Date', types: ['date'] },
]

export default function QuestionTypePicker({ onPick, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[480px] rounded-xl border border-[#E6EDF3] bg-[#FFFFFF] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-[14px] font-semibold text-[#333333]">Add Question</div>
            <div className="text-[11px] text-[#8A94A6]">Choose a question type</div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center text-center rounded-[6px] p-2.5 text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Groups */}
        <div className="flex flex-col gap-4">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B0B8C4]">
                {group.label}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {group.types.map((type) => {
                  const meta = QUESTION_TYPE_META[type]
                  return (
                    <button
                      key={type}
                      onClick={() => { onPick(type); onClose() }}
                      className="rounded-[8px] border border-[#E6EDF3] bg-[#F5F7FA] text-left transition-all hover:border-[#0B4A8B] hover:bg-[rgba(11,74,139,0.06)] group"
                      style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}
                    >
                      <span className="text-[18px]">{meta.icon}</span>
                      <div>
                        <div className="text-[12px] font-medium text-[#333333] group-hover:text-[#0B4A8B] transition-colors">
                          {meta.label}
                        </div>
                        <div className="text-[10px] text-[#8A94A6]">{meta.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
