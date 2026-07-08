'use client'

import type { ReactNode } from 'react'
import { SettingsProvider } from '@/lib/stores/SettingsStore'

export default function Providers({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>
}
