'use client'

import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ActionMenuItem {
  label: string
  icon: LucideIcon
  onSelect: () => void
  danger?: boolean
  divider?: boolean // render a divider above this item
}

interface ActionMenuProps {
  items: ActionMenuItem[]
  align?: 'left' | 'right'
}

export default function ActionMenu({ items, align = 'right' }: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        aria-label="Open actions"
        className="icon-btn !h-7 !w-7"
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`animate-fade-up absolute z-50 mt-1.5 w-44 overflow-hidden rounded-[var(--radius-md)] border bg-white py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow-lg)' }}
        >
          {items.map((item, i) => (
            <div key={item.label}>
              {item.divider && i > 0 && <div className="my-1 h-px" style={{ background: 'var(--border)' }} />}
              <button
                onClick={() => {
                  item.onSelect()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 px-3 py-[7px] text-left text-[12.5px] transition-colors"
                style={item.danger ? { color: 'var(--red)' } : { color: 'var(--text)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = item.danger ? 'var(--tint-red)' : 'var(--bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <item.icon size={13} className="flex-shrink-0" />
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
