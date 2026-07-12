import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/cron/expiration
 * 
 * Lightweight cron-like task to check for surveys that have passed their expirationDate.
 * Closes them and notifies the owner.
 * Can be hit externally by a cron job or triggered silently by the dashboard client.
 */
export async function GET() {
  try {
    const now = new Date()

    // Find surveys that are active/published but past expiration date
    const expiredSurveys = await prisma.survey.findMany({
      where: {
        status: 'PUBLISHED',
        expirationDate: {
          lt: now,
        },
      },
      select: { id: true, title: true, createdById: true },
    })

    if (expiredSurveys.length === 0) {
      return NextResponse.json({ success: true, expiredCount: 0 })
    }

    const surveyIds = expiredSurveys.map((s) => s.id)

    // Close the surveys
    await prisma.survey.updateMany({
      where: { id: { in: surveyIds } },
      data: {
        lifecycleStatus: 'CLOSED',
        closedAt: now,
      },
    })

    // Notify the creators
    for (const survey of expiredSurveys) {
      await prisma.notification.create({
        data: {
          title: 'Survey Expired',
          message: `Your survey "${survey.title}" has passed its expiration date and was automatically closed.`,
          category: 'system',
          link: `/dashboard/surveys`,
          userId: survey.createdById,
        },
      })
    }

    return NextResponse.json({
      success: true,
      expiredCount: expiredSurveys.length,
      surveyIds,
    })
  } catch (error: any) {
    console.error('Expiration check failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
