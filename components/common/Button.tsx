import { Children, type ReactNode, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export default function Button({
  variant = 'ghost',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center text-center gap-2 font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

  const childArray = Children.toArray(children)
  const hasText = childArray.some(
    (child) => typeof child === 'string' || typeof child === 'number'
  )
  const isIconOnly = !hasText

  const sizes = {
    sm: 'rounded-[8px] text-[11.5px] min-h-[36px] px-3',
    md: 'rounded-[10px] text-[12.5px] min-h-[42px] px-4',
    lg: 'rounded-[12px] text-[13.5px] min-h-[50px] px-6',
  }

  const variants = {
    primary:   'bg-[#0B4A8B] text-white border border-[#0B4A8B] hover:bg-[#06386F] hover:border-[#06386F] shadow-[0_3px_10px_rgba(11,74,139,0.3)]',
    secondary: 'bg-white text-[#0D1B2E] border border-[#E2E8F3] hover:border-[#C8D4E3] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow)]',
    ghost:     'bg-transparent text-[#4A5568] border border-[#E2E8F3] hover:bg-white hover:text-[#0D1B2E] hover:border-[#C8D4E3]',
    danger:    'bg-[#FEF2F2] text-[#E5484D] border border-[#FECACA] hover:bg-[#E5484D] hover:text-white',
  }

  // To support purely icon buttons that were relying on `isIconOnly` before:
  // If the user manually adds 'aspect-square' or 'w-[42px]' we respect it.
  // We no longer force `width` and `minWidth` via inline styles so text can dictate width!

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} 
      style={props.style}
      {...props}
    >
      {children}
    </button>
  )
}
