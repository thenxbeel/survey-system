// Module 3 — Responses mock data (no API / Prisma)

export type NpsCategory = 'promoter' | 'passive' | 'detractor'
export type ResponseStatus = 'new' | 'reviewed' | 'actioned' | 'closed'
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

// ─── helpers ────────────────────────────────────────────────────────────────

function npsCategory(score: number): NpsCategory {
  if (score >= 9) return 'promoter'
  if (score >= 7) return 'passive'
  return 'detractor'
}

function sentiment(score: number): Sentiment {
  if (score >= 9) return 'positive'
  if (score >= 7) return 'neutral'
  return 'negative'
}

function iso(daysAgo: number, hour = 10, min = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

const SURVEYS = [
  { id: 'srv_001', title: 'Post-Claims NPS Survey' },
  { id: 'srv_002', title: 'Policy Renewal Feedback' },
  { id: 'srv_003', title: 'Onboarding Experience' },
  { id: 'srv_004', title: 'Digital Portal Satisfaction' },
  { id: 'srv_005', title: 'Customer Support Quality' },
]

const TOUCHPOINTS = [
  'Claims Handling',
  'Policy Renewal',
  'Onboarding',
  'Customer Support',
  'Digital Experience',
  'Complaints',
]

const BRANCHES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Al Ain']

const DEPARTMENTS = [
  'Customer Experience',
  'Claims',
  'Underwriting',
  'Sales',
  'Operations',
]

const AGENTS = [
  'Sara Al Mansoori',
  'Ahmed Khalid',
  'Fatima Hassan',
  'Omar Al Rashid',
  null,
  null,
]

const CUSTOMERS: { name: string; email: string; phone?: string }[] = [
  { name: 'Mohammed Al Hamdan', email: 'mohammed.hamdan@email.com', phone: '+971 50 123 4567' },
  { name: 'Layla Nasser', email: 'layla.nasser@email.com', phone: '+971 55 987 6543' },
  { name: 'Khalid Ibrahim', email: 'k.ibrahim@email.com', phone: '+971 50 234 5678' },
  { name: 'Aisha Al Bloushi', email: 'aisha.bloushi@email.com' },
  { name: 'Tariq Mahmoud', email: 'tariq.m@gmail.com', phone: '+971 56 345 6789' },
  { name: 'Nour Al Zaabi', email: 'nour.alzaabi@email.com', phone: '+971 50 456 7890' },
  { name: 'Saeed Al Marzouqi', email: 'saeed.alm@email.com' },
  { name: 'Hessa Al Falasi', email: 'h.falasi@email.com', phone: '+971 54 567 8901' },
  { name: 'Yousif Al Kaabi', email: 'yousif.kaabi@gmail.com', phone: '+971 50 678 9012' },
  { name: 'Mariam Al Shamsi', email: 'mariam.shamsi@email.com' },
  { name: 'Abdulla Al Nuaimi', email: 'abdulla.nuaimi@email.com', phone: '+971 55 789 0123' },
  { name: 'Reem Al Mazrouei', email: 'reem.mazrouei@email.com', phone: '+971 50 890 1234' },
  { name: 'Faisal Al Muhairi', email: 'faisal.muhairi@email.com' },
  { name: 'Dana Al Suwaidi', email: 'dana.suwaidi@email.com', phone: '+971 56 901 2345' },
  { name: 'Hamad Al Mansouri', email: 'hamad.m@email.com', phone: '+971 50 012 3456' },
  { name: 'Sara Al Ketbi', email: 'sara.ketbi@gmail.com' },
  { name: 'Omar Al Qubaisi', email: 'omar.qubaisi@email.com', phone: '+971 55 123 4568' },
  { name: 'Fatima Al Rashidi', email: 'fatima.rashidi@email.com', phone: '+971 50 234 5679' },
  { name: 'Ali Al Dhaheri', email: 'ali.dhaheri@email.com' },
  { name: 'Noura Al Ameri', email: 'noura.ameri@email.com', phone: '+971 54 345 6780' },
  { name: 'Jassim Al Yafei', email: 'jassim.yafei@email.com', phone: '+971 50 456 7891' },
  { name: 'Maitha Al Shamsi', email: 'maitha.shamsi@email.com' },
  { name: 'Waleed Al Khoury', email: 'waleed.khoury@gmail.com', phone: '+971 55 567 8902' },
  { name: 'Asma Al Junaibi', email: 'asma.junaibi@email.com', phone: '+971 50 678 9013' },
  { name: 'Rashid Al Menhali', email: 'rashid.menhali@email.com' },
  { name: 'Kholoud Al Romaithi', email: 'kholoud.romaithi@email.com', phone: '+971 56 789 0124' },
  { name: 'Majed Al Zarooni', email: 'majed.zarooni@email.com', phone: '+971 50 890 1235' },
  { name: 'Shaikha Al Shamali', email: 'shaikha.shamali@email.com' },
  { name: 'Humaid Al Otaibi', email: 'humaid.otaibi@email.com', phone: '+971 55 901 2346' },
  { name: 'Afra Al Mazmi', email: 'afra.mazmi@email.com', phone: '+971 50 012 3457' },
  { name: 'Saif Al Jaberi', email: 'saif.jaberi@email.com' },
  { name: 'Shamma Al Marri', email: 'shamma.marri@gmail.com', phone: '+971 54 123 4569' },
  { name: 'Obaid Al Falahi', email: 'obaid.falahi@email.com', phone: '+971 50 234 5670' },
  { name: 'Hana Al Qasimi', email: 'hana.qasimi@email.com' },
  { name: 'Essa Al Subousi', email: 'essa.subousi@email.com', phone: '+971 55 345 6781' },
  { name: 'Latifa Al Mehairi', email: 'latifa.mehairi@email.com', phone: '+971 50 456 7892' },
  { name: 'Sultan Al Bastaki', email: 'sultan.bastaki@email.com' },
  { name: 'Ghalia Al Hosani', email: 'ghalia.hosani@email.com', phone: '+971 56 567 8903' },
  { name: 'Muzna Al Falasi', email: 'muzna.falasi@email.com', phone: '+971 50 678 9014' },
  { name: 'Hareb Al Matrooshi', email: 'hareb.matrooshi@email.com' },
]

const COMMENTS_POSITIVE = [
  'The team was incredibly helpful and resolved my claim faster than expected. Highly recommend!',
  'Smooth renewal process. The agent explained everything clearly and professionally.',
  'Outstanding digital experience. The portal is intuitive and the response was quick.',
  'Very satisfied with the support team. They went above and beyond to help me.',
  'The onboarding process was seamless. Very impressed with the professionalism.',
]

const COMMENTS_NEUTRAL = [
  'Service was okay. The wait time was a bit long but the issue was eventually resolved.',
  'Average experience. Nothing exceptional but the problem was handled.',
  'The process could be faster, but overall the staff were polite and helpful.',
  'Decent service. I expected a quicker resolution but acceptable overall.',
  'Standard experience. The agent was professional but the process took longer than expected.',
]

const COMMENTS_NEGATIVE = [
  'Very disappointed with the wait time. Had to follow up multiple times before getting a response.',
  'The claims process was unnecessarily complicated. Need to simplify the documentation.',
  'Poor communication from the team. Nobody followed up as promised.',
  'Frustrated with the slow response. Issues took far too long to resolve.',
  'Unclear process and poor coordination between departments. Needs major improvement.',
]

const STATUSES: ResponseStatus[] = ['new', 'reviewed', 'actioned', 'closed']

function makeTimeline(submittedAt: string, status: ResponseStatus, assignee: string | null): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: 'ev_1',
      type: 'submitted',
      label: 'Response submitted',
      at: submittedAt,
    },
  ]
  if (status === 'reviewed' || status === 'actioned' || status === 'closed') {
    const d = new Date(submittedAt)
    d.setHours(d.getHours() + 2)
    events.push({ id: 'ev_2', type: 'reviewed', label: 'Marked as reviewed', by: 'System', at: d.toISOString() })
  }
  if ((status === 'actioned' || status === 'closed') && assignee) {
    const d = new Date(submittedAt)
    d.setHours(d.getHours() + 5)
    events.push({ id: 'ev_3', type: 'assigned', label: `Assigned to ${assignee}`, by: 'Sara Al Mansoori', at: d.toISOString() })
  }
  if (status === 'closed') {
    const d = new Date(submittedAt)
    d.setDate(d.getDate() + 2)
    events.push({ id: 'ev_4', type: 'resolved', label: 'Case resolved and closed', by: assignee ?? 'System', at: d.toISOString() })
  }
  return events
}

function makeAnswers(surveyTitle: string, npsScore: number): ResponseAnswer[] {
  return [
    {
      questionId: 'q1',
      questionTitle: 'How likely are you to recommend us to a friend or colleague?',
      questionType: 'nps',
      answer: npsScore,
    },
    {
      questionId: 'q2',
      questionTitle: 'What was the primary reason for your score?',
      questionType: 'short_answer',
      answer:
        npsScore >= 9
          ? 'Excellent service and quick resolution'
          : npsScore >= 7
          ? 'Good experience overall, minor delays'
          : 'Slow response and poor communication',
    },
    {
      questionId: 'q3',
      questionTitle: 'Which area of service did we excel in?',
      questionType: 'multiple_choice',
      answer:
        npsScore >= 9
          ? 'Speed of resolution'
          : npsScore >= 7
          ? 'Staff professionalism'
          : 'None of the above',
    },
    {
      questionId: 'q4',
      questionTitle: 'Would you use our services again?',
      questionType: 'yes_no',
      answer: npsScore >= 7 ? 'Yes' : 'No',
    },
  ]
}

// ─── generate 40 records ─────────────────────────────────────────────────────

function pickIdx<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

function makeRecord(i: number): ResponseRecord {
  const customer = CUSTOMERS[i % CUSTOMERS.length]
  const survey = pickIdx(SURVEYS, i * 3 + 1)
  const tp = pickIdx(TOUCHPOINTS, i * 7)
  const branch = pickIdx(BRANCHES, i * 5)
  const dept = pickIdx(DEPARTMENTS, i * 11)
  const score = [10, 9, 9, 8, 8, 7, 6, 5, 4, 3, 2, 1, 10, 9, 8, 7, 5, 3, 9, 10, 8, 6, 4, 2, 9, 8, 7, 5, 10, 3, 8, 9, 7, 4, 6, 10, 2, 8, 9, 5][i] ?? 7
  const cat = npsCategory(score)
  const sent = sentiment(score)
  const daysAgo = Math.floor(i * 1.2) + 1
  const submittedAt = iso(daysAgo, 8 + (i % 8), (i * 13) % 60)
  const statusArr: ResponseStatus[] = score >= 9 ? ['new', 'reviewed'] : score >= 7 ? ['reviewed', 'actioned'] : ['new', 'reviewed', 'actioned', 'closed']
  const status = pickIdx(statusArr, i)
  const assignedTo = score < 7 ? (AGENTS[i % (AGENTS.length - 2)] ?? null) : null
  const commentsArr = sent === 'positive' ? COMMENTS_POSITIVE : sent === 'neutral' ? COMMENTS_NEUTRAL : COMMENTS_NEGATIVE
  const comments = commentsArr[i % commentsArr.length]

  return {
    id: `resp_${String(i + 1).padStart(3, '0')}`,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    surveyId: survey.id,
    surveyTitle: survey.title,
    touchpoint: tp,
    branch,
    department: dept,
    npsScore: score,
    npsCategory: cat,
    sentiment: sent,
    status,
    assignedTo,
    submittedAt,
    answers: makeAnswers(survey.title, score),
    comments,
    timeline: makeTimeline(submittedAt, status, assignedTo),
  }
}

export const mockResponses: ResponseRecord[] = Array.from({ length: 40 }, (_, i) => makeRecord(i))

// ─── aggregated stats ─────────────────────────────────────────────────────────

export function computeResponseStats(responses: ResponseRecord[]) {
  const total = responses.length
  const promoters = responses.filter((r) => r.npsCategory === 'promoter').length
  const passives = responses.filter((r) => r.npsCategory === 'passive').length
  const detractors = responses.filter((r) => r.npsCategory === 'detractor').length
  const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0
  const avgScore = total > 0 ? +(responses.reduce((s, r) => s + r.npsScore, 0) / total).toFixed(1) : 0
  // simulate a response rate
  const responseRate = 68
  return { total, promoters, passives, detractors, nps, avgScore, responseRate }
}

export const RESPONSE_TOUCHPOINTS = ['All', ...Array.from(new Set(mockResponses.map((r) => r.touchpoint)))]
export const RESPONSE_BRANCHES = ['All', ...Array.from(new Set(mockResponses.map((r) => r.branch)))]
export const RESPONSE_DEPARTMENTS = ['All', ...Array.from(new Set(mockResponses.map((r) => r.department)))]
export const RESPONSE_SURVEYS = ['All', ...Array.from(new Set(mockResponses.map((r) => r.surveyTitle)))]
