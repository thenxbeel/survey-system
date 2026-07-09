'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Pencil, Copy, Archive, Trash2, Send, Link2,
  Users, MessageSquareText, Gauge, Calendar, MapPin, Eye, EyeOff, ArchiveRestore,
} from 'lucide-react'
import Button from '@/components/common/Button'
import SurveyStatusBadge from './SurveyStatusBadge'
import type { SurveyRecord } from '@/lib/types/survey'

interface SurveyDetailDrawerProps {
  survey: SurveyRecord | null
  onClose: () => void
  onEdit: (survey: SurveyRecord) => void
  onDuplicate: (survey: SurveyRecord) => void
  onArchive: (survey: SurveyRecord) => void
  onUnarchive: (survey: SurveyRecord) => void
  onDelete: (survey: SurveyRecord) => void
  onCopyUrl?: (survey: SurveyRecord) => void
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatBlock({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[var(--radius-sm)] p-3" style={{ background: 'var(--bg-subtle)' }}>
      <div className="flex items-center gap-2.5" style={{ color: 'var(--text-light)' }}>
        <Icon size={12} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em]">{label}</span>
      </div>
      <span className="tabular text-[18px] font-bold" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

export default function SurveyDetailDrawer({
  survey, onClose, onEdit, onDuplicate, onArchive, onUnarchive, onDelete, onCopyUrl,
}: SurveyDetailDrawerProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {survey && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onClose()
            }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[420px] flex-col border-l bg-white"
            style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow-xl)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
              <div className="min-w-0 pr-3">
                <div className="mb-1.5 text-[11px] font-medium" style={{ color: 'var(--text-light)' }}>{survey.id}</div>
                <h2 className="line-clamp-2 text-[16px] font-bold leading-tight" style={{ color: 'var(--text)' }}>{survey.title}</h2>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                aria-label="Close drawer"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-light)] hover:bg-neutral-100 hover:text-[var(--text)] transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mb-5 flex items-center gap-2">
                <SurveyStatusBadge status={survey.status} />
                <span
                  className="flex items-center gap-1 rounded-[var(--radius-xs)] border px-2 py-0.5 text-[11px]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-light)' }}
                >
                  {survey.visibility === 'public' ? <Eye size={11} /> : <EyeOff size={11} />}
                  {survey.visibility === 'public' ? 'Public' : 'Private'}
                </span>
              </div>

              <p className="mb-5 text-[13px] leading-[1.55]" style={{ color: 'var(--text-secondary)' }}>{survey.description}</p>

              <div className="mb-5 grid grid-cols-2 gap-2.5">
                <StatBlock icon={MessageSquareText} label="Responses" value={survey.responseCount.toLocaleString()} />
                <StatBlock icon={Users} label="Response Rate" value={`${survey.responseRate}%`} />
                <StatBlock icon={Gauge} label="NPS Score" value={survey.npsScore !== null ? String(survey.npsScore) : '—'} />
                <StatBlock icon={MessageSquareText} label="Questions" value={String(survey.questionCount)} />
              </div>

              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--text-muted)' }}>Details</div>
              <div className="divide-y rounded-[var(--radius-sm)] border" style={{ borderColor: 'var(--border)' }}>
                <DetailRow icon={MapPin} label="Branch" value={survey.branch} />
                <DetailRow icon={Send} label="Touchpoint" value={survey.touchpoint} />
                <DetailRow icon={Calendar} label="Created" value={`${formatDate(survey.createdAt)} · ${survey.createdBy}`} />
                <DetailRow icon={Calendar} label="Last Updated" value={formatDate(survey.updatedAt)} />
                <DetailRow icon={Calendar} label="Expires" value={formatDate(survey.expiryDate)} />
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-2 border-t px-6 py-4" style={{ borderColor: 'var(--border)' }}>
              <Button variant="primary" className="flex-1 justify-center" onClick={() => onEdit(survey)}>
                <Pencil size={12} />
                Edit Survey
              </Button>
              {onCopyUrl && survey.status !== 'draft' && (
                <Button variant="ghost" onClick={() => onCopyUrl(survey)} aria-label="Copy survey URL" title="Copy Survey URL">
                  <Link2 size={12} />
                </Button>
              )}
              <Button variant="ghost" onClick={() => onDuplicate(survey)} aria-label="Duplicate survey">
                <Copy size={12} />
              </Button>
              {survey.status === 'archived' ? (
                <Button variant="ghost" onClick={() => onUnarchive(survey)} aria-label="Unarchive survey">
                  <ArchiveRestore size={12} />
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => onArchive(survey)} aria-label="Archive survey">
                  <Archive size={12} />
                </Button>
              )}
              <Button
                variant="ghost"
                style={{ borderColor: 'rgba(229,72,77,0.3)', color: 'var(--red)' }}
                onClick={() => onDelete(survey)}
                aria-label="Delete survey"
              >
                <Trash2 size={12} />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-light)' }}>
        <Icon size={12} />
        {label}
      </div>
      <span className="text-[12px] font-medium" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}
