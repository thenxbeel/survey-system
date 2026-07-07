interface BadgeProps {
  variant: 'promoter' | 'passive' | 'detractor'
  children: React.ReactNode
  className?: string
}

const styles = {
  promoter:  'bg-[#ECFDF5] text-[#17A673] border-[#17A673]/20',
  passive:   'bg-[#FFFBEB] text-[#D97706] border-[#F59E0B]/20',
  detractor: 'bg-[#FEF2F2] text-[#E5484D] border-[#E5484D]/20',
}

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[6px] border px-2.5 py-0.5 text-[11px] font-semibold ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
