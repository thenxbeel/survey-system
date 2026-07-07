'use client'

/**
 * Global Search Store — Context-backed search query that the Navbar search
 * input writes to and any page can read to filter its displayed data.
 *
 * Debounced at 250ms so typing doesn't thrash the filter computations.
 *
 * Used by:
 *   - components/layout/Navbar.tsx (writes)
 *   - app/dashboard/page.tsx (reads — filters ResponseTable + KPIs)
 *   - any page that wants to honour the Navbar search
 */

import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode,
} from 'react'

interface GlobalSearchContextValue {
  /** The current (debounced) search query. */
  query: string
  /** The raw (immediate) input value. */
  rawQuery: string
  /** Update the raw query — will be debounced into `query`. */
  setQuery: (q: string) => void
  /** Clear the search. */
  clear: () => void
  /** Whether the search is currently active (non-empty). */
  isActive: boolean
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null)

const DEBOUNCE_MS = 250

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [rawQuery, setRawQuery] = useState('')
  const [query, setDebouncedQuery] = useState('')

  // Debounce the raw input → debounced query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(rawQuery.trim())
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [rawQuery])

  const setQuery = useCallback((q: string) => setRawQuery(q), [])
  const clear    = useCallback(() => { setRawQuery(''); setDebouncedQuery('') }, [])

  return (
    <GlobalSearchContext.Provider
      value={{ query, rawQuery, setQuery, clear, isActive: query.length > 0 }}
    >
      {children}
    </GlobalSearchContext.Provider>
  )
}

export function useGlobalSearch() {
  const ctx = useContext(GlobalSearchContext)
  if (!ctx) throw new Error('useGlobalSearch must be used within <GlobalSearchProvider>')
  return ctx
}
