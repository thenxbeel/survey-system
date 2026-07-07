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

  const filteredTemplates = FEATURED_TEMPLATES.filter(
    (t) => t.category === selectedCategory
  )

  const handleTemplateClick = (template: SurveyTemplate) => {
    setSelectedTemplateId(template.id)
    // Small delay to show checkmark selection effect before loading template
    setTimeout(() => {
      onSelectTemplate(template)
      setSelectedTemplateId(null)
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative flex h-[90vh] max-h-[700px] w-full max-w-[500px] flex-col rounded-[20px] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ fontFamily: 'var(--font-sans, sans-serif)' }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[20px]">📋</span>
            <h2 className="text-[17px] font-bold text-[#1E293B]">
              Create from featured templates
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Selector */}
        <div className="mb-6 flex gap-2 border-b border-gray-100 pb-4">
          {(['Survey', 'Invitation', 'Registration'] as const).map((category) => {
            const isActive = selectedCategory === category
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all border ${
                  isActive
                    ? 'bg-[#0B4A8B] text-white border-[#0B4A8B] shadow-sm'
                    : 'bg-transparent text-[#6B7A90] border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        {/* Templates Grid Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 pb-4">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.id
              return (
                <div
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="group cursor-pointer flex flex-col gap-2"
                >
                  {/* Card Cover */}
                  <div className="relative overflow-hidden rounded-[12px] border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5">
                    {/* Gradient background with beautiful patterns */}
                    <div className={`relative h-[115px] w-full bg-gradient-to-br ${template.gradient} flex items-end p-2.5 overflow-hidden`}>
                      {/* Abstract light patterns */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,255,255,0.15),transparent_60%)]" />
                      <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-white/10 blur-xl" />
                      <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-black/10 blur-xl" />
                      
                      {/* Decorative SVG grid pattern for a high-tech modern aesthetic */}
                      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id={`grid-${template.id}`} width="12" height="12" patternUnits="userSpaceOnUse">
                            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="white" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#grid-${template.id})`} />
                      </svg>

                      {/* Question count pill on top-right */}
                      <div className="absolute top-2 right-2 z-10 rounded-full bg-white/20 backdrop-blur-md px-2 py-0.5 text-[8.5px] font-bold text-white border border-white/10 tracking-wide uppercase">
                        {template.questions.length} Qs
                      </div>

                      {/* Glassmorphic Inner Mockup Label */}
                      <div className="relative z-10 w-full bg-white/90 backdrop-blur-md rounded-[8px] border border-white/40 p-2 shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-left flex items-center gap-2">
                        <span className="text-[15px] filter drop-shadow-sm flex-shrink-0">
                          {getTemplateEmoji(template.id)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold text-[#0F172A] truncate leading-tight">
                            {template.title}
                          </div>
                          <div className="text-[7.5px] text-[#475569] mt-0.5 leading-normal truncate">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Selected / Hover Overlay */}
                    {isSelected ? (
                      <div className="absolute inset-0 bg-[#0B4A8B]/45 backdrop-blur-[1.5px] flex items-center justify-center transition-all duration-300">
                        <div className="rounded-full bg-white p-1.5 shadow-lg animate-in zoom-in-75 duration-200">
                          <Check className="h-4.5 w-4.5 text-[#0B4A8B] stroke-[3.5px]" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200" />
                    )}
                  </div>

                  {/* Title Label */}
                  <div className="text-[11.5px] font-semibold text-[#1E293B] leading-tight group-hover:text-[#0B4A8B] transition-colors truncate">
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
    case 'corporate-seminar-invite': return '📜'
    case 'team-retreat-invite': return '🏕️'
    case 'webinar-registration': return '🖥️'
    case 'conference-registration': return '🎟️'
    case 'workshop-registration': return '🛠️'
    case 'hackathon-registration': return '💻'
    case 'executive-summit-registration': return '🎖️'
    default: return '📋'
  }
}
