'use client'

import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import type { SurveyQuestion, QuestionType } from '@/lib/builderTypes'
import { createQuestion } from '@/lib/builderTypes'
import QuestionCard from './QuestionCard'
import QuestionTypePicker from './QuestionTypePicker'

interface Props {
  questions: SurveyQuestion[]
  onChange: (questions: SurveyQuestion[]) => void
}

export default function QuestionList({ questions, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false)
  const dragIdx = useRef<number | null>(null)
  const overIdx = useRef<number | null>(null)

  function addQuestion(type: QuestionType) {
    onChange([...questions, createQuestion(type)])
  }

  function updateQuestion(id: string, q: SurveyQuestion) {
    onChange(questions.map((old) => (old.id === id ? q : old)))
  }

  function duplicateQuestion(idx: number) {
    const q = questions[idx]
    const copy: SurveyQuestion = {
      ...q,
      id: `q_${Date.now()}_copy`,
      options: q.options.map((o) => ({ ...o, id: `opt_${Date.now()}_${o.id}` })),
    }
    const next = [...questions]
    next.splice(idx + 1, 0, copy)
    onChange(next)
  }

  function deleteQuestion(idx: number) {
    onChange(questions.filter((_, i) => i !== idx))
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    const next = [...questions]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    onChange(next)
  }

  function moveDown(idx: number) {
    if (idx === questions.length - 1) return
    const next = [...questions]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    onChange(next)
  }

  // Basic HTML5 drag-and-drop reorder
  function onDragStart(idx: number) { dragIdx.current = idx }
  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    overIdx.current = idx
  }
  function onDrop() {
    if (dragIdx.current === null || overIdx.current === null) return
    if (dragIdx.current === overIdx.current) return
    const next = [...questions]
    const [moved] = next.splice(dragIdx.current, 1)
    next.splice(overIdx.current, 0, moved)
    onChange(next)
    dragIdx.current = null
    overIdx.current = null
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Questions */}
      {questions.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed py-14 text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="text-3xl opacity-30">📋</div>
          <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>No questions yet</div>
          <div className="text-[12px]" style={{ color: 'var(--text-light)' }}>Click the button below to add your first question</div>
        </div>
      ) : (
        questions.map((q, idx) => (
          <div
            key={q.id}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDrop={onDrop}
          >
            <QuestionCard
              question={q}
              index={idx}
              total={questions.length}
              onChange={(next) => updateQuestion(q.id, next)}
              onDuplicate={() => duplicateQuestion(idx)}
              onDelete={() => deleteQuestion(idx)}
              onMoveUp={() => moveUp(idx)}
              onMoveDown={() => moveDown(idx)}
              dragHandleProps={{
                onMouseDown: () => {}, // handled by draggable parent
              }}
            />
          </div>
        ))
      )}

      {/* Add question button */}
      <button
        onClick={() => setShowPicker(true)}
        className="flex items-center justify-center gap-2 rounded-[9px] border border-dashed py-3 text-[12px] font-semibold transition-all"
        style={{ borderColor: 'var(--border)', color: 'var(--text-light)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-light)' }}
      >
        <Plus size={14} />
        Add Question
      </button>

      {showPicker && (
        <QuestionTypePicker
          onPick={addQuestion}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
