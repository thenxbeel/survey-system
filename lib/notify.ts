import { prisma } from '@/lib/prisma'

/**
 * Notification helpers — thin wrappers around prisma.notification.create()
 * used by API routes that need to push user-facing notifications when an
 * event occurs.
 *
 * Reused by:
 *   - app/api/surveys/route.ts            (Survey Created, Survey Published)
 *   - app/api/surveys/[id]/route.ts       (Survey Closed, Survey Archived)
 *   - app/api/public/surveys/[slug]/responses/route.ts (Response Submitted)
 *   - app/api/auth/register/route.ts      (User Created)
 *   - app/api/campaigns/route.ts          (Campaign Created)
 *
 * All helpers are fire-and-forget safe — wrap in try/catch at the call site
 * so a notification failure never breaks the primary operation.
 */

export interface NotifyParams {
  userId: number
  title: string
  message: string
  category?: string
  link?: string | null
}

/**
 * Create a single notification for a user.
 */
export async function notify({ userId, title, message, category = 'system', link = null }: NotifyParams) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      category,
      link,
    },
  })
}

/**
 * Notify every user with the given role (e.g. all admins). Used for system
 * events that the whole admin team should see, like a new user registration.
 */
export async function notifyRole(role: 'Admin' | 'Manager' | 'Viewer', params: Omit<NotifyParams, 'userId'>) {
  const users = await prisma.user.findMany({
    where: { isActive: true, role: { name: role } },
    select: { id: true },
  })
  if (users.length === 0) return
  await prisma.notification.createMany({
    data: users.map(u => ({
      userId: u.id,
      title: params.title,
      message: params.message,
      category: params.category ?? 'system',
      link: params.link ?? null,
    })),
  })
}

/**
 * Notify a specific list of user IDs (e.g. all members of a department).
 */
export async function notifyUsers(userIds: number[], params: Omit<NotifyParams, 'userId'>) {
  if (userIds.length === 0) return
  await prisma.notification.createMany({
    data: userIds.map(id => ({
      userId: id,
      title: params.title,
      message: params.message,
      category: params.category ?? 'system',
      link: params.link ?? null,
    })),
  })
}
