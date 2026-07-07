'use client'

import { useEffect, useState } from 'react'

/**
 * useBranches — fetches the live branch list from /api/branches.
 *
 * Returns an array of branch names (strings) plus 'All Branches' as the
 * first entry, matching the shape that existing dropdown components expect
 * from the old hardcoded BRANCHES constant.
 *
 * Usage:
 *   const branches = useBranches()
 *   // ['All Branches', 'Abu Dhabi', 'Dubai', 'Sharjah', 'Al Ain', ...]
 */
export function useBranches(): string[] {
  const [branches, setBranches] = useState<string[]>(['All Branches'])

  useEffect(() => {
    fetch('/api/branches', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const names = json.data.map((b: any) => b.name)
        setBranches(['All Branches', ...names])
      })
      .catch(() => { /* keep default */ })
  }, [])

  return branches
}

/**
 * useBranchOptions — same as useBranches but returns { value, label } pairs
 * for dropdowns that use that shape.
 */
export function useBranchOptions(): { value: string; label: string }[] {
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    [{ value: 'all', label: 'All Branches' }]
  )

  useEffect(() => {
    fetch('/api/branches', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return
        const opts = json.data.map((b: any) => ({ value: b.name, label: b.name }))
        setOptions([{ value: 'all', label: 'All Branches' }, ...opts])
      })
      .catch(() => { /* keep default */ })
  }, [])

  return options
}
