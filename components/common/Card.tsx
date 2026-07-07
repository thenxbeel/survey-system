import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
  hover?: boolean
}

export default function Card({ children, className = '', noPadding = false, hover = false }: CardProps) {
  return (
    <div
      className={`rounded-[18px] border bg-white ${hover ? 'card-hover cursor-pointer' : ''} ${noPadding ? '' : 'p-6'} ${className}`}
      style={{
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
        // Only enforce a minHeight for padded cards (avoid constraining
        // table containers that use noPadding — they need to size to content).
        ...(noPadding ? {} : { minHeight: 80 }),
      }}
    >
      {children}
    </div>
  )
}
