'use client'

/**
 * Settings Store — Context + useReducer store with localStorage AND server
 * persistence. Powers theme, accent color, density, font size, typography.
 *
 * Persistence:
 *   - localStorage (instant, for offline-first hydration)
 *   - /api/me/preferences (server-side, stored on User.preferences JSON)
 *
 * Both write paths are fire-and-forget — a server write failure does not
 * roll back the local state.
 *
 * Reused by:
 *   - app/dashboard/settings (writes)
 *   - app/dashboard/layout (provides + applies CSS variables)
 *   - components/layout/Navbar (reads profile)
 *   - components/layout/Sidebar (reads profile)
 *   - components/dashboard/GreetingHero (reads name)
 *   - any other page that needs the current user
 */

import {
  createContext, useContext, useEffect, useReducer, useCallback, useRef, type ReactNode,
} from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

export type ThemeMode    = 'light' | 'dark' | 'system'
export type DensityMode  = 'comfortable' | 'compact' | 'spacious'
export type FontSizeMode = 'small' | 'medium' | 'large'
export type TypographyMode = 'inter' | 'system' | 'serif'

export interface UserProfile {
  id?:            number
  fullName:       string
  displayName:    string
  email:          string
  phone:          string
  role:           string
  department:     string
  branch:         string
  bio:            string
  avatarColor:    string
  avatarInitials: string
  /** ISO date string (User.createdAt) — drives the "Joined Date" field */
  joinedDate:     string
  allowedPages?:  string[]
}

export interface SettingsState {
  theme:        ThemeMode
  accent:       string
  density:      DensityMode
  fontSize:     FontSizeMode
  typography:   TypographyMode
  language:     string
  profile:      UserProfile
}

export const DEFAULT_PROFILE: UserProfile = {
  fullName:       '',
  displayName:    '',
  email:          '',
  phone:          '',
  role:           '',
  department:     '',
  branch:         '',
  bio:            '',
  avatarColor:    '#0B4A8B',
  avatarInitials: '',
  joinedDate:     '',
  allowedPages:   [],
}

export const DEFAULT_SETTINGS: SettingsState = {
  theme:        'light',
  accent:       '#0B4A8B',
  density:      'comfortable',
  fontSize:     'medium',
  typography:   'inter',
  language:     'English',
  profile:      DEFAULT_PROFILE,
}

// ─── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_THEME';         value: ThemeMode }
  | { type: 'SET_ACCENT';        value: string }
  | { type: 'SET_DENSITY';       value: DensityMode }
  | { type: 'SET_FONT_SIZE';     value: FontSizeMode }
  | { type: 'SET_TYPOGRAPHY';    value: TypographyMode }
  | { type: 'SET_LANGUAGE';      value: SettingsState['language'] }
  | { type: 'UPDATE_PROFILE';    value: Partial<UserProfile> }
  | { type: 'HYDRATE';           value: Partial<SettingsState> }
  | { type: 'RESET' }

function reducer(state: SettingsState, action: Action): SettingsState {
  switch (action.type) {
    case 'SET_THEME':         return { ...state, theme: action.value }
    case 'SET_ACCENT':        return { ...state, accent: action.value }
    case 'SET_DENSITY':       return { ...state, density: action.value }
    case 'SET_FONT_SIZE':     return { ...state, fontSize: action.value }
    case 'SET_TYPOGRAPHY':    return { ...state, typography: action.value }
    case 'SET_LANGUAGE':      return { ...state, language: action.value }
    case 'UPDATE_PROFILE':    return { ...state, profile: { ...state.profile, ...action.value } }
    case 'HYDRATE':           return { ...state, ...action.value, profile: { ...state.profile, ...(action.value.profile ?? {}) } }
    case 'RESET':             return DEFAULT_SETTINGS
    default:                  return state
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface SettingsContextValue {
  state:    SettingsState
  dispatch: React.Dispatch<Action>
  /** Convenience setters (so consumers don't need to construct action objects). */
  setTheme:        (v: ThemeMode) => void
  setAccent:       (v: string) => void
  setDensity:      (v: DensityMode) => void
  setFontSize:     (v: FontSizeMode) => void
  setTypography:   (v: TypographyMode) => void
  setLanguage:     (v: SettingsState['language']) => void
  updateProfile:   (v: Partial<UserProfile>) => void
  reset:           () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const STORAGE_KEY = 'adntc-settings'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_SETTINGS)
  // Ref to track whether the initial server-hydrate has happened, so we don't
  // write back to the server before we've loaded the server-side state.
  const serverHydrated = useRef(false)

  // ── 1. Hydrate from localStorage (instant, before server responds) ─────
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsState>
        // Strip legacy fields that are no longer part of the state shape.
        const { reduceMotion, highContrast, ...rest } = parsed as any
        void reduceMotion; void highContrast
        dispatch({ type: 'HYDRATE', value: { ...rest, language: 'English' } })
      }
    } catch { /* noop */ }
  }, [])

  // ── 2. Fetch profile + server-persisted preferences ────────────────────
  // Profile (identity) always comes from the database; preferences (UI) are
  // merged from the server so that user-picked theme/accent/density/fontSize
  // survive across devices.
  useEffect(() => {
    let cancelled = false
    async function fetchUserAndPrefs() {
      try {
        // /api/auth/me returns the user identity
        const meRes = await fetch('/api/auth/me', { cache: 'no-store' })
        if (meRes.status === 401) {
          if (typeof window !== 'undefined') {
            await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
            window.location.href = '/login'
          }
          return
        }
        if (!meRes.ok) return
        const meJson = await meRes.json()
        const u = meJson.user ?? meJson.data
        if (!u || cancelled) return

        const fullName = u.name ?? ''
        const initials = fullName
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()

        // Deterministic avatar color from the name
        const colors = ['#0B4A8B', '#7C3AED', '#0F6866', '#D97706', '#E5484D', '#3B82F6']
        let hash = 0
        for (let i = 0; i < fullName.length; i++) hash = fullName.charCodeAt(i) + ((hash << 5) - hash)
        const avatarColor = colors[Math.abs(hash) % colors.length]

        dispatch({ type: 'UPDATE_PROFILE', value: {
          id: u.id,
          fullName,
          displayName: fullName.split(' ')[0] ?? fullName,
          email: u.email ?? '',
          phone: u.phone ?? '',
          role: u.role ?? '',
          department: u.department ?? '',
          branch: u.branch ?? '',
          avatarColor,
          avatarInitials: initials || '?',
          joinedDate: u.createdAt ?? '',
          allowedPages: u.allowedPages ?? [],
        }})

        // /api/me/preferences returns the server-persisted UI prefs
        try {
          const prefsRes = await fetch('/api/me/preferences', { cache: 'no-store' })
          if (prefsRes.ok) {
            const prefsJson = await prefsRes.json()
            const p = prefsJson.data ?? {}
            const serverPatch: Partial<SettingsState> = {}
            if (p.theme)     serverPatch.theme     = p.theme as ThemeMode
            if (p.accent)    serverPatch.accent    = p.accent as string
            if (p.density)   serverPatch.density   = p.density as DensityMode
            if (p.fontSize)  serverPatch.fontSize  = p.fontSize as FontSizeMode
            if (p.typography)serverPatch.typography= p.typography as TypographyMode
            serverPatch.language = 'English'
            if (Object.keys(serverPatch).length > 0) {
              dispatch({ type: 'HYDRATE', value: serverPatch })
            }
          }
        } catch { /* preferences endpoint unavailable — keep localStorage state */ }
      } catch { /* ignore — profile stays empty until login completes */ }
      finally {
        serverHydrated.current = true
      }
    }
    fetchUserAndPrefs()
    return () => { cancelled = true }
  }, [])

  // ── 3. Persist every change to localStorage (instant) ──────────────────
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      }
    } catch { /* noop */ }
  }, [state])

  // ── 4. Persist preference changes to the server (debounced) ────────────
  // Write-through: every time the user changes a UI pref, we PUT it to the
  // server so it survives across devices / sessions. We skip writes until the
  // initial server-hydrate has completed to avoid clobbering server state
  // with the default values that the reducer starts with.
  useEffect(() => {
    if (!serverHydrated.current) return
    // Debounce so rapid changes (e.g. dragging an accent color picker) don't
    // fire one request per drag frame.
    const t = setTimeout(() => {
      fetch('/api/me/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: state.theme,
          accent: state.accent,
          density: state.density,
          fontSize: state.fontSize,
          typography: state.typography,
        }),
        keepalive: true,
      }).catch(() => { /* non-fatal — local state is still persisted */ })
    }, 400)
    return () => clearTimeout(t)
  }, [state.theme, state.accent, state.density, state.fontSize, state.typography, state.language])

  // ── 5. Apply CSS variables to <html> so the whole app re-themes instantly ──
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    // English-only layout direction
    root.dir = 'ltr'

    // Accent
    root.style.setProperty('--primary', state.accent)
    root.style.setProperty('--primary-dark', shade(state.accent, -0.18))
    root.style.setProperty('--primary-light', hexToRgba(state.accent, 0.08))
    root.style.setProperty('--accent-soft', hexToRgba(state.accent, 0.08))

    // Density → compact shrinks the sidebar; spacious widens it slightly
    if (state.density === 'compact') {
      root.style.setProperty('--sidebar-w', '220px')
      root.setAttribute('data-density', 'compact')
    } else if (state.density === 'spacious') {
      root.style.setProperty('--sidebar-w', '280px')
      root.setAttribute('data-density', 'spacious')
    } else {
      root.style.setProperty('--sidebar-w', '260px')
      root.setAttribute('data-density', 'comfortable')
    }

    // Font size
    const fontPx = state.fontSize === 'small' ? '13px' : state.fontSize === 'large' ? '15px' : '14px'
    root.style.fontSize = fontPx

    // Typography family
    const fontStack = state.typography === 'serif'
      ? '"Noto Serif SC", Georgia, "Times New Roman", serif'
      : state.typography === 'system'
        ? 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
        : '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    root.style.setProperty('--font-sans', fontStack)
    root.style.fontFamily = fontStack
    // Also set the data-typography attribute so CSS [data-typography="..."]
    // rules in globals.css can override the --font-sans variable for any
    // component that references it via var(--font-sans).
    root.setAttribute('data-typography', state.typography)

    // Theme attribute — triggers [data-theme="dark"] or [data-theme="system"]
    // CSS rules in globals.css that override all surface/text/border variables.
    root.setAttribute('data-theme', state.theme)
  }, [state.accent, state.density, state.fontSize, state.typography, state.theme, state.language])

  // ── Convenience setters ─────────────────────────────────────────────────
  const setTheme        = useCallback((v: ThemeMode)             => dispatch({ type: 'SET_THEME', value: v }), [])
  const setAccent       = useCallback((v: string)                => dispatch({ type: 'SET_ACCENT', value: v }), [])
  const setDensity      = useCallback((v: DensityMode)           => dispatch({ type: 'SET_DENSITY', value: v }), [])
  const setFontSize     = useCallback((v: FontSizeMode)          => dispatch({ type: 'SET_FONT_SIZE', value: v }), [])
  const setTypography   = useCallback((v: TypographyMode)        => dispatch({ type: 'SET_TYPOGRAPHY', value: v }), [])
  const setLanguage     = useCallback((v: SettingsState['language']) => dispatch({ type: 'SET_LANGUAGE', value: v }), [])
  const updateProfile   = useCallback((v: Partial<UserProfile>)  => dispatch({ type: 'UPDATE_PROFILE', value: v }), [])
  const reset           = useCallback(()                         => dispatch({ type: 'RESET' }), [])

  const value: SettingsContextValue = {
    state, dispatch,
    setTheme, setAccent, setDensity, setFontSize, setTypography, setLanguage,
    updateProfile, reset,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within <SettingsProvider>')
  return ctx
}

// ─── Color helpers ──────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!m) return hex
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** Lighten (>0) or darken (<0) a hex color by a ratio in [-1, 1]. */
function shade(hex: string, ratio: number) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!m) return hex
  const adjust = (c: number) => {
    const v = ratio < 0
      ? Math.round(c * (1 + ratio))
      : Math.round(c + (255 - c) * ratio)
    return Math.max(0, Math.min(255, v))
  }
  const r = adjust(parseInt(m[1], 16))
  const g = adjust(parseInt(m[2], 16))
  const b = adjust(parseInt(m[3], 16))
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}
