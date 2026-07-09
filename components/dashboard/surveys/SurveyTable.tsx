'use client'

import Card from '@/components/common/Card'
import SurveyToolbar, { type SurveyFilters } from './SurveyToolbar'
import SurveyRow from './SurveyRow'
import SurveyTableSkeleton from './SurveyTableSkeleton'
import SurveyEmptyState from './SurveyEmptyState'
import Pagination from './Pagination'
import type { SurveyRecord } from '@/lib/types/survey'

const COL_HEADERS = ['Survey', 'Status', 'Creator', 'Branch', 'Responses', 'Rate', 'NPS', 'Updated', '']

interface SurveyTableProps {
  surveys: SurveyRecord[]
  loading: boolean
  hasActiveFilters: boolean
  onClearFilters: () => void
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onView: (survey: SurveyRecord) => void
  onEdit: (survey: SurveyRecord) => void
  onDuplicate: (survey: SurveyRecord) => void
  onArchive: (survey: SurveyRecord) => void
  onUnarchive: (survey: SurveyRecord) => void
  onDelete: (survey: SurveyRecord) => void
  onCopyUrl: (survey: SurveyRecord) => void
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  filters: SurveyFilters
  onFiltersChange: (filters: SurveyFilters) => void
  onBulkArchive: () => void
  onBulkDelete: () => void
}

export default function SurveyTable({
  surveys, loading, hasActiveFilters, onClearFilters,
  selectedIds, onToggleSelect, onToggleSelectAll,
  onView, onEdit, onDuplicate, onArchive, onUnarchive, onDelete, onCopyUrl,
  page, totalPages, totalItems, pageSize, onPageChange,
  filters, onFiltersChange, onBulkArchive, onBulkDelete,
}: SurveyTableProps) {
  const allSelected = surveys.length > 0 && surveys.every((s) => selectedIds.has(s.id))

  return (
    <Card noPadding>
      <SurveyToolbar
        filters={filters}
        onFiltersChange={onFiltersChange}
        selectedCount={selectedIds.size}
        onBulkArchive={onBulkArchive}
        onBulkDelete={onBulkDelete}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr>
              <th className="sticky top-0 z-10 border-b px-5 py-3.5" style={{ borderColor: 'var(--border)', background: '#FAFCFE' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  disabled={surveys.length === 0}
                  className="h-3.5 w-3.5 cursor-pointer rounded-sm"
                  style={{ accentColor: 'var(--primary)' }}
                />
              </th>
              {COL_HEADERS.slice(1).map((h) => (
                <th
                  key={h}
                  className="sticky top-0 z-10 whitespace-nowrap border-b px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-light)', background: '#FAFCFE' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {!loading && (
            <tbody>
              {surveys.map((survey) => (
                <SurveyRow
                  key={survey.id}
                  survey={survey}
                  selected={selectedIds.has(survey.id)}
                  onToggleSelect={onToggleSelect}
                  onView={onView}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onArchive={onArchive}
                  onUnarchive={onUnarchive}
                  onDelete={onDelete}
                  onCopyUrl={onCopyUrl}
                />
              ))}
            </tbody>
          )}
        </table>

        {loading && <SurveyTableSkeleton />}
        {!loading && surveys.length === 0 && (
          <SurveyEmptyState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />
        )}
      </div>

      {!loading && surveys.length > 0 && (
        <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={onPageChange} />
      )}
    </Card>
  )
}
