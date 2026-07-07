import type { ReactNode } from 'react'
import { SettingsProvider } from '@/lib/stores/SettingsStore'
import { SurveysProvider } from '@/lib/stores/SurveysStore'
import { ToastProvider }    from '@/lib/stores/ToastStore'
import { NotificationProvider } from '@/lib/stores/NotificationStore'
import { GlobalSearchProvider } from '@/lib/stores/GlobalSearchStore'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { Outfit } from 'next/font/google'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-outfit',
})

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${outfit.variable} font-sans antialiased`} style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      <SettingsProvider>
        <SurveysProvider>
          <ToastProvider>
            <NotificationProvider>
              <GlobalSearchProvider>
                <DashboardShell>
                  {children}
                </DashboardShell>
              </GlobalSearchProvider>
            </NotificationProvider>
          </ToastProvider>
        </SurveysProvider>
      </SettingsProvider>
    </div>
  )
}
