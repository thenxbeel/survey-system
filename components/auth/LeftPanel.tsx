'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import Logo from './Logo'
import LoginCard from './LoginCard'

/**
 * ADNTC CX Platform — Full-screen brand panel.
 * Deep blue gradient background + Islamic geometric pattern + Abu Dhabi skyline silhouette.
 * Centers the brand block and a glass card vertically and horizontally.
 *
 * Reused by both /login (renders <LoginCard />) and /register (renders <RegisterCard />).
 * Pass `children` to override the default <LoginCard />.
 */
export default function LeftPanel({ children }: { children?: ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-6 text-white"
      style={{ background: 'linear-gradient(165deg, #0B4A8B 0%, #06386F 55%, #04254e 100%)' }}
    >
      {/* Ambient radial glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 70% 60% at 50% 10%, rgba(11,107,196,0.28) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 50% at 15% 85%, rgba(6,56,111,0.45) 0%, transparent 60%)',
            'radial-gradient(ellipse 40% 40% at 85% 75%, rgba(4,37,78,0.5) 0%, transparent 60%)',
          ].join(','),
        }}
      />

      {/* Islamic geometric pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40 0 L80 40 L40 80 L0 40Z' fill='none' stroke='white' stroke-width='1'/%3E%3Cpath d='M40 10 L70 40 L40 70 L10 40Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='40' cy='40' r='15' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M40 0 L40 80 M0 40 L80 40' stroke='white' stroke-width='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Soft diagonal lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(45deg, rgba(255,255,255,1) 0 1px, transparent 1px 56px)',
            'repeating-linear-gradient(-45deg, rgba(255,255,255,1) 0 1px, transparent 1px 56px)',
          ].join(','),
        }}
      />

      {/* Abu Dhabi skyline silhouette */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[45%]" aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,15,33,0.6)] via-[rgba(2,15,33,0.2)] to-transparent" />
        <svg
          className="absolute bottom-0 h-full w-full"
          viewBox="0 0 1440 280"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Abu Dhabi skyline — wider, more architectural */}
          <g fill="rgba(4,30,65,0.65)">
            {/* Far left low buildings */}
            <rect x="0" y="220" width="60" height="60" />
            <rect x="70" y="200" width="45" height="80" />
            <rect x="125" y="210" width="30" height="70" />

            {/* Gate towers (iconic) */}
            <rect x="165" y="140" width="28" height="140" />
            <rect x="168" y="130" width="22" height="20" rx="11" />
            <rect x="205" y="150" width="28" height="130" />
            <rect x="208" y="140" width="22" height="20" rx="11" />

            {/* Mid-left cluster */}
            <rect x="245" y="175" width="40" height="105" />
            <rect x="295" y="160" width="35" height="120" />
            <rect x="340" y="180" width="25" height="100" />
            <rect x="375" y="190" width="50" height="90" />

            {/* Tall landmark center-left */}
            <rect x="435" y="100" width="32" height="180" />
            <rect x="437" y="90" width="28" height="18" rx="4" />
            <rect x="440" y="80" width="12" height="15" />
            <rect x="477" y="130" width="28" height="150" />

            {/* Abu Dhabi National Hotel-ish */}
            <polygon points="515,60 530,280 500,280" />
            <rect x="545" y="120" width="35" height="160" />
            <rect x="590" y="145" width="28" height="135" />

            {/* Dense central cluster */}
            <rect x="628" y="165" width="45" height="115" />
            <rect x="683" y="140" width="30" height="140" />
            <rect x="723" y="155" width="40" height="125" />
            <rect x="773" y="170" width="35" height="110" />

            <rect x="978" y="170" width="35" height="110" />
            <rect x="1023" y="160" width="28" height="120" />
            <rect x="1061" y="180" width="50" height="100" />

            {/* Mosque dome suggestion far right */}
            <rect x="1121" y="195" width="80" height="85" />
            <ellipse cx="1161" cy="195" rx="40" ry="20" />
            <rect x="1153" y="165" width="16" height="30" />

            {/* Far right low fills */}
            <rect x="1211" y="210" width="60" height="70" />
            <rect x="1281" y="220" width="80" height="60" />
            <rect x="1371" y="215" width="70" height="65" />
          </g>
          {/* Ground fill */}
          <rect x="0" y="276" width="1440" height="4" fill="rgba(4,30,65,0.8)" />
        </svg>
      </motion.div>

      {/* Main content */}
      <div className="relative z-[2] flex flex-1 w-full max-w-[440px] flex-col justify-between py-4 sm:py-6">
        {/* Top: Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex w-full flex-col items-center"
        >
          <Logo />
        </motion.div>

        {/* Center: Glass auth card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="my-auto flex w-full flex-col items-center justify-center py-6"
        >
          {children ?? <LoginCard />}
        </motion.div>

        {/* Bottom: Footer trust badges & copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex w-full flex-col items-center gap-3"
        >
          <div className="flex items-center gap-4 text-[12px] font-medium tracking-[0.12em] text-white/60">
            <span>Secure</span>
            <span className="text-white/30">•</span>
            <span>Trusted</span>
            <span className="text-white/30">•</span>
            <span>Reliable</span>
          </div>
          <div className="text-center text-[11px] text-white/40">
            © {new Date().getFullYear()} Abu Dhabi National Takaful Co. P.S.C. All rights reserved.
          </div>
        </motion.div>
      </div>
    </div>
  )
}
