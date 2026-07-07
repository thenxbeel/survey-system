interface AdntcLogoProps {
  /** Visual size context. */
  variant?: 'sidebar' | 'login' | 'mark'
  className?: string
  /** Optional alt text for accessibility. */
  alt?: string
}

/**
 * ADNTC corporate logo (white-on-transparent PNG).
 *
 * The uploaded `takaful-ae.png` is a monochrome-white lockup
 * (emblem + Arabic wordmark + English "Takaful" wordmark) designed to sit
 * on blue/dark surfaces — the sidebar and login panel.
 *
 * Variants:
 *  - `sidebar`: compact horizontal lockup for the 264px sidebar header
 *  - `login`:   large centered hero lockup for the login brand block
 *  - `mark`:    small square mark (kept for compatibility)
 */
export function AdntcLogo({ variant = 'sidebar', className = '', alt = 'Abu Dhabi National Takaful Co. P.S.C.' }: AdntcLogoProps) {
  const sizing =
    variant === 'login'
      ? 'h-[100px] w-auto max-w-[420px]'
      : variant === 'mark'
      ? 'h-[28px] w-auto'
      : 'h-[34px] w-auto'

  return (
    <img
      src="/adntc-logo.png"
      alt={alt}
      className={`object-contain ${sizing} ${className}`}
      draggable={false}
    />
  )
}

export default AdntcLogo
