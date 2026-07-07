import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

// GET /api/analytics/heatmap — response volume by day-of-week × hour
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const since = new Date()
  since.setDate(since.getDate() - 90)

  const responses = await prisma.response.findMany({
    where: { submittedAt: { gte: since } },
    select: { submittedAt: true },
  })

  // 7 days × 24 hours grid
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const grid: { day: string; hour: string; value: number }[] = []

  // Count responses per day-hour
  // Offset to Gulf Standard Time (UTC+4) so day-of-week matches Abu Dhabi local time
  const GST_OFFSET_MS = 4 * 60 * 60 * 1000
  const counts: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  responses.forEach(r => {
    const d = new Date(new Date(r.submittedAt).getTime() + GST_OFFSET_MS)
    counts[d.getUTCDay()][d.getUTCHours()]++
  })

  // Normalize to 0-4 intensity
  const max = Math.max(...counts.flat(), 1)
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const raw = counts[day][hour]
      const intensity = raw === 0 ? 0 : Math.min(4, Math.ceil((raw / max) * 4))
      grid.push({ day: dayNames[day], hour: hour.toString(), value: intensity })
    }
  }

  return NextResponse.json({ data: grid })
}
