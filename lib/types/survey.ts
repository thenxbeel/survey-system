// lib/types/survey.ts
//
// Survey types and constants — extracted from the former lib/mockSurveys.ts.
// All survey data now comes from /api/surveys (Prisma-backed).

export type SurveyStatus = 'draft' | 'active' | 'closed' | 'archived' | 'scheduled' | 'expired' | 'published'
export type SurveyVisibility = 'public' | 'private'

export interface SurveyRecord {
  id: string
  numericId?: number
  title: string
  description: string
  touchpoint: string
  status: string
  lifecycleStatus?: string
  visibility: SurveyVisibility
  isAnonymous?: boolean
  branch: string
  department?: string | null
  questionCount: number
  responseCount: number
  responseRate: number
  npsScore: number | null
  npsResponseCount?: number
  createdBy: string
  createdById?: number
  createdByName?: string
  createdByEmail?: string
  createdByEmployeeId?: string
  createdByDepartment?: string | null
  lastResponseAt?: string | null
  slug?: string | null
  publicUrl?: string | null
  qrCode?: string | null
  surveyCode?: string | null
  activationDate?: string | null
  expirationDate?: string | null
  remainingMs?: number | null
  campaign?: { id: number; name: string; channel: string } | null
  createdAt: string
  updatedAt: string
  expiryDate: string | null
}

export const TOUCHPOINTS = [
  'Claims Handling',
  'Policy Renewal',
  'Onboarding',
  'Customer Support',
  'Digital Experience',
  'Complaints',
] as const

export const BRANCHES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Al Ain',
  'All Branches',
] as const
