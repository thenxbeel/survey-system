import type { SurveyStatus } from '@/lib/types/survey'

interface SurveyStatusBadgeProps {
  status: SurveyStatus | string
  className?: string
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  active:     { label: 'Active',     color: 'var(--emerald)', bg: 'var(--tint-emerald)' },
  draft:      { label: 'Draft',      color: 'var(--tint-amber-fg)', bg: 'var(--tint-amber)' },
  closed:     { label: 'Closed',     color: 'var(--text-secondary)', bg: 'var(--bg-subtle)' },
  archived:   { label: 'Archived',   color: 'var(--primary)', bg: 'var(--tint-blue)' },
  scheduled:  { label: 'Scheduled',  color: 'var(--tint-amber-fg)', bg: 'var(--tint-amber)' },
  expired:    { label: 'Expired',    color: 'var(--red)', bg: 'var(--tint-red)' },
  published:  { label: 'Published',  color: 'var(--emerald)', bg: 'var(--tint-emerald)' },
}

export default function SurveyStatusBadge({ status, className = '' }: SurveyStatusBadgeProps) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft
  return (
    <span
      className={`badge inline-flex items-center gap-2.5 ${className}`}
      style={{ color: s.color, background: s.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}
