import NPSGauge from './NPSGauge'
import SparklineChart from '@/components/charts/SparklineChart'

const segments = [
  { label: 'Promoters',  pct: '64%', pctNum: 64, count: '1,820 responses', color: '#17A673', bg: '#ECFDF5' },
  { label: 'Passives',   pct: '21%', pctNum: 21, count: '598 responses',   color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Detractors', pct: '15%', pctNum: 15, count: '429 responses',   color: '#E5484D', bg: '#FEF2F2' },
]

const sparkData = [178, 203, 241, 219, 258, 245, 271, 237, 263, 280, 249, 237]

export default function Hero() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[22px] bg-white md:flex-row"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
    >
      {/* Gauge — stacks above segments on mobile, sits left on md+ */}
      <div
        className="flex flex-col items-center justify-center border-b p-8 md:flex-[0_0_240px] md:border-b-0 md:border-r"
        style={{
          background: 'linear-gradient(145deg, #F8FBFF 0%, #EEF5FF 100%)',
          borderColor: 'var(--border)',
        }}
      >
        <NPSGauge />
      </div>

      {/* Segments */}
      <div
        className="flex flex-1 flex-col justify-center gap-3.5 border-b p-8 md:border-b-0 md:border-r"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-light)' }}>
          Score Breakdown
        </div>
        {segments.map(({ label, pct, pctNum, count, color, bg }) => (
          <div key={label} className="flex items-center gap-4">
            <div
              className="flex h-[38px] w-[44px] flex-shrink-0 items-center justify-center rounded-[11px] text-[11.5px] font-bold"
              style={{ background: bg, color }}
            >
              {pct}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{label}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-light)' }}>{count}</div>
            </div>
            <div className="hidden w-[80px] xl:block">
              <div className="h-[5px] w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-subtle)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: pct, background: color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Volume */}
      <div className="flex flex-1 flex-col justify-center gap-4 p-8">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-light)' }}>
          Response Volume
        </div>
        <SparklineChart data={sparkData} />
        <div className="flex gap-8">
          <div>
            <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--text-light)' }}>
              Avg / Week
            </div>
            <div className="text-[26px] font-extrabold tabular" style={{ color: 'var(--text)', letterSpacing: '-0.025em' }}>237</div>
          </div>
          <div>
            <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--text-light)' }}>
              Last Survey
            </div>
            <div className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>Jun 12</div>
            <div className="text-[11px]" style={{ color: 'var(--text-light)' }}>Claims + Renewals</div>
          </div>
        </div>
      </div>
    </div>
  )
}
