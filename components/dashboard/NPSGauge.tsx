'use client'

import { useEffect, useRef, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import GaugeChart from '@/components/charts/GaugeChart'

const TARGET = 49

export default function NPSGauge() {
  const [displayScore, setDisplayScore] = useState(0)
  const animRef = useRef<ReturnType<typeof requestAnimationFrame>>(0)

  useEffect(() => {
    const duration = 800
    const t0 = performance.now()
    function animate(ts: number) {
      const elapsed = ts - t0
      const t       = Math.min(elapsed / duration, 1)
      const ease    = 1 - Math.pow(1 - t, 3)
      setDisplayScore(Math.round(TARGET * ease))
      if (t < 1) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <div className="flex flex-col items-center">
      <GaugeChart score={displayScore} targetScore={TARGET} />
      <div className="mt-[-4px] text-center">
        <div className="text-[64px] font-extrabold leading-none tracking-[-2px] tabular text-[#0B4A8B]">
          {displayScore >= 0 ? `+${displayScore}` : displayScore}
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.06em] text-[#8A94A6]">
          Net Promoter Score
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-1 text-[12px] text-[#17A673]">
          <TrendingUp size={12} />
          +7 from last quarter
        </div>
      </div>
    </div>
  )
}
