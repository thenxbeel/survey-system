import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const since = new Date()
  since.setDate(since.getDate() - 90)
  
  const groupBy = req.nextUrl.searchParams.get('groupBy') ?? 'date'
  const metric = req.nextUrl.searchParams.get('metric') ?? 'responses'
  
  const branch = req.nextUrl.searchParams.get('branch') ?? 'all'
  const department = req.nextUrl.searchParams.get('department') ?? 'all'
  const touchpoint = req.nextUrl.searchParams.get('touchpoint') ?? 'all'
  
  const surveyWhere: any = {}
  if (touchpoint !== 'all') surveyWhere.touchpoint = touchpoint
  if (department !== 'all') surveyWhere.department = department
  if (branch !== 'all') surveyWhere.branch = branch

  const where: any = { submittedAt: { gte: since } }
  if (Object.keys(surveyWhere).length > 0) where.survey = surveyWhere

  const responses = await prisma.response.findMany({
    where,
    select: { 
      submittedAt: true, 
      npsScore: true,
      survey: { select: { title: true, department: true, branch: true, touchpoint: true } },
      distributionChannel: true
    },
  })

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const GST_OFFSET_MS = 4 * 60 * 60 * 1000

  let yLabels: string[] = []
  let xLabels: string[] = []
  let grid: { y: string; x: string; value: number }[] = []

  if (groupBy === 'date') {
    yLabels = dayNames
    xLabels = Array.from({ length: 24 }, (_, i) => i.toString())
    
    const counts: Record<string, Record<string, { sum: number, count: number }>> = {}
    yLabels.forEach(y => {
      counts[y] = {}
      xLabels.forEach(x => counts[y][x] = { sum: 0, count: 0 })
    })

    responses.forEach(r => {
      const d = new Date(new Date(r.submittedAt).getTime() + GST_OFFSET_MS)
      const day = dayNames[d.getUTCDay()]
      const hour = d.getUTCHours().toString()
      
      counts[day][hour].count++
      if (metric === 'rate' && r.npsScore !== null) {
         counts[day][hour].sum += r.npsScore
      }
    })

    let max = 1
    yLabels.forEach(y => {
      xLabels.forEach(x => {
        let val = counts[y][x].count
        if (metric === 'rate') {
          val = counts[y][x].count > 0 ? counts[y][x].sum / counts[y][x].count : 0
        }
        if (val > max) max = val
      })
    })

    yLabels.forEach(y => {
      xLabels.forEach(x => {
        let val = counts[y][x].count
        if (metric === 'rate') val = counts[y][x].count > 0 ? counts[y][x].sum / counts[y][x].count : 0
        const intensity = val === 0 ? 0 : Math.min(4, Math.ceil((val / max) * 4))
        grid.push({ y, x, value: intensity })
      })
    })
  } else {
    // Group By something else. Y-axis = groups, X-axis = Days
    xLabels = dayNames
    const groups = new Set<string>()
    
    responses.forEach(r => {
      let g = 'Unknown'
      if (groupBy === 'survey') g = r.survey?.title || 'Unknown'
      else if (groupBy === 'category') g = r.survey?.department || 'Unknown'
      else if (groupBy === 'status') g = r.distributionChannel || 'Unknown'
      groups.add(g.slice(0, 15))
    })
    
    yLabels = Array.from(groups).slice(0, 7) // max 7 rows to match UI height
    if (yLabels.length === 0) yLabels = ['No Data']

    const counts: Record<string, Record<string, { sum: number, count: number }>> = {}
    yLabels.forEach(y => {
      counts[y] = {}
      xLabels.forEach(x => counts[y][x] = { sum: 0, count: 0 })
    })

    responses.forEach(r => {
      let g = 'Unknown'
      if (groupBy === 'survey') g = r.survey?.title || 'Unknown'
      else if (groupBy === 'category') g = r.survey?.department || 'Unknown'
      else if (groupBy === 'status') g = r.distributionChannel || 'Unknown'
      g = g.slice(0, 15)
      
      if (counts[g]) {
        const d = new Date(new Date(r.submittedAt).getTime() + GST_OFFSET_MS)
        const day = dayNames[d.getUTCDay()]
        counts[g][day].count++
        if (metric === 'rate' && r.npsScore !== null) {
           counts[g][day].sum += r.npsScore
        }
      }
    })

    let max = 1
    yLabels.forEach(y => {
      xLabels.forEach(x => {
        let val = counts[y][x].count
        if (metric === 'rate') {
          val = counts[y][x].count > 0 ? counts[y][x].sum / counts[y][x].count : 0
        }
        if (val > max) max = val
      })
    })

    yLabels.forEach(y => {
      xLabels.forEach(x => {
        let val = counts[y][x].count
        if (metric === 'rate') val = counts[y][x].count > 0 ? counts[y][x].sum / counts[y][x].count : 0
        const intensity = val === 0 ? 0 : Math.min(4, Math.ceil((val / max) * 4))
        grid.push({ y, x, value: intensity })
      })
    })
  }

  return NextResponse.json({ data: { yLabels, xLabels, grid, groupBy } })
}
