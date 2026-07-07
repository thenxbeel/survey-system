import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * GET /api/users/export?format=csv|xlsx
 *
 * Exports the currently filtered user list as a downloadable file.
 *
 * Supported formats:
 *   - csv  (default): standard CSV with UTF-8 BOM (Excel-friendly)
 *   - xlsx: SpreadsheetML XML (Excel 2003 XML format, opens in Excel/LibreOffice
 *           without requiring a binary XLSX writer dependency)
 *
 * Filter parameters (same as /api/users):
 *   search, role, roleId, branchId, departmentId, status, isActive
 *
 * Columns exported:
 *   Employee ID, Name, Email, Phone, Role, Department, Branch,
 *   Status, Active/Inactive, Last Login, Created Date, Updated Date,
 *   Cases Assigned, Cases Resolved, Cases Handled, Open Cases,
 *   Permissions
 */
export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser(req)
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const format = (req.nextUrl.searchParams.get('format') ?? 'csv').toLowerCase()
  if (format !== 'csv' && format !== 'xlsx') {
    return NextResponse.json({ error: 'Unsupported format. Use csv or xlsx.' }, { status: 400 })
  }

  // ── Parse filters ──
  const search       = req.nextUrl.searchParams.get('search') ?? ''
  const role         = req.nextUrl.searchParams.get('role')         // role name
  const roleIdParam  = req.nextUrl.searchParams.get('roleId')
  const branchId     = req.nextUrl.searchParams.get('branchId')
  const departmentId = req.nextUrl.searchParams.get('departmentId')
  const statusParam  = req.nextUrl.searchParams.get('status')       // 'active' | 'inactive' | 'suspended' | 'pending'
  const isActive     = req.nextUrl.searchParams.get('isActive')

  const where: any = {}
  if (search) {
    where.OR = [
      { name:       { contains: search } },
      { email:      { contains: search } },
      { employeeId: { contains: search } },
    ]
  }
  if (roleIdParam)     where.roleId       = parseInt(roleIdParam)
  if (branchId)        where.branchId     = parseInt(branchId)
  if (departmentId)    where.departmentId = parseInt(departmentId)
  if (isActive !== null && isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true'
  }
  if (statusParam && statusParam !== 'all') {
    where.status = statusParam.toUpperCase()
  }
  // If a role name is given (instead of id), resolve it
  if (role && role !== 'all' && !roleIdParam) {
    const roleRow = await prisma.role.findUnique({ where: { name: role } })
    if (roleRow) where.roleId = roleRow.id
  }

  // ── Fetch users ──
  const users = await prisma.user.findMany({
    where,
    include: {
      role: true,
      department: true,
      branch: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // ── Compute per-user case counts ──
  const userIds = users.map(u => u.id)
  const responses = await prisma.response.findMany({
    where: { survey: { createdById: { in: userIds } } },
    select: { status: true, survey: { select: { createdById: true } } },
  })

  const RESOLVED_STATUSES = ['resolved', 'closed', 'completed']
  const HANDLED_STATUSES   = ['resolved', 'closed', 'completed', 'in_progress', 'reopened']

  const caseMap: Record<number, { assigned: number; handled: number; resolved: number; open: number }> = {}
  for (const id of userIds) caseMap[id] = { assigned: 0, handled: 0, resolved: 0, open: 0 }
  for (const r of responses) {
    const ownerId = r.survey.createdById
    const entry = caseMap[ownerId]
    if (!entry) continue
    const s = (r.status ?? 'new').toLowerCase()
    const isResolved = RESOLVED_STATUSES.includes(s)
    const isHandled  = HANDLED_STATUSES.includes(s)
    entry.assigned++
    if (isHandled)  entry.handled++
    if (isResolved) entry.resolved++
    if (!isHandled) entry.open++
  }

  // ── Build row dataset ──
  const rows = users.map(u => {
    const c = caseMap[u.id] ?? { assigned: 0, handled: 0, resolved: 0, open: 0 }
    return {
      'Employee ID':     u.employeeId,
      'Name':            u.name,
      'Email':           u.email,
      'Phone':           u.phone ?? '',
      'Role':            u.role.name,
      'Department':      u.department?.name ?? '—',
      'Branch':          u.branch?.name ?? '—',
      'Active/Inactive': u.isActive ? 'Active' : 'Inactive',
      'Last Login':      u.lastLogin ? u.lastLogin.toISOString() : 'Never',
      'Created Date':    u.createdAt.toISOString(),
      'Updated Date':    u.updatedAt.toISOString(),
      'Cases Assigned':  c.assigned,
      'Cases Resolved':  c.resolved,
      'Cases Handled':   c.handled,
      'Open Cases':      c.open,
      'Permissions':     `Role:${u.role.name}`,
    }
  })

  // ── Build filename ──
  const dateStamp = new Date().toISOString().slice(0, 10)
  const filename = `users-export-${dateStamp}.${format === 'csv' ? 'csv' : 'xml'}`

  if (format === 'csv') {
    const csv = buildCsv(rows)
    return new NextResponse('\uFEFF' + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  // xlsx → SpreadsheetML XML
  const xml = buildXlsxXml(rows)
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

// ── CSV builder ──────────────────────────────────────────────────────────────

function buildCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: string | number) => {
    const s = String(v ?? '')
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ]
  return lines.join('\n')
}

// ── XLSX (SpreadsheetML 2003 XML) builder ────────────────────────────────────
// Opens natively in Excel and LibreOffice. No external deps needed.

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildXlsxXml(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) rows = [{ 'No Data': '' }]
  const headers = Object.keys(rows[0])

  const headerCells = headers
    .map(h => `<Cell><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`)
    .join('')

  const dataRows = rows
    .map(r => {
      const cells = headers
        .map(h => {
          const v = r[h]
          if (typeof v === 'number' && Number.isFinite(v)) {
            return `<Cell><Data ss:Type="Number">${v}</Data></Cell>`
          }
          return `<Cell><Data ss:Type="String">${xmlEscape(String(v ?? ''))}</Data></Cell>`
        })
        .join('')
      return `<Row>${cells}</Row>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="Users">
    <Table>
      <Row>${headerCells}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`
}
