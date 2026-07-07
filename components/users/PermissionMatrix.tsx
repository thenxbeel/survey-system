'use client'

import { ROLE_PERMISSIONS, ROLE_META, ROLES, type UserRole, type Permission } from '@/lib/types/user'

interface Props {
  /** When provided, highlights the active user's role column. */
  activeRole?: UserRole
}

const ACTION_LABELS: Record<string, string> = {
  view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete', export: 'Export', assign: 'Assign', escalate: 'Escalate', schedule: 'Schedule',
}

const ALL_MODULES: string[] = (() => {
  const set = new Set<string>()
  ROLES.forEach(role => ROLE_PERMISSIONS[role].forEach(p => set.add(p.module)))
  return Array.from(set).sort()
})()

const ALL_ACTIONS: string[] = (() => {
  const set = new Set<string>()
  ROLES.forEach(role => ROLE_PERMISSIONS[role].forEach(p => p.actions.forEach(a => set.add(a.action))))
  return Array.from(set).sort()
})()

function getPermission(permissions: Permission[], module: string, action: string): boolean {
  const perm = permissions.find(p => p.module === module)
  return perm?.actions.find(a => a.action === action)?.allowed ?? false
}

function isRelevant(module: string, action: string): boolean {
  return ROLES.some(role => {
    const perm = ROLE_PERMISSIONS[role].find(p => p.module === module)
    return perm?.actions.some(a => a.action === action)
  })
}

/**
 * Permission Matrix — table of all modules × all roles, with check/dash indicators.
 * Reused for both the User Management landing page (no activeRole) and inside
 * the user detail drawer (activeRole highlighted).
 */
export function PermissionMatrix({ activeRole }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th
              className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.07em]"
              style={{ color: 'var(--text-light)', background: 'var(--bg-subtle)' }}
            >
              Module
            </th>
            <th
              className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.07em]"
              style={{ color: 'var(--text-light)', background: 'var(--bg-subtle)' }}
            >
              Action
            </th>
            {ROLES.map(role => (
              <th
                key={role}
                className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.07em]"
                style={{
                  color: activeRole === role ? 'var(--primary)' : 'var(--text-light)',
                  background: activeRole === role ? 'var(--tint-blue)' : 'var(--bg-subtle)',
                }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span>{role}</span>
                  {activeRole === role && (
                    <span className="h-[2px] w-6 rounded-full" style={{ background: 'var(--primary)' }} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_MODULES.flatMap(module =>
            ALL_ACTIONS.map(action => {
              if (!isRelevant(module, action)) return null
              return (
                <tr
                  key={`${module}-${action}`}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td className="px-3 py-2 text-[11px] font-semibold whitespace-nowrap" style={{ color: 'var(--text)' }}>
                    {module}
                  </td>
                  <td className="px-3 py-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {ACTION_LABELS[action] ?? action}
                  </td>
                  {ROLES.map(role => {
                    const allowed = getPermission(ROLE_PERMISSIONS[role], module, action)
                    return (
                      <td
                        key={role}
                        className="px-3 py-2 text-center"
                        style={{
                          background: activeRole === role && allowed ? 'rgba(11,74,139,0.04)' : 'transparent',
                        }}
                      >
                        {allowed ? (
                          <span
                            className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-[5px]"
                            style={{ background: 'var(--tint-emerald)' }}
                          >
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#17A673" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        ) : (
                          <span
                            className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-[5px] text-[10px] font-semibold"
                            style={{
                              background: 'var(--bg-subtle)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
      {/* Role legend */}
      <div
        className="mt-3 flex flex-wrap items-center gap-3 px-3 py-2.5"
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-subtle)',
        }}
      >
        {ROLES.map(role => (
          <div key={role} className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full" style={{ background: ROLE_META[role]?.color ?? '#4A5568' }} />
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{role}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-[3px]"
              style={{ background: 'var(--tint-emerald)' }}
            >
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#17A673" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Allowed</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-[3px] text-[8px]"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
            >—</span>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Denied</span>
          </div>
        </div>
      </div>
    </div>
  )
}
