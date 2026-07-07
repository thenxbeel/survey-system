'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between border-t px-6 py-4" style={{ borderColor: 'var(--border)' }}>
      <span className="text-[11.5px]" style={{ color: 'var(--text-light)' }}>
        {totalItems === 0 ? 'No results' : `Showing ${start}–${end} of ${totalItems}`}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          style={{ color: 'var(--text-light)' }}
          onMouseEnter={(e) => { if (page > 1) { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
        >
          <ChevronLeft size={14} />
        </button>

        <span className="tabular px-2 text-[11.5px]" style={{ color: 'var(--text-light)' }}>
          Page <span style={{ color: 'var(--text)', fontWeight: 600 }}>{Math.min(page, Math.max(totalPages, 1))}</span> of {Math.max(totalPages, 1)}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          style={{ color: 'var(--text-light)' }}
          onMouseEnter={(e) => { if (page < totalPages) { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
