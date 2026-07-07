import { ClipboardX, FilterX } from 'lucide-react'

interface SurveyEmptyStateProps {
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export default function SurveyEmptyState({ hasActiveFilters, onClearFilters }: SurveyEmptyStateProps) {
  if (hasActiveFilters) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
          <FilterX size={20} style={{ color: 'var(--text-light)' }} />
        </div>
        <p className="mb-1 text-[13.5px] font-semibold" style={{ color: 'var(--text)' }}>No surveys match your filters</p>
        <p className="mb-5 text-[12.5px]" style={{ color: 'var(--text-light)' }}>Try adjusting your search or filter criteria.</p>
        <button
          onClick={onClearFilters}
          className="flex items-center justify-center text-center rounded-[var(--radius-sm)] border px-6 py-3 text-[12.5px] font-medium transition-colors "
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          Clear filters
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
        <ClipboardX size={20} style={{ color: 'var(--text-light)' }} />
      </div>
      <p className="mb-1 text-[13.5px] font-semibold" style={{ color: 'var(--text)' }}>No surveys yet</p>
      <p className="text-[12.5px]" style={{ color: 'var(--text-light)' }}>Create your first survey to start collecting NPS feedback.</p>
    </div>
  )
}
