import type { UserRole, UserStatus } from '@/lib/types/user'
import { ROLE_META } from '@/lib/types/user'

// ─── Role Badge ─────────────────────────────────────────────────────────────

export function RoleBadge({ role }: { role: UserRole }) {
  const meta = ROLE_META[role] || { color: '#4A5568' }
  const color = meta.color
  return (
    <span
      className="inline-flex items-center gap-2.5 rounded-[5px] border px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: `${color}1A`, borderColor: `${color}40`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {role}
    </span>
  )
}

// ─── User Status Badge ──────────────────────────────────────────────────────

const STATUS_STYLES: Record<UserStatus, { cls: string; dot: string; label: string }> = {
  active:    { cls: 'bg-[var(--tint-emerald)] border-[rgba(23,166,115,0.3)] text-[var(--emerald)]',  dot: 'var(--emerald)',  label: 'Active'    },
  inactive:  { cls: 'bg-[var(--bg-subtle)]    border-[var(--border)]         text-[var(--text-light)]', dot: 'var(--text-light)', label: 'Inactive'  },
  suspended: { cls: 'bg-[var(--tint-red)]     border-[rgba(229,72,77,0.3)]   text-[var(--red)]',       dot: 'var(--red)',     label: 'Suspended' },
  pending:   { cls: 'bg-[var(--tint-amber)]   border-[rgba(245,166,35,0.3)]  text-[var(--tint-amber-fg)]', dot: '#F5A623',     label: 'Pending'   },
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const cfg = STATUS_STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-[5px] border px-2 py-0.5 text-[11px] font-semibold ${cfg.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}
