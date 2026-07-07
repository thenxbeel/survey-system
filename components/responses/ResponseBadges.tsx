import type { ResponseStatus, Sentiment } from '@/lib/types/response'

// ─── Response Status ──────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ResponseStatus, { bg: string; border: string; color: string }> = {
  new: { bg: 'var(--tint-blue)', border: 'rgba(11,74,139,0.3)', color: 'var(--primary)' },
  reviewed: { bg: 'var(--tint-amber)', border: 'rgba(245,158,11,0.3)', color: 'var(--tint-amber-fg)' },
  actioned: { bg: 'var(--tint-emerald)', border: 'rgba(23,166,115,0.3)', color: 'var(--emerald)' },
  closed: { bg: 'var(--bg-subtle)', border: 'var(--border-strong)', color: 'var(--text-secondary)' },
  solved: { bg: 'var(--tint-emerald)', border: 'rgba(23,166,115,0.3)', color: 'var(--emerald)' },
}

const STATUS_LABELS: Record<ResponseStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  actioned: 'Actioned',
  closed: 'Closed',
  solved: 'Solved',
}

const FALLBACK_STYLE = { bg: 'var(--bg-subtle)', border: 'var(--border-strong)', color: 'var(--text-secondary)' }

interface StatusProps { status: ResponseStatus }
export function ResponseStatusBadge({ status }: StatusProps) {
  const s = STATUS_STYLE[status] ?? FALLBACK_STYLE
  return (
    <span
      className="inline-flex items-center rounded-[5px] border px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: s.bg, borderColor: s.border, color: s.color }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

// ─── Sentiment ───────────────────────────────────────────────────────────────

const SENTIMENT_CONFIG: Record<Sentiment, { label: string; icon: string; color: string }> = {
  positive: { label: 'Positive', icon: '↑', color: 'var(--emerald)' },
  neutral: { label: 'Neutral', icon: '→', color: 'var(--tint-amber-fg)' },
  negative: { label: 'Negative', icon: '↓', color: 'var(--red)' },
}

interface SentimentProps { sentiment: Sentiment }
export function SentimentBadge({ sentiment }: SentimentProps) {
  const { label, icon, color } = SENTIMENT_CONFIG[sentiment]
  return (
    <span className="flex items-center gap-1 text-[12.5px] font-semibold" style={{ color }}>
      <span>{icon}</span>
      {label}
    </span>
  )
}
