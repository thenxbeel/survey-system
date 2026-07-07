'use client'

import { useState } from 'react'
import { GripVertical, Copy, Trash2, ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import type { SurveyQuestion } from '@/lib/builderTypes'
import { QUESTION_TYPE_META } from '@/lib/builderTypes'

interface Props {
  question: SurveyQuestion
  index: number
  total: number
  onChange: (q: SurveyQuestion) => void
  onDuplicate: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

const inputCls =
  'w-full rounded-[7px] border border-[#E6EDF3] bg-[#F5F7FA] px-3 py-2 text-[13px] text-[#333333] placeholder:text-[#B0B8C4] outline-none focus:border-[#0B4A8B] transition-colors'

export default function QuestionCard({
  question, index, total, onChange, onDuplicate, onDelete, onMoveUp, onMoveDown, dragHandleProps,
}: Props) {
  const [expanded, setExpanded] = useState(true)
  const meta = QUESTION_TYPE_META[question.type]
  const hasOptions = ['multiple_choice', 'checkbox', 'dropdown'].includes(question.type)

  function updateOption(optId: string, label: string) {
    onChange({
      ...question,
      options: question.options.map((o) => o.id === optId ? { ...o, label } : o),
    })
  }

  function addOption() {
    const id = `opt_${Date.now()}`
    onChange({ ...question, options: [...question.options, { id, label: `Option ${question.options.length + 1}` }] })
  }

  function removeOption(optId: string) {
    if (question.options.length <= 2) return
    onChange({ ...question, options: question.options.filter((o) => o.id !== optId) })
  }

  return (
    <div className="group rounded-xl border border-[#E6EDF3] bg-[#FFFFFF] transition-all hover:border-[#B0B8C4]">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab text-[#B0B8C4] hover:text-[#8A94A6] transition-colors flex-shrink-0"
          title="Drag to reorder"
        >
          <GripVertical size={15} />
        </div>

        {/* Index + type badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F5F7FA] text-[10px] font-semibold text-[#8A94A6]">
            {index + 1}
          </span>
          <span className="flex items-center gap-1 rounded-[5px] border border-[#E6EDF3] bg-[#F5F7FA] px-2 py-0.5 text-[10px] text-[#8A94A6]">
            {meta.icon} {meta.label}
          </span>
        </div>

        {/* Title preview */}
        <div className="flex-1 min-w-0" spellCheck={false} data-ms-editor="false">
          <span className="block truncate text-[13px] text-[#333333]">
            {question.title || <span className="text-[#B0B8C4]">Untitled question</span>}
          </span>
        </div>

        {/* Required badge */}
        {question.required && (
          <span className="flex-shrink-0 rounded-[4px] border border-[rgba(11, 74, 139,0.4)] bg-[rgba(11, 74, 139,0.1)] px-1.5 py-0.5 text-[10px] text-[#0B4A8B]">
            Required
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="flex items-center justify-center text-center rounded p-1 text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333] disabled:opacity-20 transition-all "
            title="Move up"
          >
            <ChevronUp size={13} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="flex items-center justify-center text-center rounded p-1 text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333] disabled:opacity-20 transition-all "
            title="Move down"
          >
            <ChevronDown size={13} />
          </button>
          <button
            onClick={onDuplicate}
            className="flex items-center justify-center text-center rounded p-1 text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333] transition-all "
            title="Duplicate"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center text-center rounded p-1 text-[#8A94A6] hover:bg-[rgba(229, 72, 77,0.1)] hover:text-[#E5484D] transition-all "
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 rounded p-1 text-[#8A94A6] hover:bg-[#F5F7FA] hover:text-[#333333] transition-all"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-[#E6EDF3] px-4 pb-4 pt-4 flex flex-col gap-4">
          {/* Question title */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.07em] text-[#8A94A6]">
              Question *
            </label>
            <input
              className={inputCls}
              placeholder="Type your question here…"
              value={question.title}
              onChange={(e) => onChange({ ...question, title: e.target.value })}
            />
          </div>

          {/* Help text */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.07em] text-[#8A94A6]">
              Help Text
            </label>
            <input
              className={inputCls}
              placeholder="Optional hint shown below the question…"
              value={question.helpText}
              onChange={(e) => onChange({ ...question, helpText: e.target.value })}
            />
          </div>

          {/* NPS preview */}
          {question.type === 'nps' && (
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.07em] text-[#8A94A6]">
                Scale Preview
              </label>
              <div className="flex gap-1">
                {Array.from({ length: 11 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-[5px] border border-[#E6EDF3] py-1.5 text-center text-[11px] text-[#8A94A6]"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-[#B0B8C4]">
                <span>Not at all likely</span>
                <span>Extremely likely</span>
              </div>
            </div>
          )}

          {/* Yes/No preview */}
          {question.type === 'yes_no' && (
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.07em] text-[#8A94A6]">
                Options Preview
              </label>
              <div className="flex gap-2">
                {['Yes', 'No'].map((label) => (
                  <div
                    key={label}
                    className="flex-1 rounded-[7px] border border-[#E6EDF3] py-2 text-center text-[12px] text-[#8A94A6]"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options (choice types) */}
          {hasOptions && (
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.07em] text-[#8A94A6]">
                Options
              </label>
              <div className="flex flex-col gap-2">
                {question.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-[#B0B8C4]" />
                    <input
                      className={inputCls + ' flex-1'}
                      value={opt.label}
                      onChange={(e) => updateOption(opt.id, e.target.value)}
                      placeholder="Option label…"
                    />
                    <button
                      onClick={() => removeOption(opt.id)}
                      disabled={question.options.length <= 2}
                      className="flex-shrink-0 rounded p-1 text-[#B0B8C4] hover:text-[#E5484D] disabled:opacity-30 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="rounded-[6px] border border-dashed border-[#E6EDF3] text-[11px] text-[#8A94A6] hover:border-[#0B4A8B] hover:text-[#0B4A8B] transition-colors"
                  style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <Plus size={12} /> Add option
                </button>
              </div>
            </div>
          )}

          {/* Required toggle */}
          <div className="flex items-center justify-between rounded-[8px] border border-[#E6EDF3] bg-[#F5F7FA] px-3 py-2.5">
            <div>
              <div className="text-[12px] font-medium text-[#333333]">Required</div>
              <div className="text-[11px] text-[#8A94A6]">Respondents must answer this question</div>
            </div>
            <button
              onClick={() => onChange({ ...question, required: !question.required })}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                question.required ? 'bg-[#0B4A8B]' : 'bg-[#E6EDF3]'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  question.required ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
