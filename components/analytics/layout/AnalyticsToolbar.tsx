'use client'

import { motion } from 'framer-motion'
import { useAnalytics } from '../state/useAnalytics'
import { AnalyticsTabs } from './AnalyticsTabs'
import { AnalyticsFilters } from './AnalyticsFilters'

export function AnalyticsToolbar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 pb-5 md:flex-row md:items-center md:justify-between"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <AnalyticsTabs />
      <AnalyticsFilters />
    </motion.div>
  )
}
