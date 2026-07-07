'use client'

import { useEffect, useState } from 'react'

/**
 * useTouchpoints — fetches the live touchpoint list from /api/touchpoints.
 *
 * Returns an array of touchpoint objects { id, name, description, surveyCount,
 * createdAt, updatedAt }. The hook re-fetches on mount and exposes a `refresh`
 * function so callers can invalidate the cache after a create/update/delete.
 *
 * Usage:
 *   const { touchpoints, loading, refresh } = useTouchpoints()
 *
 * For simple dropdowns that only need names, use useTouchpointNames() instead.
 */
export interface TouchpointOption {
  id: number
  name: string
  description: string | null
  surveyCount: number
  createdAt: string
  updatedAt: string
}

export function useTouchpoints() {
  const [touchpoints, setTouchpoints] = useState<TouchpointOption[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const refresh = () => setVersion(v => v + 1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/touchpoints', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (cancelled || !json?.data) return
        setTouchpoints(json.data)
      })
      .catch(() => { /* keep default empty */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [version])

  return { touchpoints, loading, refresh }
}

/**
 * useTouchpointNames — convenience hook that returns just the touchpoint
 * names as a string array. Matches the shape that existing dropdown
 * components expect from the old hardcoded TOUCHPOINTS constant.
 *
 * Usage:
 *   const touchpoints = useTouchpointNames()
 *   // ['Claims Handling', 'Policy Renewal', 'Onboarding', ...]
 */
export function useTouchpointNames(): string[] {
  const { touchpoints } = useTouchpoints()
  return touchpoints.map(t => t.name)
}

/**
 * useTouchpointOptions — returns { value, label } pairs for dropdowns that
 * use that shape (e.g. the Survey Builder).
 */
export function useTouchpointOptions(): { value: string; label: string }[] {
  const { touchpoints } = useTouchpoints()
  return touchpoints.map(t => ({ value: t.name, label: t.name }))
}
