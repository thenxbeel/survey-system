'use client'

interface RememberMeProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
}

/**
 * Modern checkbox for the glass login card.
 */
export default function RememberMe({ checked = false, onChange }: RememberMeProps) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all duration-150 ${
          checked
            ? 'border-white bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.15)]'
            : 'border-white/30 bg-white/8 hover:border-white/55'
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.5L5 9L9.5 3.5"
              stroke="#0B4A8B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <span className="text-[12.5px] font-medium text-white/80">Remember me</span>
    </label>
  )
}
