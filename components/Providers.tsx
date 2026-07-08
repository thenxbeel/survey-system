// src/components/Providers.tsx
'use client';
import { useTranslation } from '@/lib/i18n/useTranslation';

import React, { ReactNode } from 'react';
import { SettingsProvider } from '@/lib/stores/SettingsStore';

export default function Providers({ children }: { children: ReactNode }) {
  return <SettingsProvider>{t('components_Providers.tsx_children')}</SettingsProvider>;
}
