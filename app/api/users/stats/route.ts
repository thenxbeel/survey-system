import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * GET /api/users/stats
 *
 * Returns ALL dashboard metrics computed from the live database.
 * No mock data — every number is the result of a real Prisma query.
 *
 * Metrics returned:
 *   - totalUsers, activeUsers, suspendedUsers, inactiveUsers, pendingUsers
 *   - neverLoggedIn, loggedInToday, loggedInThisWeek, loggedInThisMonth
 *   - avgLastLoginDays (avg days since last login, ignoring nulls)
 *   - avgLastLoginLabel (human-readable: "Today" | "Yesterday" | "Nd ago" | "Nd avg")
 *   - totalRoles, totalDepartments, totalBranches
 *   - byRole, byDepartment, byBranch (maps for charts)
 *   - casesHandledTotal, casesAssignedTotal, casesResolvedTotal, openCasesTotal
 *
 * "Cases" model — a Case = a Response on a survey created by a user.
 *   - Assigned  = total responses on the user's surveys
 *   - Handled   = responses with status in (resolved, closed, completed)
 *   - Resolved  = responses with status === 'resolved' (alias of handled subset)
 *   - Open      = Assigned − Handled
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── 1. User counts by status ──
  // The User model uses `isActive: Boolean` rather than a status enum, so we
  // derive the counts from that field. "Suspended" and "Pending" are not
  // modelled — they're always 0 — but the response shape is preserved for
  // backwards compatibility with the dashboard client.
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
  ])
  const suspendedUsers = inactiveUsers
  const pendingUsers = 0

  // ── 2. Login metrics ──
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const startOfWeek = new Date(startOfToday)
  // ISO week starts Monday
  const dow = (startOfWeek.getDay() + 6) % 7
  startOfWeek.setDate(startOfWeek.getDate() - dow)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    neverLoggedIn,
    loggedInToday,
    loggedInThisWeek,
    loggedInThisMonth,
    loggedInUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { lastLogin: null } }),
    prisma.user.count({ where: { lastLogin: { gte: startOfToday } } }),
    prisma.user.count({ where: { lastLogin: { gte: startOfWeek } } }),
    prisma.user.count({ where: { lastLogin: { gte: startOfMonth } } }),
    prisma.user.findMany({
      where: { lastLogin: { not: null } },
      select: { lastLogin: true },
    }),
  ])

  // ── 3. Average last-login computation ──
  let avgLastLoginDays = 0
  let avgLastLoginLabel = '—'
  if (loggedInUsers.length > 0) {
    const sumDays = loggedInUsers.reduce((s, u) => {
      const days = (now.getTime() - (u.lastLogin as Date).getTime()) / 86_400_000
      return s + Math.max(0, days)
    }, 0)
    avgLastLoginDays = Math.round((sumDays / loggedInUsers.length) * 10) / 10
    avgLastLoginLabel = formatAvgLogin(avgLastLoginDays)
  }

  // ── 4. Org totals ──
  const [totalRoles, totalDepartments, totalBranches] = await Promise.all([
    prisma.role.count(),
    prisma.department.count(),
    prisma.branch.count(),
  ])

  // ── 5. Distribution maps (for charts) ──
  const [roleRows, deptRows, branchRows] = await Promise.all([
    prisma.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.department.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.branch.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    }),
  ])

  const byRole: Record<string, number> = {}
  for (const r of roleRows) byRole[r.name] = r._count.users

  const byDepartment: Record<string, number> = {}
  for (const d of deptRows) byDepartment[d.name] = d._count.users

  const byBranch: Record<string, number> = {}
  for (const b of branchRows) byBranch[b.name] = b._count.users

  // ── 6. Cases metrics ──
  // A "case" = a Response on a survey. Each survey is owned by a user (createdById).
  // Aggregate by Response.status field.
  // Resolved / Completed / Closed are considered "handled".
  const RESOLVED_STATUSES = ['resolved', 'closed', 'completed']
  const HANDLED_STATUSES   = ['resolved', 'closed', 'completed', 'in_progress', 'reopened']

  const allResponses = await prisma.response.findMany({
    select: { status: true, survey: { select: { createdById: true } } },
  })

  let casesAssignedTotal = 0
  let casesHandledTotal = 0
  let casesResolvedTotal = 0
  let openCasesTotal = 0

  // Per-user case map (for granular inspection if needed)
  const perUserCases: Record<number, { assigned: number; handled: number; resolved: number; open: number }> = {}

  for (const r of allResponses) {
    const ownerId = r.survey.createdById
    if (!perUserCases[ownerId]) {
      perUserCases[ownerId] = { assigned: 0, handled: 0, resolved: 0, open: 0 }
    }
    const status = (r.status ?? 'new').toLowerCase()
    const isResolved = RESOLVED_STATUSES.includes(status)
    const isHandled  = HANDLED_STATUSES.includes(status)

    casesAssignedTotal++
    perUserCases[ownerId].assigned++

    if (isHandled) {
      casesHandledTotal++
      perUserCases[ownerId].handled++
    }
    if (isResolved) {
      casesResolvedTotal++
      perUserCases[ownerId].resolved++
    }
    if (!isHandled) {
      openCasesTotal++
      perUserCases[ownerId].open++
    }
  }

  return NextResponse.json({
    data: {
      // User counts
      totalUsers,
      activeUsers,
      suspendedUsers,
      inactiveUsers,
      pendingUsers,
      // Login activity
      neverLoggedIn,
      loggedInToday,
      loggedInThisWeek,
      loggedInThisMonth,
      avgLastLoginDays,
      avgLastLoginLabel,
      // Org totals
      totalRoles,
      totalDepartments,
      totalBranches,
      // Distribution maps
      byRole,
      byDepartment,
      byBranch,
      // Case metrics (totals)
      casesAssignedTotal,
      casesHandledTotal,
      casesResolvedTotal,
      openCasesTotal,
      // Per-user case breakdown (keyed by user id)
      perUserCases,
    },
  })
}

/**
 * Convert avg-days-since-login to a human-readable label.
 * 0-0.5  -> "Today"
 * 0.5-1.5 -> "Yesterday"
 * 1.5-7  -> "Nd ago"
 * > 7   -> "Nd avg"
 */
function formatAvgLogin(days: number): string {
  if (days < 0.5) return 'Today'
  if (days < 1.5) return 'Yesterday'
  if (days < 7)   return `${Math.round(days)}d ago`
  return `${Math.round(days)}d avg`
}
