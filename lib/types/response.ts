// lib/types/response.ts
//
// Response types & helpers — extracted from the former lib/mockResponses.ts.
// All response data now comes from /api/responses (Prisma-backed).

export type NpsCategory = 'promoter' | 'passive' | 'detractor'
export type ResponseStatus = 'new' | 'reviewed' | 'actioned' | 'closed' | 'solved'
export type Sentiment = 'positive' | 'neutral' | 'negative'

export interface ResponseAnswer {
  questionId: string
  questionTitle: string
  questionType: string
  answer: string | number | string[]
}

export interface TimelineEvent {
  id: string
  type: 'submitted' | 'reviewed' | 'assigned' | 'note' | 'resolved'
  label: string
  by?: string
  at: string // ISO
}

export interface ResponseRecord {
  id: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  surveyId: string
  surveyTitle: string
  touchpoint: string
  branch: string
  department: string
  npsScore: number
  npsCategory: NpsCategory
  sentiment: Sentiment
  status: ResponseStatus
  assignedTo: string | null
  submittedAt: string // ISO
  answers: ResponseAnswer[]
  comments: string
  timeline: TimelineEvent[]
}

export function computeResponseStats(responses: ResponseRecord[]) {
  const total = responses.length
  const promoters = responses.filter(r => r.npsScore >= 9).length
  const passives = responses.filter(r => r.npsScore >= 7 && r.npsScore <= 8).length
  const detractors = responses.filter(r => r.npsScore <= 6).length
  const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0
  const scored = responses.filter(r => r.npsScore !== null)
  const avgScore = scored.length > 0
    ? Math.round((scored.reduce((s, r) => s + r.npsScore, 0) / scored.length) * 10) / 10
    : 0
  const responseRate = total > 0 ? 50 : 0 // heuristic
  return { total, promoters, passives, detractors, nps, avgScore, responseRate }
}

// Dynamic filter option lists — populated at runtime from the API
export const RESPONSE_TOUCHPOINTS = ['All']
export const RESPONSE_BRANCHES = ['All']
export const RESPONSE_DEPARTMENTS = ['All']
export const RESPONSE_SURVEYS = ['All']
