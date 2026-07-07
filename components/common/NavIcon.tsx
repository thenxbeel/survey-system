export function NavIcon({ name, size = 15 }: { name: string; size?: number }) {
  const s = { width: size, height: size, flexShrink: 0 } as React.CSSProperties
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'dashboard':
      return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
    case 'surveys':
      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
    case 'builder':
      return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
    case 'responses':
      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    case 'analytics':
      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M3 3v18h18"/><path d="M7 16l4-5 3 3 5-7"/></svg>
    case 'campaigns':
      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>
    case 'reports':
      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>
    case 'users':
      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'branches':
      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v0M9 12v0M9 15v0M9 18v0"/></svg>
    case 'audit':
      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
    case 'ownership':
      return <svg style={s} viewBox="0 0 24 24" {...p}><path d="M9 4h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V5a1 1 0 0 1 1-1z"/><path d="M9 14l2 2 4-4"/></svg>
    case 'profile':
      return <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
    case 'settings':
      return <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9"/></svg>
    default:
      return <svg style={s} viewBox="0 0 24 24" {...p}><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
  }
}
