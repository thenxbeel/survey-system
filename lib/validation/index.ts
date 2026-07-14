// lib/validation/index.ts
//
// Central Zod validation schemas for all API endpoints.
// Reused by API routes for request validation and by repositories for type safety.

import { z } from 'zod'

// ─── Auth ───────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  identifier: z.string().min(1, 'Email or Employee ID is required'),
  password:   z.string().min(1, 'Password is required'),
})

export const RegisterSchema = z.object({
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
  name:       z.string().min(3, 'Name must be at least 3 characters'),
  email:      z.string().email({ message: 'Invalid email address' }),
  password:   z.string().min(8, 'Password must be at least 8 characters'),
})

// ─── User ───────────────────────────────────────────────────────────────────

export const CreateUserSchema = z.object({
  employeeId:  z.string().min(3),
  name:        z.string().min(3),
  email:       z.string().email(),
  password:    z.string().min(8),
  phone:       z.string().optional(),
  roleId:      z.number().int().positive(),
  departmentId:z.number().int().positive().optional(),
  branchId:    z.number().int().positive().optional(),
  isActive:    z.boolean().default(true),
  visibleBranches: z.array(z.string()).optional().nullable(),
  visibleDepartments: z.array(z.string()).optional().nullable(),
  accessBranches: z.array(z.string()).optional().nullable(),
  accessDepartments: z.array(z.string()).optional().nullable(),
  allowedPages: z.array(z.string()).optional().nullable(),
})

export const UpdateUserSchema = z.object({
  name:        z.string().min(3).optional(),
  email:       z.string().email().optional(),
  phone:       z.string().optional(),
  roleId:      z.number().int().positive().optional(),
  departmentId:z.number().int().positive().optional().nullable(),
  branchId:    z.number().int().positive().optional().nullable(),
  roleName:    z.string().optional(),
  departmentName: z.string().optional(),
  isActive:    z.boolean().optional(),
  allowedPages:z.array(z.string()).optional().nullable(),
  visibleBranches: z.array(z.string()).optional().nullable(),
  visibleDepartments: z.array(z.string()).optional().nullable(),
  accessBranches: z.array(z.string()).optional().nullable(),
  accessDepartments: z.array(z.string()).optional().nullable(),
})

export const PaginationSchema = z.object({
  page:    z.coerce.number().int().min(1).default(1),
  pageSize:z.coerce.number().int().min(1).max(1000).default(10),
  search:  z.string().optional(),
  sort:    z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
})

// ─── Survey ─────────────────────────────────────────────────────────────────

export const QuestionSchema = z.object({
  id:           z.string().optional(),
  question:     z.string().min(1, 'Question text is required'),
  type:         z.string(),
  required:     z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  options:      z.array(z.object({ value: z.string() })).optional(),
})

export const CreateSurveySchema = z.object({
  title:       z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  touchpoint:  z.string().min(1, 'Touchpoint is required'),
  department:  z.string().optional(),
  branch:      z.string().optional(),
  category:    z.string().optional(),
  visibility:  z.enum(['PUBLIC', 'PRIVATE']).default('PRIVATE'),
  expiryDate:  z.string().optional(),
  questions:   z.array(QuestionSchema).optional(),
  // ── New: distribution & lifecycle ──
  isAnonymous:     z.boolean().default(false),
  requireContactInfo: z.boolean().default(false),
  campaignId:      z.number().int().positive().optional(),
  activationDate:  z.string().optional(),      // ISO datetime
  expirationDate:  z.string().optional(),      // ISO datetime
  availabilityMode: z.enum(['always', 'expires', 'custom'])
                    .default('always'),
  expiresInDays:   z.number().int().positive().optional(), // 1,3,7,14,30,60,90
  distributionChannel: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'QR_CODE', 'DIRECT_LINK'])
                    .default('DIRECT_LINK'),
  // When true, immediately generate slug + publicUrl + QR + publish.
  // When false (default), survey is created in DRAFT lifecycle state.
  publish: z.boolean().default(false),
})

export const UpdateSurveySchema = CreateSurveySchema.partial().extend({
  status: z.enum(['draft', 'published', 'active', 'archived']).optional(),
  lifecycleStatus: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'EXPIRED', 'CLOSED', 'ARCHIVED'])
                    .optional(),
})

// ── Survey lifecycle transitions ──

export const PublishSurveySchema = z.object({
  // Override availability at publish time (optional)
  availabilityMode: z.enum(['always', 'expires', 'custom']).optional(),
  expiresInDays:    z.number().int().positive().optional(),
  activationDate:   z.string().optional(),
  expirationDate:   z.string().optional(),
  // Regenerate URL/QR even if they already exist
  regenerateUrl:    z.boolean().default(false),
  regenerateQr:     z.boolean().default(false),
})

export const ExtendExpirationSchema = z.object({
  // Add this many days to the current expirationDate (or now() if none).
  addDays: z.number().int().positive().max(365).optional(),
  // OR set an absolute new expiration date
  newExpirationDate: z.string().optional(),
}).refine(
  (data) => Boolean(data.addDays) || Boolean(data.newExpirationDate),
  { message: 'Provide either addDays or newExpirationDate' },
)

export const ScheduleSurveySchema = z.object({
  activationDate: z.string(),
  expirationDate: z.string().optional(),
})

// ─── Response ───────────────────────────────────────────────────────────────
//
// After the Customer & Follow-up refactor, every survey submission creates
// ONE Response record. Optional respondent info (name, email, phone) is
// stored directly on the Response row — there is no Customer table.

export const CreateResponseSchema = z.object({
  surveyId:      z.number().int().positive(),
  // ── Optional respondent info (stored on the Response row only) ──
  customerName:  z.string().optional(),       // mapped to respondentName
  customerEmail: z.string().email().optional().or(z.literal('')),  // mapped to respondentEmail
  customerPhone: z.string().optional(),       // mapped to respondentPhone
  npsScore:      z.number().int().min(0).max(10).optional(),
  csatScore:     z.number().int().min(1).max(5).optional(),
  cesScore:      z.number().int().min(1).max(5).optional(),
  feedback:      z.string().optional(),
  channel:       z.string().optional(),
  distributionChannel: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'QR_CODE', 'DIRECT_LINK', 'WEB'])
                       .optional(),
  campaignId:    z.number().int().positive().optional().nullable(),
  answers:       z.array(z.object({
    questionId: z.number().int(),
    answer:     z.string(),
  })).optional(),
})

// ── Public response submission (no auth, slug-based) ──

export const PublicResponseSchema = z.object({
  // Optional respondent info — stored on the Response row only.
  // NO customer record is ever created.
  customerName:       z.string().optional(),
  customerEmail:      z.string().email().optional().or(z.literal('')),
  customerPhone:      z.string().optional(),
  // NPS / scores
  npsScore:           z.number().int().min(0).max(10).optional(),
  csatScore:          z.number().int().min(1).max(5).optional(),
  cesScore:           z.number().int().min(1).max(5).optional(),
  feedback:           z.string().optional(),
  // Question answers
  answers: z.array(z.object({
    questionId: z.number().int(),
    answer:     z.string(),
  })).optional(),
  // Optional: client-provided channel (e.g. when QR survey opened from SMS link)
  distributionChannel: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'QR_CODE', 'DIRECT_LINK', 'WEB'])
                       .optional(),
})

// ─── Campaign ───────────────────────────────────────────────────────────────

export const CreateCampaignSchema = z.object({
  name:        z.string().min(1, 'Campaign name is required'),
  description: z.string().nullable().optional(),
  channel:     z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'QR_CODE', 'DIRECT_LINK'])
               .default('DIRECT_LINK'),
  startDate:   z.string().optional(),
  endDate:     z.string().optional(),
  isActive:    z.boolean().default(true),
})

export const UpdateCampaignSchema = CreateCampaignSchema.partial()

// ─── Notification ───────────────────────────────────────────────────────────

export const CreateNotificationSchema = z.object({
  title:    z.string().min(1),
  message:  z.string().min(1),
  category: z.string().default('system'),
  link:     z.string().optional(),
  userId:   z.number().int().positive(),
})

// ─── Helper ─────────────────────────────────────────────────────────────────

export function parsePagination(searchParams: URLSearchParams) {
  const parsed = PaginationSchema.safeParse({
    page: searchParams.get("page") ?? 1,
    pageSize: searchParams.get("pageSize") ?? 10,
    search: searchParams.get("search") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    sortDir: searchParams.get("sortDir") ?? "asc",
  })

  if (!parsed.success) {
    console.error("Pagination validation failed:", parsed.error.flatten())

    return {
      page: 1,
      pageSize: 100,
      search: undefined,
      sort: undefined,
      sortDir: "asc" as const,
    }
  }

  return parsed.data
}

export type PaginationParams = z.infer<typeof PaginationSchema>
