'use client'

import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * SearchInput — shared search input used across dashboard toolbars.
 *
 * Icon spacing follows the enterprise Input spec:
 *   Leading icon:  16px from left (left-4)
 *   Trailing clear: 16px from right (right-4)
 *   Input padding-left:  48px (pl-12) so text never overlaps the leading icon
 *   Input padding-right: 48px (pr-12) so text never overlaps the trailing button
 */
export default function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }: SearchInputProps) {
  return (
    <div 
      className={`group flex items-center gap-2.5 rounded-full bg-white pl-4 pr-2.5 transition-all duration-300 focus-within:ring-4 focus-within:ring-[#0B4A8B]/15 ${className}`}
      style={{ 
        border: '1px solid var(--border)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)'
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <Search 
        size={15} 
        className="flex-shrink-0 text-[var(--text-light)] transition-colors duration-300 group-focus-within:text-[var(--primary)]" 
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[34px] flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-[var(--text-muted)] placeholder:font-normal"
        style={{ color: 'var(--text)' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center rounded-full bg-gray-100/80 text-[var(--text-light)] transition-all duration-200 hover:bg-gray-200 hover:text-[var(--text)] active:scale-95"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}
