'use client'

import { useEffect, useState } from 'react'

/**
 * useDepartments — fetches the live department list from /api/departments.
 *
 * Returns an array of department objects { id, name, description, branchId,
 * branch, userCount }. The hook re-fetches on mount and exposes a `refresh`
 * function so callers can invalidate the cache after a create/update/delete.
 *
 * Usage:
 *   const { departments, loading, refresh } = useDepartments()
 *
 * For simple dropdowns that only need names, use useDepartmentNames() instead.
 */
export interface DepartmentOption {
  id: number
  name: string
  description: string | null
  branchId: number | null
  branch: string | null
  userCount: number
}

export function useDepartments() {
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const refresh = () => setVersion(v => v + 1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/departments', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (cancelled || !json?.data) return
        setDepartments(json.data)
      })
      .catch(() => { /* keep default empty */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [version])

  return { departments, loading, refresh }
}

/**
 * useDepartmentNames — convenience hook that returns just the department
 * names as a string array. Matches the shape that existing dropdown
 * components expect from the old hardcoded DEPARTMENTS constant.
 *
 * Usage:
 *   const departments = useDepartmentNames()
 *   // ['Customer Experience', 'Claims', 'Underwriting', ...]
 */
export function useDepartmentNames(): string[] {
  const { departments } = useDepartments()
  return departments.map(d => d.name)
}

/**
 * useDepartmentOptions — returns { value, label } pairs for dropdowns that
 * use that shape (e.g. the Survey Builder).
 */
export function useDepartmentOptions(): { value: string; label: string }[] {
  const { departments } = useDepartments()
  return departments.map(d => ({ value: d.name, label: d.name }))
}
