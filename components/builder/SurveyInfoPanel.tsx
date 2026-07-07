'use client'

import type { SurveyDraft } from '@/lib/builderTypes'
import { useBranches } from '@/lib/hooks/useBranches'
import { useDepartmentNames } from '@/lib/hooks/useDepartments'
import { useTouchpointNames } from '@/lib/hooks/useTouchpoints'

interface Props {
  draft: SurveyDraft
  onChange: (next: Partial<SurveyDraft>) => void
}

const sectionHeaderCls = 'text-[10.5px] font-bold uppercase tracking-widest text-[#0D1B2E] mb-3 mt-6 first:mt-0'
const labelCls = 'block text-[11px] font-bold text-[#333333] mb-1.5'
const inputBase = 'w-full rounded-[8px] border bg-white px-3 py-2 text-[12.5px] font-medium outline-none transition-all focus:ring-2'

export default function SurveyInfoPanel({ draft, onChange }: Props) {
  const BRANCHES = useBranches()
  const DEPARTMENTS = useDepartmentNames()
  const TOUCHPOINTS = useTouchpointNames()
  return (
    <div className="flex flex-col">
      {/* BASIC INFORMATION */}
      <h3 className={sectionHeaderCls}>Basic Information</h3>
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Survey Title <span className="text-red-500">*</span></label>
          <input
            className="w-full rounded-[10px] border text-[13px] font-medium outline-none transition-all focus:border-[#0B4A8B] focus:ring-2 focus:ring-[rgba(11,74,139,0.1)]"
            style={{ borderColor: 'var(--border)', padding: '12px 16px', color: 'var(--text)' }}
            placeholder="e.g. Q3 Customer Satisfaction"
            value={draft.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className={labelCls}>Internal Description</label>
          <textarea
            className="w-full resize-none rounded-[10px] border text-[12px] outline-none transition-all focus:border-[#0B4A8B] focus:ring-2 focus:ring-[rgba(11,74,139,0.1)]"
            style={{ borderColor: 'var(--border)', padding: '12px 16px', color: 'var(--text)' }}
            rows={3}
            placeholder="Briefly describe the purpose..."
            value={draft.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      </div>

      {/* TARGETING */}
      <h3 className={sectionHeaderCls}>Targeting</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Touchpoint */}
        <div>
          <label className={labelCls}>Touchpoint</label>
          <select
            className={inputBase + ' cursor-pointer'}
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            value={draft.touchpoint}
            onChange={(e) => onChange({ touchpoint: e.target.value })}
          >
            <option value="">Select touchpoint…</option>
            {TOUCHPOINTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className={labelCls}>Department</label>
          <select
            className={inputBase + ' cursor-pointer'}
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            value={draft.department}
            onChange={(e) => onChange({ department: e.target.value })}
          >
            <option value="">Select department…</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Branch */}
        <div>
          <label className={labelCls}>Branch</label>
          <select
            className={inputBase + ' cursor-pointer'}
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            value={draft.branch}
            onChange={(e) => onChange({ branch: e.target.value })}
          >
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Visibility */}
        <div>
          <label className={labelCls}>Visibility</label>
          <div className="flex gap-2">
            {(['public', 'private'] as const).map((v) => {
              const active = draft.visibility === v
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ visibility: v })}
                  className="flex-1 rounded-[8px] border text-[12px] font-semibold capitalize transition-all"
                  style={active
                    ? { borderColor: '#EFF6FF', background: '#EFF6FF', color: '#0B4A8B', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                    : { borderColor: 'var(--border)', background: 'transparent', color: '#6B7A90', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                  }
                >
                  {v === 'public' ? '🌐 Public' : '🔒 Private'}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* SCHEDULE */}
      <h3 className={sectionHeaderCls}>Schedule</h3>
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Expiry Date</label>
          <input
            type="date"
            className={inputBase}
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,74,139,0.1)' }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.boxShadow = 'none' }}
            value={draft.expiryDate}
            onChange={(e) => onChange({ expiryDate: e.target.value })}
          />
        </div>
      </div>
      
      {/* Spacer to push completion list down if needed */}
      <div className="mt-8"></div>
    </div>
  )
}
