'use client'

import { ArrowRight, Star } from 'lucide-react'

interface ResponseRow {
  id: string
  respondent: string
  survey: string
  branch: string
  score: number
  band: 'promoter' | 'passive' | 'detractor'
  date: string
}

const RESPONSES: ResponseRow[] = [
  { id: 'RSP-2026-0184', respondent: 'Ahmed Al Mansouri', survey: 'Q3 Branch Experience', branch: 'Abu Dhabi Mall', score: 9, band: 'promoter', date: '2 Jul 2026' },
  { id: 'RSP-2026-0183', respondent: 'Sarah Chen', survey: 'Service Touchpoint NPS', branch: 'Dubai Marina', score: 4, band: 'detractor', date: '1 Jul 2026' },
  { id: 'RSP-2026-0182', respondent: 'Priya Sharma', survey: 'Onboarding Feedback', branch: 'Head Office', score: 8, band: 'passive', date: '1 Jul 2026' },
  { id: 'RSP-2026-0181', respondent: "James O'Brien", survey: 'Q3 Branch Experience', branch: 'Sharjah City', score: 3, band: 'detractor', date: '30 Jun 2026' },
  { id: 'RSP-2026-0180', respondent: 'Lin Wei', survey: 'Digital Banking NPS', branch: 'Abu Dhabi Mall', score: 10, band: 'promoter', date: '30 Jun 2026' },
]

const BAND_CONFIG = {
  promoter: { label: 'Promoter', cls: 'rs-pill-green' },
  passive: { label: 'Passive', cls: 'rs-pill-amber' },
  detractor: { label: 'Detractor', cls: 'rs-pill-red' },
} as const

export default function RecentResponsesTable() {
  return (
    <div className="rs-data-card overflow-hidden !p-0">
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent Responses</h3>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-light)' }}>Latest survey feedback</p>
        </div>
        <button className="flex items-center justify-center text-center gap-2.5 rounded-[9px] px-6 py-3 text-xs font-semibold transition-colors hover:bg-[#F8FAFC]" style={{ color: 'var(--primary)' }}>
          View all <ArrowRight size={13} />
        </button>
      </div>
      <div className="overflow-x-auto rs-scroll">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: '#FAFBFC' }}>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Respondent</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider md:table-cell" style={{ color: 'var(--text-light)' }}>Survey</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider lg:table-cell" style={{ color: 'var(--text-light)' }}>Branch</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Band</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sm:table-cell" style={{ color: 'var(--text-light)' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {RESPONSES.map((r) => {
              const cfg = BAND_CONFIG[r.band]
              return (
                <tr key={r.id} className="rs-row-hover" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <td className="px-6 py-3.5">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{r.respondent}</p>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--text-light)' }}>{r.id}</p>
                  </td>
                  <td className="hidden px-4 py-3.5 text-xs md:table-cell" style={{ color: 'var(--text-secondary)' }}>{r.survey}</td>
                  <td className="hidden px-4 py-3.5 text-xs lg:table-cell" style={{ color: 'var(--text-secondary)' }}>{r.branch}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="rs-num inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      <Star size={12} className={r.band === 'promoter' ? 'text-green-500' : r.band === 'detractor' ? 'text-red-500' : 'text-amber-500'} fill="currentColor" />
                      {r.score}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><span className={`rs-pill ${cfg.cls}`}>{cfg.label}</span></td>
                  <td className="hidden px-4 py-3.5 text-xs sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{r.date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}