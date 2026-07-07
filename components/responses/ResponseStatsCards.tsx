import Card from '@/components/common/Card'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string
  icon?: React.ReactNode
  delay?: number
}

function StatCard({ label, value, sub, accent, icon, delay = 0 }: StatCardProps) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <Card hover className="flex min-h-[140px] flex-col items-center justify-center text-center p-6 gap-3">
        {icon && (
          <div className="mb-1 flex items-center justify-center" style={{ color: accent ?? 'var(--text-muted)' }}>
            {icon}
          </div>
        )}
        <div className="flex flex-col items-center justify-center gap-1 w-full">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-light)' }}>{label}</span>
          <span
            className="tabular text-[32px] font-extrabold leading-tight tracking-[-0.02em]"
            style={{ color: accent ?? 'var(--text)' }}
          >
            {value}
          </span>
        </div>
        {sub && <span className="text-[11px] leading-snug break-words text-center" style={{ color: 'var(--text-light)' }}>{sub}</span>}
      </Card>
    </div>
  )
}

interface Props {
  total: number
  promoters: number
  passives: number
  detractors: number
  nps: number
  avgScore: number
  responseRate: number
}

export default function ResponseStatsCards({ total, promoters, passives, detractors, nps, avgScore, responseRate }: Props) {
  const npsColor = nps >= 50 ? 'var(--emerald)' : nps >= 0 ? 'var(--tint-amber-fg)' : 'var(--red)'

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      <StatCard
        label="Total Responses"
        value={total.toLocaleString()}
        sub="All time"
        delay={0}
      />
      <StatCard
        label="Promoters"
        value={promoters}
        sub={`${Math.round((promoters / total) * 100)}% of total`}
        accent="var(--emerald)"
        delay={40}
      />
      <StatCard
        label="Passives"
        value={passives}
        sub={`${Math.round((passives / total) * 100)}% of total`}
        accent="var(--tint-amber-fg)"
        delay={80}
      />
      <StatCard
        label="Detractors"
        value={detractors}
        sub={`${Math.round((detractors / total) * 100)}% of total`}
        accent="var(--red)"
        delay={120}
      />
      <StatCard
        label="NPS Score"
        value={nps > 0 ? `+${nps}` : nps}
        sub="Promoters minus detractors"
        accent={npsColor}
        delay={160}
      />
      <StatCard
        label="Avg Score"
        value={avgScore}
        sub="Out of 10"
        accent="var(--primary)"
        delay={200}
      />
      <StatCard
        label="Response Rate"
        value={`${responseRate}%`}
        sub="Surveys responded to"
        delay={240}
      />
    </div>
  )
}
