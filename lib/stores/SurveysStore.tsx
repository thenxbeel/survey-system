'use client'

/**
 * Surveys Store — Context + useReducer store that manages the survey list.
 *
 * LIVE DATA VERSION — fetches from /api/surveys (Prisma-backed). The previous
 * mock-data implementation has been removed.
 *
 * The store still accepts SurveyDraft from the Survey Builder and publishes
 * it via POST /api/surveys, then refetches the list so the new survey
 * appears immediately.
 */

import {
  createContext, useContext, useEffect, useReducer, useCallback, type ReactNode,
} from 'react'
import type { SurveyDraft } from '@/lib/builderTypes'
import type { SurveyRecord, SurveyStatus, SurveyVisibility } from '@/lib/types/survey'

// Re-export types for backwards compatibility (components that import from the store)
export type { SurveyRecord, SurveyStatus, SurveyVisibility }

// ─── State ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_SURVEYS';   surveys: SurveyRecord[] }
  | { type: 'SET_LOADING';   loading: boolean }
  | { type: 'SET_ERROR';     error: string | null }

interface SurveysState {
  surveys: SurveyRecord[]
  loading: boolean
  error: string | null
}

const initialState: SurveysState = {
  surveys: [],
  loading: true,
  error: null,
}

function reducer(state: SurveysState, action: Action): SurveysState {
  switch (action.type) {
    case 'SET_SURVEYS':
      return { ...state, surveys: action.surveys, loading: false, error: null }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false }
    default:
      return state
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface SurveysContextValue {
  state: SurveysState
  refresh: () => Promise<void>
  // Convenience helpers kept for backwards compat with existing components
  addSurvey:     (s: SurveyRecord) => Promise<void>
  updateSurvey:  (s: SurveyRecord) => Promise<void>
  deleteSurvey:  (id: string) => Promise<void>
  duplicate:     (id: string) => Promise<void>
  archive:       (id: string) => Promise<void>
  unarchive:     (id: string) => Promise<void>
  bulkArchive:   (ids: string[]) => Promise<void>
  bulkDelete:    (ids: string[]) => Promise<void>
  /** Publish a SurveyDraft from the builder → POST /api/surveys then refresh. */
  publishDraft:  (draft: SurveyDraft, createdBy: string) => Promise<SurveyRecord | null>
  /** Save a SurveyDraft as a draft survey → POST /api/surveys. */
  saveDraft:     (draft: SurveyDraft, createdBy: string) => Promise<SurveyRecord | null>
}

const SurveysContext = createContext<SurveysContextValue | null>(null)

export function SurveysProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const refresh = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true })
    try {
      const res = await fetch('/api/surveys?pageSize=100', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      dispatch({ type: 'SET_SURVEYS', surveys: json.data || [] })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Failed to load surveys' })
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const addSurvey = useCallback(async (_s: SurveyRecord) => { await refresh() }, [refresh])
  const updateSurvey = useCallback(async (_s: SurveyRecord) => { await refresh() }, [refresh])

  const deleteSurvey = useCallback(async (id: string) => {
    const numericId = id.replace(/^SRV-/, '')
    const res = await fetch(`/api/surveys/${numericId}?force=true`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `HTTP error ${res.status}`)
    }
    await refresh()
  }, [refresh])

  const duplicate = useCallback(async (id: string) => {
    // Fetch the source survey, then POST a copy
    const numericId = id.replace(/^SRV-/, '')
    const res = await fetch(`/api/surveys/${numericId}`)
    if (!res.ok) return
    const json = await res.json()
    const s = json.data
    if (!s) return
    await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${s.title} (Copy)`,
        description: s.description || undefined,
        touchpoint: s.touchpoint,
        category: s.category || undefined,
        visibility: s.visibility?.toUpperCase() ?? 'PRIVATE',
        isAnonymous: s.isAnonymous ?? true,
        publish: false,
        questions: (s.questions || []).map((q: any, i: number) => ({
          question: q.question,
          type: q.type,
          required: q.required,
          displayOrder: q.displayOrder ?? i,
          options: (q.options || []).map((o: any) => ({ value: o.value })),
        })),
      }),
    })
    await refresh()
  }, [refresh])

  const archive = useCallback(async (id: string) => {
    const numericId = id.replace(/^SRV-/, '')
    await fetch(`/api/surveys/${numericId}?action=archive`, { method: 'PATCH' })
    await refresh()
  }, [refresh])

  const unarchive = useCallback(async (id: string) => {
    const numericId = id.replace(/^SRV-/, '')
    await fetch(`/api/surveys/${numericId}?action=unarchive`, { method: 'PATCH' })
    await refresh()
  }, [refresh])

  const bulkArchive = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => {
      const numericId = id.replace(/^SRV-/, '')
      return fetch(`/api/surveys/${numericId}?action=archive`, { method: 'PATCH' })
    }))
    await refresh()
  }, [refresh])

  const bulkDelete = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(async (id) => {
      const numericId = id.replace(/^SRV-/, '')
      const res = await fetch(`/api/surveys/${numericId}?force=true`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP error ${res.status}`)
      }
    }))
    await refresh()
  }, [refresh])

  const publishDraft = useCallback(async (draft: SurveyDraft, _createdBy: string): Promise<SurveyRecord | null> => {
    const res = await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: draft.title.trim() || 'Untitled Survey',
        description: draft.description.trim() || undefined,
        touchpoint: draft.touchpoint || 'Customer Support',
        visibility: draft.visibility === 'public' ? 'PUBLIC' : 'PRIVATE',
        isAnonymous: true,
        publish: true,
        questions: draft.questions.map((q, i) => ({
          question: q.title,
          type: q.type,
          required: q.required,
          displayOrder: i,
          options: q.options.length > 0 ? q.options.map(o => ({ value: o.label })) : undefined,
        })),
      }),
    })
    if (!res.ok) return null
    const json = await res.json()
    await refresh()
    return json.data as SurveyRecord
  }, [refresh])

  const saveDraft = useCallback(async (draft: SurveyDraft, _createdBy: string): Promise<SurveyRecord | null> => {
    const res = await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: draft.title.trim() || 'Untitled Survey',
        description: draft.description.trim() || undefined,
        touchpoint: draft.touchpoint || 'Customer Support',
        visibility: draft.visibility === 'public' ? 'PUBLIC' : 'PRIVATE',
        isAnonymous: true,
        publish: false,
        questions: draft.questions.map((q, i) => ({
          question: q.title,
          type: q.type,
          required: q.required,
          displayOrder: i,
          options: q.options.length > 0 ? q.options.map(o => ({ value: o.label })) : undefined,
        })),
      }),
    })
    if (!res.ok) return null
    const json = await res.json()
    await refresh()
    return json.data as SurveyRecord
  }, [refresh])

  const value: SurveysContextValue = {
    state, refresh,
    addSurvey, updateSurvey, deleteSurvey, duplicate, archive, unarchive, bulkArchive, bulkDelete,
    publishDraft, saveDraft,
  }

  return (
    <SurveysContext.Provider value={value}>
      {children}
    </SurveysContext.Provider>
  )
}

export function useSurveys() {
  const ctx = useContext(SurveysContext)
  if (!ctx) throw new Error('useSurveys must be used within <SurveysProvider>')
  return ctx
}
