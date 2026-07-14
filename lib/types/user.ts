// lib/types/user.ts
//
// User types, constants & helper functions — extracted from the former lib/mockUsers.ts.
// All user data now comes from /api/users (Prisma-backed).

// ─── Types ──────────────────────────────────────────────────────────────────

export type UserRole       = 'Admin' | 'Manager' | 'Branch Manager' | 'Customer Service' | 'Analyst' | 'Viewer'
export type UserStatus     = 'active' | 'inactive' | 'suspended' | 'pending'
export type AuditAction    = 'login' | 'logout' | 'password_reset' | 'role_changed' | 'department_changed' | 'profile_updated' | 'export_run' | 'settings_changed' | 'account_activated' | 'account_deactivated'

export interface Permission {
  module: string
  actions: { action: string; allowed: boolean }[]
}

export interface UserActivity {
  id: string
  action: AuditAction
  description: string
  at: string
  ip: string
  userAgent?: string
}

export interface RecentLogin {
  id: string
  at: string
  ip: string
  device: string
  location: string
  successful: boolean
}

export interface AppUser {
  id: string
  employeeId: string
  name: string
  email: string
  phone?: string
  role: UserRole
  roleId?: number
  department: string
  departmentId?: number | null
  branch: string
  branchId?: number | null
  status: UserStatus
  avatarColor: string
  lastLogin: string | null
  lastLoginIp: string | null
  createdAt: string
  permissions: Permission[]
  allowedPages?: string[] | null
  roleAllowedPages?: string[]
  visibleBranches?: string[] | null
  visibleDepartments?: string[] | null
  activity: UserActivity[]
  recentLogins: RecentLogin[]
  surveysAssigned: number
  casesHandled: number
  avgResolutionHrs: number
}

// ─── Constants ──────────────────────────────────────────────────────────────

export const BRANCHES    = ['Abu Dhabi', 'Murror', 'Al Ain', 'Al Ain City', 'Dubai']
export const DEPARTMENTS = ['Claims Handling', 'Customer Support', 'Policy Renewal', 'Sales', 'Underwriting', 'Digital Experience', 'Operations']
export const ROLES: UserRole[] = ['Admin', 'Manager', 'Branch Manager', 'Customer Service', 'Analyst', 'Viewer']

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: [
    { module: 'Dashboard',  actions: [{ action: 'view', allowed: true }, { action: 'export', allowed: true }] },
    { module: 'Surveys',    actions: [{ action: 'view', allowed: true }, { action: 'create', allowed: true }, { action: 'edit', allowed: true }, { action: 'delete', allowed: true }] },
    { module: 'Responses',  actions: [{ action: 'view', allowed: true }, { action: 'edit', allowed: true }, { action: 'delete', allowed: true }] },
    { module: 'Analytics',  actions: [{ action: 'view', allowed: true }, { action: 'export', allowed: true }] },
    { module: 'Users',      actions: [{ action: 'view', allowed: true }, { action: 'create', allowed: true }, { action: 'edit', allowed: true }, { action: 'delete', allowed: true }] },
    { module: 'Reports',    actions: [{ action: 'view', allowed: true }, { action: 'schedule', allowed: true }] },
    { module: 'Settings',   actions: [{ action: 'view', allowed: true }, { action: 'edit', allowed: true }] },
  ],
  Manager: [
    { module: 'Dashboard',  actions: [{ action: 'view', allowed: true }, { action: 'export', allowed: true }] },
    { module: 'Surveys',    actions: [{ action: 'view', allowed: true }, { action: 'create', allowed: true }, { action: 'edit', allowed: true }, { action: 'delete', allowed: false }] },
    { module: 'Responses',  actions: [{ action: 'view', allowed: true }, { action: 'edit', allowed: true }, { action: 'delete', allowed: false }] },
    { module: 'Analytics',  actions: [{ action: 'view', allowed: true }, { action: 'export', allowed: true }] },
    { module: 'Users',      actions: [{ action: 'view', allowed: true }, { action: 'create', allowed: false }, { action: 'edit', allowed: true }, { action: 'delete', allowed: false }] },
    { module: 'Reports',    actions: [{ action: 'view', allowed: true }, { action: 'schedule', allowed: true }] },
    { module: 'Settings',   actions: [{ action: 'view', allowed: true }, { action: 'edit', allowed: false }] },
  ],
  'Branch Manager': [
    { module: 'Dashboard',  actions: [{ action: 'view', allowed: true }, { action: 'export', allowed: true }] },
    { module: 'Surveys',    actions: [{ action: 'view', allowed: true }, { action: 'create', allowed: true }, { action: 'edit', allowed: true }, { action: 'delete', allowed: false }] },
    { module: 'Responses',  actions: [{ action: 'view', allowed: true }, { action: 'edit', allowed: true }, { action: 'delete', allowed: false }] },
    { module: 'Analytics',  actions: [{ action: 'view', allowed: true }, { action: 'export', allowed: false }] },
    { module: 'Users',      actions: [{ action: 'view', allowed: true }, { action: 'create', allowed: false }, { action: 'edit', allowed: false }, { action: 'delete', allowed: false }] },
    { module: 'Reports',    actions: [{ action: 'view', allowed: true }, { action: 'schedule', allowed: false }] },
    { module: 'Settings',   actions: [{ action: 'view', allowed: false }, { action: 'edit', allowed: false }] },
  ],
  'Customer Service': [
    { module: 'Dashboard',  actions: [{ action: 'view', allowed: true }, { action: 'export', allowed: false }] },
    { module: 'Surveys',    actions: [{ action: 'view', allowed: true }, { action: 'create', allowed: false }, { action: 'edit', allowed: false }, { action: 'delete', allowed: false }] },
    { module: 'Responses',  actions: [{ action: 'view', allowed: true }, { action: 'edit', allowed: true }, { action: 'delete', allowed: false }] },
    { module: 'Analytics',  actions: [{ action: 'view', allowed: false }, { action: 'export', allowed: false }] },
    { module: 'Users',      actions: [{ action: 'view', allowed: false }, { action: 'create', allowed: false }, { action: 'edit', allowed: false }, { action: 'delete', allowed: false }] },
    { module: 'Reports',    actions: [{ action: 'view', allowed: false }, { action: 'schedule', allowed: false }] },
    { module: 'Settings',   actions: [{ action: 'view', allowed: false }, { action: 'edit', allowed: false }] },
  ],
  Analyst: [
    { module: 'Dashboard',  actions: [{ action: 'view', allowed: true }, { action: 'export', allowed: true }] },
    { module: 'Surveys',    actions: [{ action: 'view', allowed: true }, { action: 'create', allowed: false }, { action: 'edit', allowed: false }, { action: 'delete', allowed: false }] },
    { module: 'Responses',  actions: [{ action: 'view', allowed: true }, { action: 'edit', allowed: false }, { action: 'delete', allowed: false }] },
    { module: 'Analytics',  actions: [{ action: 'view', allowed: true }, { action: 'export', allowed: true }] },
    { module: 'Users',      actions: [{ action: 'view', allowed: true }, { action: 'create', allowed: false }, { action: 'edit', allowed: false }, { action: 'delete', allowed: false }] },
    { module: 'Reports',    actions: [{ action: 'view', allowed: true }, { action: 'schedule', allowed: true }] },
    { module: 'Settings',   actions: [{ action: 'view', allowed: true }, { action: 'edit', allowed: false }] },
  ],
  Viewer: [
    { module: 'Dashboard',  actions: [{ action: 'view', allowed: true }, { action: 'export', allowed: false }] },
    { module: 'Surveys',    actions: [{ action: 'view', allowed: true }, { action: 'create', allowed: false }, { action: 'edit', allowed: false }, { action: 'delete', allowed: false }] },
    { module: 'Responses',  actions: [{ action: 'view', allowed: true }, { action: 'edit', allowed: false }, { action: 'delete', allowed: false }] },
    { module: 'Analytics',  actions: [{ action: 'view', allowed: true }, { action: 'export', allowed: false }] },
    { module: 'Users',      actions: [{ action: 'view', allowed: true }, { action: 'create', allowed: false }, { action: 'edit', allowed: false }, { action: 'delete', allowed: false }] },
    { module: 'Reports',    actions: [{ action: 'view', allowed: true }, { action: 'schedule', allowed: false }] },
    { module: 'Settings',   actions: [{ action: 'view', allowed: false }, { action: 'edit', allowed: false }] },
  ],
}


// ─── Stats ──────────────────────────────────────────────────────────────────

export interface UserStats {
  total: number
  active: number
  inactive: number
  suspended: number
  pending: number
  byRole: Record<UserRole, number>
  byDepartment: Record<string, number>
  byBranch: Record<string, number>
  avgLastLoginDays: number
  neverLoggedIn: number
  totalCasesHandled: number
  totalSurveysAssigned: number
}

export function computeUserStats(users: AppUser[]): UserStats {
  const byRole = {} as Record<UserRole, number>
  ROLES.forEach(r => byRole[r] = 0)
  const byDepartment: Record<string, number> = {}
  const byBranch: Record<string, number> = {}
  let totalDaysSinceLogin = 0
  let usersWithLogin = 0
  let neverLoggedIn = 0

  users.forEach(u => {
    byRole[u.role]++
    byDepartment[u.department] = (byDepartment[u.department] ?? 0) + 1
    byBranch[u.branch] = (byBranch[u.branch] ?? 0) + 1
    if (u.lastLogin) {
      const days = Math.floor((Date.now() - new Date(u.lastLogin).getTime()) / (1000 * 60 * 60 * 24))
      totalDaysSinceLogin += days
      usersWithLogin++
    } else {
      neverLoggedIn++
    }
  })

  return {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    pending: users.filter(u => u.status === 'pending').length,
    byRole,
    byDepartment,
    byBranch,
    avgLastLoginDays: usersWithLogin > 0 ? Math.round(totalDaysSinceLogin / usersWithLogin) : 0,
    neverLoggedIn,
    totalCasesHandled: users.reduce((s, u) => s + u.casesHandled, 0),
    totalSurveysAssigned: users.reduce((s, u) => s + u.surveysAssigned, 0),
  }
}

// ─── Filters ────────────────────────────────────────────────────────────────

export interface UserFilters {
  search: string
  role: string
  department: string
  branch: string
  status: string
}

export const DEFAULT_USER_FILTERS: UserFilters = {
  search: '', role: 'all', department: 'All', branch: 'All', status: 'all',
}

export function hasActiveUserFilters(f: UserFilters): boolean {
  return Boolean(f.search || f.role !== 'all' || f.department !== 'All' || f.branch !== 'All' || f.status !== 'all')
}

export function applyUserFilters(users: AppUser[], f: UserFilters): AppUser[] {
  // NOTE: The free-text `search` filter is now sent to the API
  // (/api/users?search=...) which has full survey-URL / slug / code / title /
  // touchpoint / campaign / department / branch / role / status search logic.
  // The client-side filter here only applies the dropdown filters (role,
  // department, branch, status) — NOT the search term — so that survey-linked
  // users returned by the API are not accidentally filtered out.
  return users.filter(u => {
    if (f.role !== 'all' && u.role !== f.role) return false
    if (f.department !== 'All' && u.department !== f.department) return false
    if (f.branch !== 'All' && u.branch !== f.branch) return false
    if (f.status !== 'all') {
      const matchActive = f.status === 'active' && u.status === 'active'
      const matchInactive = (f.status === 'inactive' || f.status === 'suspended') && (u.status === 'inactive' || u.status === 'suspended')
      const matchPending = f.status === 'pending' && u.status === 'pending'
      if (!matchActive && !matchInactive && !matchPending) return false
    }
    return true
  })
}

export type UserSortKey = 'name' | 'employeeId' | 'role' | 'lastLogin' | 'casesHandled' | 'createdAt'

const roleRank: Record<UserRole, number> = { Admin: 6, Manager: 5, 'Branch Manager': 4, 'Customer Service': 3, Analyst: 2, Viewer: 1 }

export function applyUserSort(users: AppUser[], key: UserSortKey, dir: 'asc' | 'desc'): AppUser[] {
  return [...users].sort((a, b) => {
    let cmp = 0
    switch (key) {
      case 'name':          cmp = a.name.localeCompare(b.name); break
      case 'employeeId':    cmp = a.employeeId.localeCompare(b.employeeId); break
      case 'role':
        const rA = roleRank[a.role] ?? 0
        const rB = roleRank[b.role] ?? 0
        cmp = rA - rB
        break
      case 'lastLogin':
        cmp = (a.lastLogin ? new Date(a.lastLogin).getTime() : 0) - (b.lastLogin ? new Date(b.lastLogin).getTime() : 0)
        break
      case 'casesHandled':  cmp = a.casesHandled - b.casesHandled; break
      case 'createdAt':     cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

// ─── Filter option lists ────────────────────────────────────────────────────

export const USER_ROLES       = [{ value: 'all', label: 'All Roles' }, ...ROLES.map(r => ({ value: r, label: r }))]
export const USER_DEPARTMENTS = ['All', ...DEPARTMENTS]
export const USER_BRANCHES    = ['All', ...BRANCHES]
export const USER_STATUSES    = [{ value: 'all', label: 'All Statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'suspended', label: 'Suspended' }, { value: 'pending', label: 'Pending' }]

// ─── Role metadata ──────────────────────────────────────────────────────────

export const ROLE_META: Record<UserRole, { color: string; description: string; usersCount?: number }> = {
  Admin:              { color: '#E5484D', description: 'Full system access including user management and settings' },
  Manager:            { color: '#F5A623', description: 'Department-level management with most CRUD permissions' },
  'Branch Manager':   { color: '#AF52DE', description: 'Branch-scoped management, can assign follow-ups locally' },
  'Customer Service': { color: '#0B4A8B', description: 'Day-to-day follow-up handling and customer interaction' },
  Analyst:            { color: '#17A673', description: 'Read-only access with export rights for analytics' },
  Viewer:             { color: '#8A94A6', description: 'Read-only dashboard and customer viewing' },
}
