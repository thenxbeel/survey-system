'use client'

import { Eye, Pencil, Copy, Archive, Trash2, MessageSquareText, Link2, ArchiveRestore, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SurveyStatusBadge from './SurveyStatusBadge'
import ActionMenu, { type ActionMenuItem } from './ActionMenu'
import type { SurveyRecord } from '@/lib/types/survey'

interface SurveyRowProps {
  survey: SurveyRecord
  selected: boolean
  onToggleSelect: (id: string) => void
  onView: (survey: SurveyRecord) => void
  onEdit: (survey: SurveyRecord) => void
  onDuplicate: (survey: SurveyRecord) => void
  onArchive: (survey: SurveyRecord) => void
  onUnarchive: (survey: SurveyRecord) => void
  onDelete: (survey: SurveyRecord) => void
  onCopyUrl: (survey: SurveyRecord) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function npsColor(score: number | null) {
  if (score === null) return 'var(--text-muted)'
  if (score >= 70) return 'var(--emerald)'
  if (score >= 50) return 'var(--primary)'
  if (score >= 0) return 'var(--tint-amber-fg)'
  return 'var(--red)'
}

export default function SurveyRow({
  survey, selected, onToggleSelect, onView, onEdit, onDuplicate, onArchive, onUnarchive, onDelete, onCopyUrl,
}: SurveyRowProps) {
  const router = useRouter()

  const menuItems: ActionMenuItem[] = [
    { label: 'View survey', icon: Eye, onSelect: () => onView(survey) },
    { label: 'Edit survey', icon: Pencil, onSelect: () => onEdit(survey) },
    { label: 'Duplicate', icon: Copy, onSelect: () => onDuplicate(survey) },
  ]

  if (survey.status !== 'draft') {
    const numericId = survey.numericId ?? survey.id.replace(/^SRV-/, '')
    menuItems.push({ label: 'Distribution Info', icon: Share2, onSelect: () => router.push(`/dashboard/surveys/${numericId}/published`), divider: true })
    menuItems.push({ label: 'Copy Survey URL', icon: Link2, onSelect: () => onCopyUrl(survey) })
  }

  if (survey.status === 'archived') {
    menuItems.push({ label: 'Unarchive', icon: ArchiveRestore, onSelect: () => onUnarchive(survey), divider: (survey.status as string) === 'draft' })
  } else {
    menuItems.push({ label: 'Archive', icon: Archive, onSelect: () => onArchive(survey), divider: (survey.status as string) === 'draft' })
  }

  menuItems.push(
    { label: 'Delete', icon: Trash2, onSelect: () => onDelete(survey), danger: true }
  )

  return (
    <tr
      onClick={() => onView(survey)}
      className="cursor-pointer border-b transition-colors duration-100 last:border-b-0"
      style={{ borderColor: 'var(--border)', background: selected ? 'var(--tint-blue)' : 'transparent' }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = '#FAFCFE' }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Checkbox */}
      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(survey.id)}
          className="h-3.5 w-3.5 cursor-pointer rounded-sm"
          style={{ accentColor: 'var(--primary)' }}
        />
      </td>

      {/* Title + id */}
      <td className="px-5 py-3.5">
        <div>
          {survey.status === 'published' && survey.slug ? (
            <a 
              href={`/survey/${survey.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-normal break-words text-[13px] font-medium hover:underline" 
              style={{ color: 'var(--primary)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {survey.title}
            </a>
          ) : (
            <div className="whitespace-normal break-words text-[13px] font-medium" style={{ color: 'var(--text)' }}>
              {survey.title}
            </div>
          )}
          <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--text-light)' }}>{survey.id} · {survey.touchpoint}</div>
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <SurveyStatusBadge status={survey.status} />
      </td>

      {/* Creator */}
      <td className="px-5 py-3.5 text-[12.5px]" style={{ color: 'var(--text-light)' }}>
        {survey.createdByName || 'Unknown'}
      </td>

      {/* Branch */}
      <td className="px-5 py-3.5 text-[12.5px]" style={{ color: 'var(--text-light)' }}>{survey.branch}</td>

      {/* Responses */}
      <td className="px-5 py-3.5">
        <div className="tabular flex items-center gap-2.5 text-[12.5px] font-medium" style={{ color: 'var(--text)' }}>
          <MessageSquareText size={11} style={{ color: 'var(--text-muted)' }} />
          {survey.responseCount.toLocaleString()}
        </div>
      </td>

      {/* Response rate */}
      <td className="tabular px-5 py-3.5 text-[12.5px]" style={{ color: 'var(--text-light)' }}>{survey.responseRate}%</td>

      {/* NPS */}
      <td className="px-5 py-3.5">
        <span
          className="tabular inline-flex h-6 min-w-[30px] items-center justify-center rounded-[6px] px-1.5 text-[12.5px] font-semibold"
          style={{ background: `color-mix(in srgb, ${npsColor(survey.npsScore)} 14%, white)`, color: npsColor(survey.npsScore) }}
        >
          {survey.npsScore ?? '—'}
        </span>
      </td>

      {/* Updated */}
      <td className="whitespace-nowrap px-5 py-3.5 text-[12.5px]" style={{ color: 'var(--text-light)' }}>{formatDate(survey.updatedAt)}</td>

      {/* Actions */}
      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
        <ActionMenu items={menuItems} />
      </td>
    </tr>
  )
}
