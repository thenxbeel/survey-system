'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from '@/components/common/Button'

interface Chip {
  id: string
  label: string
}

const defaultChips: Chip[] = [
  { id: 'all',    label: 'All Segments' },
  { id: 'claims', label: 'Claims Handling' },
]

export default function ResponseFilters() {
  const [chips, setChips] = useState<Chip[]>(defaultChips)

  function removeChip(id: string) {
    setChips((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="flex items-center justify-between border-b border-[#E6EDF3] px-5 py-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {chips.map((chip) => (
          <span
            key={chip.id}
            className="flex cursor-default items-center justify-center text-center gap-2 rounded-[8px] border border-[#0B4A8B] bg-[rgba(11, 74, 139,0.08)] px-5 py-2 text-[12px] text-[#0B4A8B]"
          >
            {chip.label}
            <button
              onClick={() => removeChip(chip.id)}
              className="text-[12px] opacity-60 hover:opacity-100 px-1"
            >
              ×
            </button>
          </span>
        ))}
        <button className="flex items-center justify-center text-center gap-2.5 rounded-[8px] border border-[#E6EDF3] px-5 py-2 text-[12px] text-[#8A94A6] transition-colors hover:bg-[#F5F7FA] hover:text-[#333333]">
          <Plus size={12} /> Add Filter
        </button>
      </div>
      <Button variant="ghost" className="text-[11px]">Sort: Recent</Button>
    </div>
  )
}
