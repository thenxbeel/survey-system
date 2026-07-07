'use client'

import { AdntcLogo } from '@/components/common/AdntcLogo'

/**
 * ADNTC brand lockup for the login screen.
 * Logo + "CX PLATFORM" tagline — centered on the blue panel.
 */
export default function Logo() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="group relative mb-6 flex items-center justify-center transition-transform duration-500 hover:scale-105">
        <div
          className="absolute inset-0 z-0 opacity-50 blur-[48px] transition-opacity duration-500 group-hover:opacity-80"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, transparent 65%)',
            transform: 'scale(1.5)',
          }}
        />
        <AdntcLogo
          variant="login"
          className="relative z-10 !h-[100px] drop-shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
        />
      </div>
      <div className="text-[13px] font-semibold uppercase tracking-[0.32em] text-white/55">
        C X &nbsp; P L A T F O R M
      </div>
    </div>
  )
}
