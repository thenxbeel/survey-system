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
    sm: { 
      borderRadius: '8px', 
      fontSize: '11.5px', 
      padding: isIconOnly ? '0' : '10px 20px', 
      minHeight: '36px',
      width: isIconOnly ? '36px' : 'auto',
      minWidth: isIconOnly ? '36px' : '100px',
    },
    md: { 
      borderRadius: '10px', 
      fontSize: '12.5px', 
      padding: isIconOnly ? '0' : '12px 24px', 
      minHeight: '42px',
      width: isIconOnly ? '42px' : 'auto',
      minWidth: isIconOnly ? '42px' : '130px',
    },
    lg: { 
      borderRadius: '12px', 
      fontSize: '13.5px', 
      padding: isIconOnly ? '0' : '16px 32px', 
      minHeight: '50px',
      width: isIconOnly ? '50px' : 'auto',
      minWidth: isIconOnly ? '50px' : '160px',
    },
  }

  const variants = {
    primary:   'bg-[#0B4A8B] text-white border border-[#0B4A8B] hover:bg-[#06386F] hover:border-[#06386F] shadow-[0_3px_10px_rgba(11,74,139,0.3)]',
    secondary: 'bg-white text-[#0D1B2E] border border-[#E2E8F3] hover:border-[#C8D4E3] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow)]',
    ghost:     'bg-transparent text-[#4A5568] border border-[#E2E8F3] hover:bg-white hover:text-[#0D1B2E] hover:border-[#C8D4E3]',
    danger:    'bg-[#FEF2F2] text-[#E5484D] border border-[#FECACA] hover:bg-[#E5484D] hover:text-white',
  }

  return (
    <button 
      className={`${base} ${variants[variant]} ${className}`} 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        ...sizes[size],
        ...(props.style || {})
      }}
      {...props}
    >
      {children}
    </button>
  )
}
