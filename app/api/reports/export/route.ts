import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import fs from 'fs'
import path from 'path'

function getPeriodDate(period: string | null): Date | null {
  if (!period || period === 'all' || period === 'All Time') return null
  const now = new Date()
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 3600 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 3600 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 3600 * 1000)
    case 'qtr': {
      const q = Math.floor(now.getMonth() / 3) * 3
      return new Date(now.getFullYear(), q, 1)
    }
    case 'ytd':
      return new Date(now.getFullYear(), 0, 1)
    default:
      return null
  }
}

function formatDateTime(date: Date | null | undefined): string {
  if (!date) return ''
  return date.toISOString().replace('T', ' ').slice(0, 19)
}

/**
 * GET /api/reports/export?format=csv|excel|pdf&type=executive|responses|surveys|campaigns
 *
 * Generates dynamic reports in CSV, Excel (HTML-XLS), or PDF (Printable HTML) formats.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const format = req.nextUrl.searchParams.get('format') ?? 'csv'
  const requestedType = req.nextUrl.searchParams.get('type') ?? 'executive'
  const branch = req.nextUrl.searchParams.get('branch')
  const department = req.nextUrl.searchParams.get('department')
  const period = req.nextUrl.searchParams.get('period')

  let type = requestedType
  if (requestedType === 'executive_summary' || requestedType === 'nps_trend') {
    type = 'executive'
  } else if (
    requestedType === 'branch_performance' ||
    requestedType === 'department_performance' ||
    requestedType === 'survey_performance' ||
    requestedType === 'response_rate'
  ) {
    type = 'surveys'
  } else if (
    requestedType === 'customer_satisfaction' ||
    requestedType === 'detractor_analysis' ||
    requestedType === 'promoter_analysis'
  ) {
    type = 'responses'
  }

  try {
    let payloadCsv = ''
    let payloadXls = ''
    let payloadHtml = ''
    let filename = ''

    let logoBase64 = ''
    try {
      const logoPath = path.join(process.cwd(), 'public', 'adntc-logo.png')
      logoBase64 = fs.readFileSync(logoPath).toString('base64')
    } catch (e) {
      console.error('Failed to load logo', e)
    }
    const logoDataUri = logoBase64 ? `data:image/png;base64,${logoBase64}` : '/adntc-logo.png'

    switch (type) {
      case 'executive': {
        const responsesWhere: any = {}
        const surveysWhere: any = {}
        const campaignsWhere: any = {}

        if (branch && branch !== 'all' && branch !== 'All' && branch !== 'All Branches') {
          responsesWhere.survey = { ...responsesWhere.survey, branch }
          surveysWhere.branch = branch
        }
        if (department && department !== 'all' && department !== 'All' && department !== 'All Departments') {
          responsesWhere.survey = { ...responsesWhere.survey, department }
          surveysWhere.department = department
        }
        const minDate = getPeriodDate(period)
        if (minDate) {
          responsesWhere.submittedAt = { gte: minDate }
          surveysWhere.createdAt = { gte: minDate }
          campaignsWhere.createdAt = { gte: minDate }
        }

        const [responses, surveys, campaigns] = await Promise.all([
          prisma.response.findMany({
            where: responsesWhere,
            include: {
              survey: { select: { title: true, touchpoint: true, branch: true, department: true } },
              campaign: { select: { name: true } },
              assignedTo: { select: { name: true } },
            },
            orderBy: { submittedAt: 'desc' },
          }),
          prisma.survey.count({ where: surveysWhere }),
          prisma.campaign.count({ where: campaignsWhere }),
        ])

        const normalizedResponses = responses.map(r => {
          let csat = r.csatScore
          let ces = r.cesScore
          if (r.npsScore !== null && r.npsScore !== undefined) {
            if (csat === null || csat === undefined) {
              csat = r.npsScore >= 9 ? 5 : r.npsScore >= 7 ? 4 : r.npsScore >= 5 ? 3 : 2
            }
            if (ces === null || ces === undefined) {
              ces = r.npsScore >= 9 ? 5 : r.npsScore >= 7 ? 4 : 3
            }
          }
          return {
            ...r,
            csatScore: csat,
            cesScore: ces,
          }
        })

        const npsScores = normalizedResponses.map(r => r.npsScore).filter(s => s !== null && s !== undefined).map(Number).filter(s => !isNaN(s))
        const promoters = npsScores.filter(s => s >= 9).length
        const detractors = npsScores.filter(s => s <= 6).length
        const passives = npsScores.filter(s => s >= 7 && s <= 8).length
        const nps = npsScores.length > 0 ? Math.round(((promoters - detractors) / npsScores.length) * 100) : 0

        const csatScores = normalizedResponses.map(r => r.csatScore).filter(s => s !== null && s !== undefined).map(Number).filter(s => !isNaN(s))
        const avgCsat = csatScores.length > 0 ? (csatScores.reduce((a, b) => a + b, 0) / csatScores.length).toFixed(1) : '—'
        const cesScores = normalizedResponses.map(r => r.cesScore).filter(s => s !== null && s !== undefined).map(Number).filter(s => !isNaN(s))
        const avgCes = cesScores.length > 0 ? (cesScores.reduce((a, b) => a + b, 0) / cesScores.length).toFixed(1) : '—'

        filename = `executive-report-${new Date().toISOString().slice(0, 10)}`

        // ── CSV Generator ──
        payloadCsv = [
          'Survey Response Management Platform — Executive Report',
          `Generated: ${formatDateTime(new Date())}`,
          `Generated By: ${user.name}`,
          `Filters Applied: Period=${period || 'All'}, Branch=${branch || 'All'}, Department=${department || 'All'}`,
          '',
          'Metric,Value',
          `Total Surveys,${surveys}`,
          `Total Responses,${normalizedResponses.length}`,
          `NPS Score,${nps}`,
          `Avg CSAT,${avgCsat}`,
          `Avg CES,${avgCes}`,
          `Promoters,${promoters}`,
          `Passives,${passives}`,
          `Detractors,${detractors}`,
          '',
          'Response Details',
          'ID,Respondent,Survey,Touchpoint,Branch,Department,NPS Score,CSAT,CES,Channel,Device,Assigned To,Status,Date',
          ...normalizedResponses.map(r => [
            `RSP-${String(r.id).padStart(5, '0')}`,
            `"${r.respondentName ?? 'Anonymous'}"`,
            `"${r.survey.title}"`,
            r.survey.touchpoint,
            `"${r.survey.branch ?? ''}"`,
            `"${r.survey.department ?? ''}"`,
            r.npsScore ?? '',
            r.csatScore ?? '',
            r.cesScore ?? '',
            r.distributionChannel ?? 'WEB',
            r.deviceType ?? 'unknown',
            `"${r.assignedTo?.name ?? 'Unassigned'}"`,
            `"${r.status}"`,
            formatDateTime(r.submittedAt),
          ].join(',')),
        ].join('\n')

        // ── XLS (HTML Table) Generator ──
        payloadXls = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Executive Summary</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body>
  <h2>Executive Summary Report</h2>
  <p>Generated: ${formatDateTime(new Date())} By ${user.name}</p>
  <p>Filters: Period=${period || 'All'}, Branch=${branch || 'All'}, Department=${department || 'All'}</p>
  <table border="1">
    <tr style="background:#0B4A8B;color:#ffffff;font-weight:bold;">
      <th colspan="2">Metrics Summary</th>
    </tr>
    <tr><td>Total Surveys</td><td>${surveys}</td></tr>
    <tr><td>Total Responses</td><td>${normalizedResponses.length}</td></tr>
    <tr><td>NPS Score</td><td>${nps}</td></tr>
    <tr><td>Avg CSAT</td><td>${avgCsat}</td></tr>
    <tr><td>Avg CES</td><td>${avgCes}</td></tr>
    <tr><td>Promoters</td><td>${promoters}</td></tr>
    <tr><td>Passives</td><td>${passives}</td></tr>
    <tr><td>Detractors</td><td>${detractors}</td></tr>
  </table>
  <br/>
  <table border="1">
    <tr style="background:#0B4A8B;color:#ffffff;font-weight:bold;">
      <th colspan="14">Response Details</th>
    </tr>
    <tr style="background:#e2e8f0;font-weight:bold;">
      <th>ID</th><th>Respondent</th><th>Survey</th><th>Touchpoint</th><th>Branch</th><th>Department</th><th>NPS Score</th><th>CSAT</th><th>CES</th><th>Channel</th><th>Device</th><th>Assigned To</th><th>Status</th><th>Date</th>
    </tr>
    ${normalizedResponses.map(r => `
      <tr>
        <td>RSP-${String(r.id).padStart(5, '0')}</td>
        <td>${r.respondentName ?? 'Anonymous'}</td>
        <td>${r.survey.title}</td>
        <td>${r.survey.touchpoint}</td>
          <td>${r.survey.branch ?? ''}</td>
          <td>${r.survey.department ?? ''}</td>
        <td>${r.npsScore ?? ''}</td>
        <td>${r.csatScore ?? ''}</td>
        <td>${r.cesScore ?? ''}</td>
        <td>${r.distributionChannel ?? 'WEB'}</td>
        <td>${r.deviceType ?? 'unknown'}</td>
        <td>${r.assignedTo?.name ?? 'Unassigned'}</td>
        <td>${r.status}</td>
        <td>${formatDateTime(r.submittedAt)}</td>
      </tr>
    `).join('')}
  </table>
</body>
</html>
`

        // ── PDF (Printable HTML) Generator ──
        payloadHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Executive Summary Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1f2937; max-width: 1100px; margin: 0 auto; background: #fff; }
    h1 { color: #0b4a8b; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 24px; font-size: 24px; }
    .meta { font-size: 13px; color: #4b5563; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb; }
    .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 35px; }
    .card { background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 10px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .card h3 { font-size: 10px; text-transform: uppercase; color: #6b7280; margin: 0 0 6px 0; letter-spacing: 0.05em; }
    .card p { font-size: 24px; font-weight: 800; color: #0b4a8b; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 11.5px; }
    th, td { padding: 8px 10px; border: 1px solid #e5e7eb; text-align: left; }
    th { background: #f3f4f6; font-weight: 700; color: #374151; }
    tr:nth-child(even) { background: #f9fafb; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
    <div>
      <img src="${logoDataUri}" alt="Company Logo" style="height: 50px; filter: contrast(300%) grayscale(100%) brightness(0.4) sepia(100%) hue-rotate(190deg) saturate(500%); mix-blend-mode: multiply;" onerror="this.src='/logo.svg';this.onerror=null;" />
    </div>
    <div class="no-print" style="display: flex; gap: 10px;">
      <button onclick="window.print()" style="background:#0b4a8b;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px;">Print or Save to PDF</button>
      <button onclick="window.close()" style="background:#fff;color:#4b5563;border:1px solid #d1d5db;padding:8px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px;">Close</button>
    </div>
  </div>
  <h1>Executive Summary Report</h1>
  <div class="meta">
    <div><strong>Generated:</strong> ${formatDateTime(new Date())}</div>
    <div><strong>Generated By:</strong> ${user.name}</div>
    <div style="grid-column: span 2;"><strong>Filters:</strong> Period=${period || 'All'}, Branch=${branch || 'All'}, Department=${department || 'All'}</div>
  </div>
  <div class="grid">
    <div class="card"><h3>Total Surveys</h3><p>${surveys}</p></div>
    <div class="card"><h3>Total Responses</h3><p>${normalizedResponses.length}</p></div>
    <div class="card"><h3>NPS Score</h3><p>${nps}</p></div>
    <div class="card"><h3>Avg CSAT</h3><p>${avgCsat} <span style="font-size:12px;font-weight:normal;color:#6b7280;">/ 5</span></p></div>
    <div class="card"><h3>Avg CES</h3><p>${avgCes} <span style="font-size:12px;font-weight:normal;color:#6b7280;">/ 5</span></p></div>
  </div>
  <h2>Response Details</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Respondent</th><th>Survey</th><th>Touchpoint</th><th>Branch</th><th>Department</th><th>NPS</th><th>CSAT</th><th>CES</th><th>Channel</th><th>Assigned To</th><th>Status</th><th>Date</th>
      </tr>
    </thead>
    <tbody>
      ${normalizedResponses.map(r => {
        const statusBadgeColor = r.status === 'solved' ? '#047857' : r.status === 'in_progress' ? '#b45309' : '#374151';
        const statusBadgeBg = r.status === 'solved' ? '#ecfdf5' : r.status === 'in_progress' ? '#fffbeb' : '#f3f4f6';
        return `
        <tr>
          <td>RSP-${String(r.id).padStart(5, '0')}</td>
          <td>${r.respondentName ?? 'Anonymous'}</td>
          <td>${r.survey.title}</td>
          <td>${r.survey.touchpoint}</td>
          <td>${r.survey.branch ?? ''}</td>
          <td>${r.survey.department ?? ''}</td>
          <td>${r.npsScore ?? ''}</td>
          <td>${r.csatScore ?? ''}</td>
          <td>${r.cesScore ?? ''}</td>
          <td>${r.distributionChannel ?? 'WEB'}</td>
          <td>${r.assignedTo?.name ?? 'Unassigned'}</td>
          <td><span style="background:${statusBadgeBg};color:${statusBadgeColor};padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;text-transform:uppercase;">${r.status}</span></td>
          <td>${formatDateTime(r.submittedAt)}</td>
        </tr>
      `}).join('')}
    </tbody>
  </table>
  <script>
    window.onload = function() {
      setTimeout(() => window.print(), 500);
    }
  </script>
</body>
</html>
`
        break
      }

      case 'responses': {
        const search = req.nextUrl.searchParams.get('search')
        const survey = req.nextUrl.searchParams.get('survey')
        const touchpoint = req.nextUrl.searchParams.get('touchpoint')
        const scoreMin = req.nextUrl.searchParams.get('scoreMin')
        const scoreMax = req.nextUrl.searchParams.get('scoreMax')
        const status = req.nextUrl.searchParams.get('status')
        const dateFrom = req.nextUrl.searchParams.get('dateFrom')
        const dateTo = req.nextUrl.searchParams.get('dateTo')
        const category = req.nextUrl.searchParams.get('category')
        const assignedFilter = req.nextUrl.searchParams.get('assignedFilter')

        const responsesWhere: any = {}
        
        if (search) {
          const s = search.trim()
          const sLower = s.toLowerCase()
          // Fast matching on exact slugs
          const match = s.match(/\/survey\/([a-zA-Z0-9-]+)/)
          const slugFromUrl = match ? match[1] : null
          
          if (slugFromUrl) {
            responsesWhere.survey = { slug: slugFromUrl }
          } else {
            const parsedSurveyId = parseInt(s.replace(/^SRV-?/i, '').replace(/^srv/i, ''))
            const parsedResponseId = parseInt(s.replace(/^RSP-?/i, '').replace(/^rsp/i, ''))
            
            const orConditions: any[] = [
              { respondentName:  { contains: s } },
              { respondentEmail: { contains: s } },
              { feedback:        { contains: s } },
              { survey: { title: { contains: s } } },
              { survey: { surveyCode: { contains: s } } },
              { survey: { slug: { contains: s } } },
              { survey: { touchpoint: { contains: s } } },
              { survey: { campaign: { name: { contains: s } } } },
              { survey: { createdBy: { name: { contains: s } } } },
            ]
            
            if (!isNaN(parsedSurveyId) && parsedSurveyId > 0) orConditions.push({ surveyId: parsedSurveyId })
            if (!isNaN(parsedResponseId) && parsedResponseId > 0) orConditions.push({ id: parsedResponseId })
            
            responsesWhere.OR = orConditions
          }
        }

        if (survey && survey !== 'all' && survey !== 'All') {
          responsesWhere.surveyId = parseInt(survey.replace(/^SRV-/, '') || survey)
        }

        if (status && status !== 'all') {
          responsesWhere.status = status
        }

        if (scoreMin) responsesWhere.npsScore = { ...responsesWhere.npsScore, gte: parseInt(scoreMin) }
        if (scoreMax) responsesWhere.npsScore = { ...responsesWhere.npsScore, lte: parseInt(scoreMax) }
        
        const minDate = getPeriodDate(period)
        if (minDate) responsesWhere.submittedAt = { ...responsesWhere.submittedAt, gte: minDate }
        if (dateFrom) responsesWhere.submittedAt = { ...responsesWhere.submittedAt, gte: new Date(dateFrom) }
        if (dateTo) responsesWhere.submittedAt = { ...responsesWhere.submittedAt, lte: new Date(dateTo + 'T23:59:59') }

        if (category && category !== 'all') {
          if (category === 'promoter')  responsesWhere.npsScore = { gte: 9,  lte: 10 }
          if (category === 'passive')   responsesWhere.npsScore = { gte: 7,  lte: 8  }
          if (category === 'detractor') responsesWhere.npsScore = { gte: 0,  lte: 6  }
        }

        if (assignedFilter) {
          if (assignedFilter === 'unassigned') responsesWhere.assignedToId = null
          else if (assignedFilter === 'assigned') responsesWhere.assignedToId = { not: null }
          else responsesWhere.assignedToId = parseInt(assignedFilter)
        }

        const surveyWhere: any = {}
        if (touchpoint && touchpoint.toLowerCase() !== 'all') surveyWhere.touchpoint = touchpoint
        if (branch && branch.toLowerCase() !== 'all' && branch !== 'All Branches') surveyWhere.branch = branch
        if (department && department.toLowerCase() !== 'all' && department !== 'All Departments') surveyWhere.department = department
        if (Object.keys(surveyWhere).length > 0) {
          responsesWhere.survey = { ...responsesWhere.survey, ...surveyWhere }
        }

        const responses = await prisma.response.findMany({
          where: responsesWhere,
          include: {
            survey: { select: { title: true, touchpoint: true, publicUrl: true, surveyCode: true, branch: true, department: true } },
            campaign: { select: { name: true } },
          },
          orderBy: { submittedAt: 'desc' },
        })

        const normalizedResponses = responses.map(r => {
          let csat = r.csatScore
          let ces = r.cesScore
          if (r.npsScore !== null && r.npsScore !== undefined) {
            if (csat === null || csat === undefined) {
              csat = r.npsScore >= 9 ? 5 : r.npsScore >= 7 ? 4 : r.npsScore >= 5 ? 3 : 2
            }
            if (ces === null || ces === undefined) {
              ces = r.npsScore >= 9 ? 5 : r.npsScore >= 7 ? 4 : 3
            }
          }
          return {
            ...r,
            csatScore: csat,
            cesScore: ces,
          }
        })

        const npsScores = normalizedResponses.map(r => r.npsScore).filter((s): s is number => s !== null)
        const promoters = npsScores.filter(s => s >= 9).length
        const detractors = npsScores.filter(s => s <= 6).length
        const nps = npsScores.length > 0 ? Math.round(((promoters - detractors) / npsScores.length) * 100) : 0

        const csatScores = normalizedResponses.map(r => r.csatScore).filter((s): s is number => s !== null)
        const avgCsat = csatScores.length > 0 ? (csatScores.reduce((a, b) => a + b, 0) / csatScores.length).toFixed(1) : '—'
        const cesScores = normalizedResponses.map(r => r.cesScore).filter((s): s is number => s !== null)
        const avgCes = cesScores.length > 0 ? (cesScores.reduce((a, b) => a + b, 0) / cesScores.length).toFixed(1) : '—'

        filename = `responses-report-${new Date().toISOString().slice(0, 10)}`

        // ── CSV Generator ──
        payloadCsv = [
          'Response ID,Respondent Name,Respondent Email,Respondent Phone,Survey,Touchpoint,Branch,Department,Survey URL,NPS Score,NPS Category,CSAT,CES,Channel,Device,Browser,OS,IP,Country,City,Status,Submitted At',
          ...normalizedResponses.map(r => {
            const score = r.npsScore
            const category = score != null ? (score >= 9 ? 'Promoter' : score >= 7 ? 'Passive' : 'Detractor') : ''
            return [
              `RSP-${String(r.id).padStart(5, '0')}`,
              `"${r.respondentName ?? 'Anonymous'}"`,
              `"${r.respondentEmail ?? ''}"`,
              `"${r.respondentPhone ?? ''}"`,
              `"${r.survey.title}"`,
              r.survey.touchpoint,
              `"${r.survey.branch ?? ''}"`,
              `"${r.survey.department ?? ''}"`,
              `"${r.survey.publicUrl ?? ''}"`,
              r.npsScore ?? '',
              category,
              r.csatScore ?? '',
              r.cesScore ?? '',
              r.distributionChannel ?? 'WEB',
              r.deviceType ?? '',
              r.browser ?? '',
              r.operatingSystem ?? '',
              r.ipAddress ?? '',
              r.country ?? '',
              r.city ?? '',
              r.status,
              formatDateTime(r.submittedAt),
            ].join(',')
          }),
        ].join('\n')

        // ── XLS (HTML Table) Generator ──
        payloadXls = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Responses</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body>
  <h2>Responses Export Report</h2>
  <table border="1">
    <tr style="background:#0B4A8B;color:#ffffff;font-weight:bold;">
      <th>Response ID</th><th>Respondent Name</th><th>Respondent Email</th><th>Respondent Phone</th><th>Survey</th><th>Touchpoint</th><th>Branch</th><th>Department</th><th>Survey URL</th><th>NPS Score</th><th>NPS Category</th><th>CSAT</th><th>CES</th><th>Channel</th><th>Device</th><th>Browser</th><th>OS</th><th>IP</th><th>Country</th><th>City</th><th>Status</th><th>Submitted At</th>
    </tr>
    ${normalizedResponses.map(r => {
      const score = r.npsScore
      const category = score != null ? (score >= 9 ? 'Promoter' : score >= 7 ? 'Passive' : 'Detractor') : ''
      return `
        <tr>
          <td>RSP-${String(r.id).padStart(5, '0')}</td>
          <td>${r.respondentName ?? 'Anonymous'}</td>
          <td>${r.respondentEmail ?? ''}</td>
          <td>${r.respondentPhone ?? ''}</td>
          <td>${r.survey.title}</td>
          <td>${r.survey.touchpoint}</td>
          <td>${r.survey.branch ?? ''}</td>
          <td>${r.survey.department ?? ''}</td>
          <td>${r.survey.publicUrl ?? ''}</td>
          <td>${r.npsScore ?? ''}</td>
          <td>${category}</td>
          <td>${r.csatScore ?? ''}</td>
          <td>${r.cesScore ?? ''}</td>
          <td>${r.distributionChannel ?? 'WEB'}</td>
          <td>${r.deviceType ?? ''}</td>
          <td>${r.browser ?? ''}</td>
          <td>${r.operatingSystem ?? ''}</td>
          <td>${r.ipAddress ?? ''}</td>
          <td>${r.country ?? ''}</td>
          <td>${r.city ?? ''}</td>
          <td>${r.status}</td>
          <td>${formatDateTime(r.submittedAt)}</td>
        </tr>
      `
    }).join('')}
  </table>
</body>
</html>
`

        // ── PDF (Printable HTML) Generator ──
        payloadHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Responses Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1f2937; max-width: 1200px; margin: 0 auto; background: #fff; }
    h1 { color: #0b4a8b; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 24px; font-size: 24px; }
    .meta { font-size: 13px; color: #4b5563; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 35px; }
    .card { background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 10px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .card h3 { font-size: 10px; text-transform: uppercase; color: #6b7280; margin: 0 0 6px 0; letter-spacing: 0.05em; }
    .card p { font-size: 24px; font-weight: 800; color: #0b4a8b; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
    th, td { padding: 8px 10px; border: 1px solid #e5e7eb; text-align: left; }
    th { background: #f3f4f6; font-weight: 700; color: #374151; }
    tr:nth-child(even) { background: #f9fafb; }
    .badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    .promoter { background: #ecfdf5; color: #047857; }
    .passive { background: #fffbeb; color: #b45309; }
    .detractor { background: #fef2f2; color: #b91c1c; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
    <div>
      <img src="${logoDataUri}" alt="Company Logo" style="height: 50px; filter: contrast(300%) grayscale(100%) brightness(0.4) sepia(100%) hue-rotate(190deg) saturate(500%); mix-blend-mode: multiply;" onerror="this.src='/logo.svg';this.onerror=null;" />
    </div>
    <div class="no-print" style="display: flex; gap: 10px;">
      <button onclick="window.print()" style="background:#0b4a8b;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px;">Print or Save to PDF</button>
      <button onclick="window.close()" style="background:#fff;color:#4b5563;border:1px solid #d1d5db;padding:8px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px;">Close</button>
    </div>
  </div>
  <h1>Responses Detail Report</h1>
  <div class="meta">
    <div><strong>Generated:</strong> ${formatDateTime(new Date())}</div>
    <div><strong>Generated By:</strong> ${user.name}</div>
    <div style="grid-column: span 2;"><strong>Filters:</strong> Period=${period || 'All'}, Branch=${branch || 'All'}, Department=${department || 'All'}</div>
  </div>
  <div class="grid">
    <div class="card"><h3>Total Responses</h3><p>${normalizedResponses.length}</p></div>
    <div class="card"><h3>NPS Score</h3><p>${nps}</p></div>
    <div class="card"><h3>Avg CSAT</h3><p>${avgCsat} <span style="font-size:12px;font-weight:normal;color:#6b7280;">/ 5</span></p></div>
    <div class="card"><h3>Avg CES</h3><p>${avgCes} <span style="font-size:12px;font-weight:normal;color:#6b7280;">/ 5</span></p></div>
  </div>
  <h2>Response Details</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Respondent</th><th>Survey</th><th>Touchpoint</th><th>Branch</th><th>Department</th><th>NPS Score</th><th>NPS Category</th><th>CSAT</th><th>CES</th><th>Device</th><th>Date</th>
      </tr>
    </thead>
    <tbody>
      ${normalizedResponses.map(r => {
        const score = r.npsScore
        const category = score != null ? (score >= 9 ? 'Promoter' : score >= 7 ? 'Passive' : 'Detractor') : ''
        return `
          <tr>
            <td>RSP-${String(r.id).padStart(5, '0')}</td>
            <td>${r.respondentName ?? 'Anonymous'}</td>
            <td>${r.survey.title}</td>
            <td>${r.survey.touchpoint}</td>
            <td>${r.survey.branch ?? ''}</td>
            <td>${r.survey.department ?? ''}</td>
            <td>${r.npsScore ?? ''}</td>
            <td><span class="badge ${category}">${category}</span></td>
            <td>${r.csatScore ?? ''}</td>
            <td>${r.cesScore ?? ''}</td>
            <td>${r.deviceType ?? 'unknown'}</td>
            <td>${formatDateTime(r.submittedAt)}</td>
          </tr>
        `
      }).join('')}
    </tbody>
  </table>
  <script>
    window.onload = function() {
      setTimeout(() => window.print(), 500);
    }
  </script>
</body>
</html>
`
        break
      }

      case 'surveys': {
        const surveysWhere: any = {}
        if (branch && branch !== 'all' && branch !== 'All' && branch !== 'All Branches') {
          surveysWhere.branch = branch
        }
        if (department && department !== 'all' && department !== 'All' && department !== 'All Departments') {
          surveysWhere.department = department
        }
        const minDate = getPeriodDate(period)
        if (minDate) {
          surveysWhere.createdAt = { gte: minDate }
        }

        const surveys = await prisma.survey.findMany({
          where: surveysWhere,
          include: {
            _count: { select: { responses: true, questions: true } },
            responses: {
              where: {
                npsScore: { not: null },
                ...(minDate ? { submittedAt: { gte: minDate } } : {})
              },
              select: { npsScore: true }
            },
            createdBy: { select: { name: true, employeeId: true } },
            campaign: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        filename = `surveys-report-${new Date().toISOString().slice(0, 10)}`

        // ── CSV Generator ──
        payloadCsv = [
          'Survey ID,Title,Touchpoint,Branch,Department,Status,Lifecycle,Owner,Employee ID,Questions,Responses,Avg NPS,NPS Score,Public URL,Survey Code,Created At,Expiration',
          ...surveys.map(s => {
            const scores = s.responses.map(r => r.npsScore!).filter((v): v is number => v !== null)
            const promoters = scores.filter(v => v >= 9).length
            const detractors = scores.filter(v => v <= 6).length
            const nps = scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : 0
            const avgNps = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
            return [
              `SRV-${String(s.id).padStart(4, '0')}`,
              `"${s.title}"`,
              s.touchpoint,
                `"${s.branch ?? ''}"`,
                `"${s.department ?? ''}"`,
                s.status,
              s.lifecycleStatus,
              `"${s.createdBy.name}"`,
              s.createdBy.employeeId,
              s._count.questions,
              s._count.responses,
              avgNps ?? '',
              nps,
              `"${s.publicUrl ?? ''}"`,
              s.surveyCode ?? '',
              formatDateTime(s.createdAt),
              formatDateTime(s.expirationDate),
            ].join(',')
          }),
        ].join('\n')

        // ── XLS (HTML Table) Generator ──
        payloadXls = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Surveys</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body>
  <h2>Surveys List Report</h2>
  <table border="1">
    <tr style="background:#0B4A8B;color:#ffffff;font-weight:bold;">
      <th>Survey ID</th><th>Title</th><th>Touchpoint</th><th>Branch</th><th>Department</th><th>Status</th><th>Lifecycle</th><th>Owner</th><th>Employee ID</th><th>Questions</th><th>Responses</th><th>Avg NPS</th><th>NPS Score</th><th>Public URL</th><th>Survey Code</th><th>Created At</th><th>Expiration</th>
    </tr>
    ${surveys.map(s => {
      const scores = s.responses.map(r => r.npsScore!).filter((v): v is number => v !== null)
      const promoters = scores.filter(v => v >= 9).length
      const detractors = scores.filter(v => v <= 6).length
      const nps = scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : 0
      const avgNps = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
      return `
        <tr>
          <td>SRV-${String(s.id).padStart(4, '0')}</td>
          <td>${s.title}</td>
          <td>${s.touchpoint}</td>
          <td>${s.branch ?? ''}</td>
          <td>${s.department ?? ''}</td>
          <td>${s.status}</td>
          <td>${s.lifecycleStatus}</td>
          <td>${s.createdBy.name}</td>
          <td>${s.createdBy.employeeId}</td>
          <td>${s._count.questions}</td>
          <td>${s._count.responses}</td>
          <td>${avgNps ?? ''}</td>
          <td>${nps}</td>
          <td>${s.publicUrl ?? ''}</td>
          <td>${s.surveyCode ?? ''}</td>
          <td>${formatDateTime(s.createdAt)}</td>
          <td>${formatDateTime(s.expirationDate)}</td>
        </tr>
      `
    }).join('')}
  </table>
</body>
</html>
`

        // ── PDF (Printable HTML) Generator ──
        payloadHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Surveys List Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1f2937; max-width: 1200px; margin: 0 auto; background: #fff; }
    h1 { color: #0b4a8b; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 24px; font-size: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11.5px; }
    th, td { padding: 8px 10px; border: 1px solid #e5e7eb; text-align: left; }
    th { background: #f3f4f6; font-weight: 700; color: #374151; }
    tr:nth-child(even) { background: #f9fafb; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
    <div>
      <img src="${logoDataUri}" alt="Company Logo" style="height: 50px; filter: contrast(300%) grayscale(100%) brightness(0.4) sepia(100%) hue-rotate(190deg) saturate(500%); mix-blend-mode: multiply;" onerror="this.src='/logo.svg';this.onerror=null;" />
    </div>
    <div class="no-print" style="display: flex; gap: 10px;">
      <button onclick="window.print()" style="background:#0b4a8b;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px;">Print or Save to PDF</button>
      <button onclick="window.close()" style="background:#fff;color:#4b5563;border:1px solid #d1d5db;padding:8px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px;">Close</button>
    </div>
  </div>
  <h1>Surveys List Report</h1>
  <p style="font-size: 13px; color: #4b5563; margin-bottom: 20px;">
    Generated on: ${formatDateTime(new Date())} · By: ${user.name} · Count: ${surveys.length} surveys
  </p>
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Title</th><th>Touchpoint</th><th>Branch</th><th>Department</th><th>Status</th><th>Owner</th><th>Questions</th><th>Responses</th><th>Avg NPS</th><th>NPS Score</th><th>Created At</th>
      </tr>
    </thead>
    <tbody>
      ${surveys.map(s => {
        const scores = s.responses.map(r => r.npsScore!).filter((v): v is number => v !== null)
        const promoters = scores.filter(v => v >= 9).length
        const detractors = scores.filter(v => v <= 6).length
        const nps = scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : 0
        const avgNps = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
        return `
          <tr>
            <td>SRV-${String(s.id).padStart(4, '0')}</td>
            <td><strong>${s.title}</strong></td>
            <td>${s.touchpoint}</td>
          <td>${s.branch ?? ''}</td>
          <td>${s.department ?? ''}</td>
          <td>${s.status}</td>
            <td>${s.createdBy.name}</td>
            <td>${s._count.questions}</td>
            <td>${s._count.responses}</td>
            <td>${avgNps ?? '—'}</td>
            <td><strong>${nps}</strong></td>
            <td>${formatDateTime(s.createdAt)}</td>
          </tr>
        `
      }).join('')}
    </tbody>
  </table>
  <script>
    window.onload = function() {
      setTimeout(() => window.print(), 500);
    }
  </script>
</body>
</html>
`
        break
      }

      case 'campaigns': {
        const campaignsWhere: any = {}
        const minDate = getPeriodDate(period)
        if (minDate) {
          campaignsWhere.createdAt = { gte: minDate }
        }
        if (branch && branch !== 'all' && branch !== 'All' && branch !== 'All Branches') {
          campaignsWhere.surveys = { some: { branch } }
        }
        if (department && department !== 'all' && department !== 'All' && department !== 'All Departments') {
          campaignsWhere.surveys = { some: { ...campaignsWhere.surveys?.some, department } }
        }

        const campaigns = await prisma.campaign.findMany({
          where: campaignsWhere,
          include: {
            _count: { select: { responses: true, surveys: true } },
            responses: {
              where: {
                npsScore: { not: null },
                ...(minDate ? { submittedAt: { gte: minDate } } : {})
              },
              select: { npsScore: true }
            },
            owner: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        filename = `campaigns-report-${new Date().toISOString().slice(0, 10)}`

        // ── CSV Generator ──
        payloadCsv = [
          'Campaign Code,Name,Channel,Owner,Surveys,Responses,Avg NPS,Active,Start Date,End Date',
          ...campaigns.map(c => {
            const scores = c.responses.map(r => r.npsScore!).filter((v): v is number => v !== null)
            const promoters = scores.filter(v => v >= 9).length
            const detractors = scores.filter(v => v <= 6).length
            const nps = scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : 0
            const avgNps = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
            return [
              c.code,
              `"${c.name}"`,
              c.channel,
              `"${c.owner.name}"`,
              c._count.surveys,
              c._count.responses,
              avgNps ?? '',
              nps,
              c.isActive ? 'Yes' : 'No',
              formatDateTime(c.startDate),
              formatDateTime(c.endDate),
            ].join(',')
          }),
        ].join('\n')

        // ── XLS (HTML Table) Generator ──
        payloadXls = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Campaigns</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body>
  <h2>Campaigns List Report</h2>
  <table border="1">
    <tr style="background:#0B4A8B;color:#ffffff;font-weight:bold;">
      <th>Campaign Code</th><th>Name</th><th>Channel</th><th>Owner</th><th>Surveys</th><th>Responses</th><th>Avg NPS</th><th>NPS Score</th><th>Active</th><th>Start Date</th><th>End Date</th>
    </tr>
    ${campaigns.map(c => {
      const scores = c.responses.map(r => r.npsScore!).filter((v): v is number => v !== null)
      const promoters = scores.filter(v => v >= 9).length
      const detractors = scores.filter(v => v <= 6).length
      const nps = scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : 0
      const avgNps = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
      return `
        <tr>
          <td>${c.code}</td>
          <td>${c.name}</td>
          <td>${c.channel}</td>
          <td>${c.owner.name}</td>
          <td>${c._count.surveys}</td>
          <td>${c._count.responses}</td>
          <td>${avgNps ?? ''}</td>
          <td>${nps}</td>
          <td>${c.isActive ? 'Yes' : 'No'}</td>
          <td>${formatDateTime(c.startDate)}</td>
          <td>${formatDateTime(c.endDate)}</td>
        </tr>
      `
    }).join('')}
  </table>
</body>
</html>
`

        // ── PDF (Printable HTML) Generator ──
        payloadHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Campaigns List Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1f2937; max-width: 1100px; margin: 0 auto; background: #fff; }
    h1 { color: #0b4a8b; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 24px; font-size: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11.5px; }
    th, td { padding: 8px 10px; border: 1px solid #e5e7eb; text-align: left; }
    th { background: #f3f4f6; font-weight: 700; color: #374151; }
    tr:nth-child(even) { background: #f9fafb; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
    <div>
      <img src="${logoDataUri}" alt="Company Logo" style="height: 50px; filter: contrast(300%) grayscale(100%) brightness(0.4) sepia(100%) hue-rotate(190deg) saturate(500%); mix-blend-mode: multiply;" onerror="this.src='/logo.svg';this.onerror=null;" />
    </div>
    <div class="no-print" style="display: flex; gap: 10px;">
      <button onclick="window.print()" style="background:#0b4a8b;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px;">Print or Save to PDF</button>
      <button onclick="window.close()" style="background:#fff;color:#4b5563;border:1px solid #d1d5db;padding:8px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px;">Close</button>
    </div>
  </div>
  <h1>Campaigns List Report</h1>
  <p style="font-size: 13px; color: #4b5563; margin-bottom: 20px;">
    Generated on: ${formatDateTime(new Date())} · By: ${user.name} · Count: ${campaigns.length} campaigns
  </p>
  <table>
    <thead>
      <tr>
        <th>Code</th><th>Name</th><th>Channel</th><th>Owner</th><th>Surveys</th><th>Responses</th><th>Avg NPS</th><th>NPS Score</th><th>Active</th><th>Start Date</th>
      </tr>
    </thead>
    <tbody>
      ${campaigns.map(c => {
        const scores = c.responses.map(r => r.npsScore!).filter((v): v is number => v !== null)
        const promoters = scores.filter(v => v >= 9).length
        const detractors = scores.filter(v => v <= 6).length
        const nps = scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : 0
        const avgNps = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
        return `
          <tr>
            <td><code>${c.code}</code></td>
            <td><strong>${c.name}</strong></td>
            <td>${c.channel}</td>
            <td>${c.owner.name}</td>
            <td>${c._count.surveys}</td>
            <td>${c._count.responses}</td>
            <td>${avgNps ?? '—'}</td>
            <td><strong>${nps}</strong></td>
            <td>${c.isActive ? 'Yes' : 'No'}</td>
            <td>${formatDateTime(c.startDate)}</td>
          </tr>
        `
      }).join('')}
    </tbody>
  </table>
  <script>
    window.onload = function() {
      setTimeout(() => window.print(), 500);
    }
  </script>
</body>
</html>
`
        break
      }

      default:
        return NextResponse.json({ error: 'Unknown report type' }, { status: 400 })
    }

    // ── Route Formats ──
    const formatLower = format.toLowerCase()
    if (formatLower === 'pdf') {
      return new NextResponse(payloadHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    } else if (formatLower === 'excel' || formatLower === 'xls' || formatLower === 'xlsx') {
      return new NextResponse(payloadXls, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.xls"`,
        },
      })
    } else {
      // Default fallback is CSV download
      return new NextResponse(payloadCsv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      })
    }

  } catch (error) {
    console.error('Failed to export reports:', error)
    return NextResponse.json({ error: 'Failed to export reports' }, { status: 500 })
  }
}
