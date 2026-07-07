import type { NpsCategory } from '@/lib/types/response'

interface Props {
  score: number | null | undefined
  category?: NpsCategory | null
  size?: 'sm' | 'md'
}

const categoryColors = {
  promoter: {
    bg: 'var(--tint-emerald)',
    border: 'rgba(23,166,115,0.35)',
    text: 'var(--emerald)',
  },
  passive: {
    bg: 'var(--tint-amber)',
    border: 'rgba(245,158,11,0.35)',
    text: 'var(--tint-amber-fg)',
  },
  detractor: {
    bg: 'var(--tint-red)',
    border: 'rgba(229,72,77,0.35)',
    text: 'var(--red)',
  },
  unknown: {
    bg: '#F3F4F6',
    border: '#D1D5DB',
    text: '#6B7280',
  },
} as const

export default function NpsScoreBadge({
  score,
  category,
  size = 'sm',
}: Props) {
  const colors =
    category && category in categoryColors
      ? categoryColors[category]
      : categoryColors.unknown

  const { bg, border, text } = colors

  const sz =
    size === 'sm'
      ? 'h-7 w-7 text-[12px]'
      : 'h-9 w-9 text-[14px]'

  return (
    <div
      className={`tabular flex items-center justify-center rounded-[7px] font-bold ${sz}`}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color: text,
      }}
    >
      {score ?? '-'}
    </div>
  )
}