'use client'

import Badge from '@/components/common/Badge'

export interface ResponseRecord {
  id: string
  surveyId: number
  score: number
  name: string
  company: string
  comment: string
  segment: 'promoter' | 'passive' | 'detractor'
  product: string
  branch: string
  date: string
  assignedToId: number | null
  assignedToName: string | null
  assignedAt: string | null
}

function scoreClass(seg: ResponseRecord['segment']) {
  return {
    promoter:  'bg-[var(--tint-emerald)] text-[var(--emerald)]',
    passive:   'bg-[var(--tint-amber)] text-[var(--tint-amber-fg)]',
    detractor: 'bg-[var(--tint-red)] text-[var(--red)]',
  }[seg]
}

function segLabel(seg: ResponseRecord['segment']) {
  return { promoter: 'Promoter', passive: 'Passive', detractor: 'Detractor' }[seg]
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('')
}

interface Props {
  row: ResponseRecord
  isExpanded: boolean
  onToggle: (id: string) => void
  currentUserId?: number | null
  onAssignClick: (row: ResponseRecord) => void
  onArchiveResponse: (row: ResponseRecord) => void
}

export default function ExpandableResponseRow({ row, isExpanded, onToggle, currentUserId, onAssignClick, onArchiveResponse }: Props) {
  const isAssignedToMe = currentUserId !== null && currentUserId !== undefined && row.assignedToId === currentUserId

  return (
    <>
      <tr
        onClick={() => onToggle(row.id)}
        className="cursor-pointer transition-colors duration-150 last:border-b-0"
        style={{
          borderBottom: '1px solid var(--border)',
          background: isExpanded ? 'var(--bg-subtle)' : 'transparent',
        }}
        onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = 'var(--bg-subtle)' }}
        onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = 'transparent' }}
      >
        {/* Score badge */}
        <td className="px-5 py-3.5">
          <div
            className={`flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-[13px] font-bold tabular ${scoreClass(row.segment)}`}
          >
            {row.score}
          </div>
        </td>

        {/* Respondent */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: '#fff',
              }}
            >
              {initials(row.name)}
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold" style={{ color: 'var(--text)' }}>{row.name}</div>
              <div className="text-[10.5px]" style={{ color: 'var(--text-light)' }}>{row.company}</div>
            </div>
          </div>
        </td>

        {/* Comment (clamped to 2 lines, full text shown when expanded) */}
        <td className="max-w-[320px] px-5 py-3.5">
          <div
            className="line-clamp-2 text-[12px] leading-snug"
            style={{ color: 'var(--text-secondary)' }}
          >
            {row.comment}
          </div>
        </td>

        {/* Segment pill */}
        <td className="px-5 py-3.5">
          <Badge variant={row.segment}>{segLabel(row.segment)}</Badge>
        </td>

        {/* Product */}
        <td className="px-5 py-3.5">
          <div
            className="flex items-center gap-2.5 text-[12px] font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span className="text-[8px]" style={{ color: 'var(--primary)' }}>●</span>
            {row.product}
          </div>
        </td>

        {/* Branch */}
        <td className="px-5 py-3.5 text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          {row.branch}
        </td>

        {/* Date */}
        <td className="whitespace-nowrap px-5 py-3.5 text-[12px] font-medium tabular" style={{ color: 'var(--text-light)' }}>
          {row.date}
        </td>
      </tr>

      {/* Expanded row */}
      {isExpanded && (
        <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
          <td colSpan={7} className="p-0">
            <div
              className="grid grid-cols-[1fr_auto] items-start gap-4 px-5 py-4 pl-[70px]"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div>
                <p className="text-[13px] leading-relaxed italic" style={{ color: 'var(--text)' }}>
                  &ldquo;{row.comment}&rdquo;
                </p>
                <p className="mt-2 text-[11px]" style={{ color: 'var(--text-light)' }}>
                  Score {row.score} · {row.product} · {row.branch} · {row.date} · {row.company}
                </p>
                <div className="mt-3">
                  <span
                    className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em]"
                    style={
                      row.assignedToName
                        ? { borderColor: 'rgba(11,74,139,0.22)', background: 'var(--tint-blue)', color: 'var(--primary)' }
                        : { borderColor: 'var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-light)' }
                    }
                  >
                    {row.assignedToName
                      ? (isAssignedToMe ? 'Assigned to you' : `Assigned to ${row.assignedToName}`)
                      : 'Unassigned'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <button
                    className="flex items-center justify-center text-center rounded-[7px] border bg-white px-4 py-2.5 text-[11px] font-semibold transition-all "
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onAssignClick(row)
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    {isAssignedToMe ? 'Assigned' : 'Assign'}
                  </button>
                  <button
                    className="flex items-center justify-center text-center rounded-[7px] border bg-white px-4 py-2.5 text-[11px] font-semibold transition-all "
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onArchiveResponse(row)
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
