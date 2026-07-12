'use client'

import { useEffect, useState } from 'react'

export default function Signature() {
  const [show, setShow] = useState(false)
  const secretCode = 'nabeel2242528'

  useEffect(() => {
    let inputBuffer = ''

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes if the user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      inputBuffer += e.key.toLowerCase()

      // Keep the buffer at the length of the secret code
      if (inputBuffer.length > secretCode.length) {
        inputBuffer = inputBuffer.slice(-secretCode.length)
      }

      if (inputBuffer === secretCode) {
        setShow(true)
        console.log(
          '%c👑 Developed and Engineered by Nabeel Habees',
          'color: #0B4A8B; font-size: 24px; font-weight: bold; background: #F4F7FB; padding: 20px; border-radius: 8px; border: 2px solid #0B4A8B;'
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!show) return null

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={() => setShow(false)}
    >
      <div 
        className="animate-in zoom-in-95 duration-300 rounded-2xl bg-white p-10 text-center shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-5xl">👑</div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0D1B2E] mb-2">
          Developed and Engineered by
        </h2>
        <div className="text-3xl font-extrabold text-[#0B4A8B] bg-gradient-to-r from-[#0B4A8B] to-[#06386F] bg-clip-text text-transparent">
          Nabeel Habees
        </div>
        <p className="mt-8 text-[12px] font-medium text-[#8FA0B5] hover:text-[#0B4A8B] cursor-pointer transition-colors" onClick={() => setShow(false)}>
          Click anywhere to dismiss
        </p>
      </div>
    </div>
  )
}
