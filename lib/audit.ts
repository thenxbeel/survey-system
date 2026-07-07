// lib/audit.ts
//
// Survey audit log helper. Wraps `prisma.surveyAuditLog.create()` with sane
// defaults so callers don't have to repeat themselves. Used by every survey
// lifecycle API route.

import { prisma } from '@/lib/prisma'

export type SurveyAuditAction =
  | 'SURVEY_CREATED'
  | 'SURVEY_PUBLISHED'
  | 'SURVEY_SCHEDULED'
  | 'URL_GENERATED'
  | 'QR_GENERATED'
  | 'QR_REGENERATED'
  | 'URL_SHARED'
  | 'SURVEY_URL_COPIED'
  | 'SURVEY_EDITED'
  | 'SURVEY_ACTIVATED'
  | 'SURVEY_DEACTIVATED'
  | 'SURVEY_REACTIVATED'
  | 'SURVEY_EXPIRED'
  | 'SURVEY_CLOSED'
  | 'SURVEY_ARCHIVED'
  | 'EXPIRATION_EXTENDED'
  | 'RESPONSE_RECEIVED'
  | 'LAST_RESPONSE'
  | 'LAST_MODIFIED'

export interface AuditContext {
  /** Actor user ID — null when the action is taken by an anonymous submitter. */
  actorId?: number | null
  /** Free-form human-readable details, e.g. "Shared via WhatsApp to +971...". */
  details?: string | null
  /** Structured metadata, e.g. `{ channel: 'WHATSAPP', recipient: '+97150...' }`. */
  metadata?: Record<string, unknown> | null
  /** Captured from the incoming request — useful for security forensics. */
  ipAddress?: string | null
  userAgent?: string | null
}

/**
 * Append an audit log entry for a survey.
 *
 * Safe to call from any API route — never throws (errors are logged but do
 * not propagate, so a failed audit write cannot break a successful survey
 * publish).
 */
export async function recordSurveyAudit(
  surveyId: number,
  action: SurveyAuditAction | string,
  ctx: AuditContext = {},
): Promise<void> {
  try {
    await prisma.surveyAuditLog.create({
      data: {
        surveyId,
        action,
        details: ctx.details ?? null,
        metadata: ctx.metadata ? JSON.stringify(ctx.metadata) : null,
        ipAddress: ctx.ipAddress ?? null,
        userAgent: ctx.userAgent ?? null,
        actorId: ctx.actorId ?? null,
      },
    })
  } catch (err) {
    // Audit failures must never break the calling operation.
    console.error(`[audit] failed to record ${action} for survey ${surveyId}:`, err)
  }
}

/**
 * Standard audit actions list — used by the audit log viewer's filter UI.
 */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  SURVEY_CREATED: 'Survey Created',
  SURVEY_PUBLISHED: 'Survey Published',
  SURVEY_SCHEDULED: 'Survey Scheduled',
  URL_GENERATED: 'URL Generated',
  QR_GENERATED: 'QR Generated',
  QR_REGENERATED: 'QR Regenerated',
  URL_SHARED: 'URL Shared',
  SURVEY_URL_COPIED: 'Survey URL Copied',
  SURVEY_EDITED: 'Survey Edited',
  SURVEY_ACTIVATED: 'Survey Activated',
  SURVEY_DEACTIVATED: 'Survey Deactivated',
  SURVEY_REACTIVATED: 'Survey Reactivated',
  SURVEY_EXPIRED: 'Survey Expired',
  SURVEY_CLOSED: 'Survey Closed',
  SURVEY_ARCHIVED: 'Survey Archived',
  EXPIRATION_EXTENDED: 'Expiration Extended',
  RESPONSE_RECEIVED: 'Response Received',
  LAST_RESPONSE: 'Last Response',
  LAST_MODIFIED: 'Last Modified',
}
