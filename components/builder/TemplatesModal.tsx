'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { FEATURED_TEMPLATES } from '@/lib/survey-templates'
import type { SurveyTemplate } from '@/lib/survey-templates'

interface TemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: SurveyTemplate) => void
}

export default function TemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'Survey' | 'Invitation' | 'Registration'>('Survey')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  if (!isOpen) return null

  const filteredTemplates = FEATURED_TEMPLATES.filter((t) => t.category === selectedCategory)

  const handleTemplateClick = (template: SurveyTemplate) => {
    setSelectedTemplateId(template.id)
    setTimeout(() => {
      onSelectTemplate(template)
      setSelectedTemplateId(null)
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative flex h-[90vh] max-h-[700px] w-full max-w-[500px] flex-col rounded-[20px] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        style={{
          fontFamily: 'var(--font-sans, sans-serif)',
          background: 'var(--card)',
          color: 'var(--text)',
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[20px]">📋</span>
            <h2 className="text-[17px] font-bold" style={{ color: 'var(--text)' }}>
              Create from featured templates
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 transition-colors hover:bg-[var(--bg-subtle)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6 flex gap-2 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          {(['Survey', 'Invitation', 'Registration'] as const).map((category) => {
            const isActive = selectedCategory === category
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-all"
                style={{
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {category}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 pb-4">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.id
              return (
                <div
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="group flex cursor-pointer flex-col gap-2"
                >
                  <div
                    className="relative overflow-hidden rounded-[12px] shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <div className={`relative flex h-[115px] w-full items-end overflow-hidden bg-gradient-to-br ${template.gradient} p-2.5`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,255,255,0.15),transparent_60%)]" />
                      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/10 blur-xl" />
                      <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-black/10 blur-xl" />

                      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id={`grid-${template.id}`} width="12" height="12" patternUnits="userSpaceOnUse">
                            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="white" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#grid-${template.id})`} />
                      </svg>

                      <div className="absolute right-2 top-2 z-10 rounded-full border border-white/10 bg-white/20 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
                        {template.questions.length} Qs
                      </div>

                      <div
                        className="relative z-10 flex w-full items-center gap-2 rounded-[8px] p-2 text-left shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md"
                        style={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <span className="flex-shrink-0 text-[15px] filter drop-shadow-sm">
                          {getTemplateEmoji(template.id)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[10px] font-bold leading-tight" style={{ color: 'var(--text)' }}>
                            {template.title}
                          </div>
                          <div className="mt-0.5 truncate text-[7.5px] leading-normal" style={{ color: 'var(--text-secondary)' }}>
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0B4A8B]/45 backdrop-blur-[1.5px] transition-all duration-300">
                        <div className="animate-in zoom-in-75 rounded-full bg-white p-1.5 shadow-lg duration-200">
                          <Check className="h-4.5 w-4.5 stroke-[3.5px] text-[#0B4A8B]" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/5" />
                    )}
                  </div>

                  <div
                    className="truncate text-[11.5px] font-semibold leading-tight transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    {template.title}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function getTemplateEmoji(id: string): string {
  switch (id) {
    case 'employee-satisfaction': return '👥'
    case 'course-evaluation': return '🎓'
    case 'post-event-feedback': return '🎪'
    case 'customer-satisfaction': return '🤝'
    case 'competitive-analysis': return '📊'
    case 'vacation-sick-leave': return '🌴'
    case 'customer-expectations': return '🎯'
    case 'product-pricing': return '🏷️'
    case 'new-product-survey': return '🚀'
    case 'market-research': return '📈'
    case 'manager-feedback': return '💼'
    case 'teacher-feedback': return '🏫'
    case 'vip-event-invitation': return '👑'
    case 'product-launch-invite': return '📱'
    case 'annual-general-meeting': return '🏛️'
    case 'corporate-seminar-invite': return '📝'
    case 'team-retreat-invite': return '🏖️'
    case 'webinar-registration': return '🖥️'
    case 'conference-registration': return '🎟️'
    case 'workshop-registration': return '🛠️'
    case 'hackathon-registration': return '💻'
    case 'executive-summit-registration': return '🎖️'
    default: return '📋'
  }
}
