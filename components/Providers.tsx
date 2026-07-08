'use client'

import type { ReactNode } from 'react'
import { SettingsProvider } from '@/components/settings/SettingsProvider'

export default function Providers({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>
}