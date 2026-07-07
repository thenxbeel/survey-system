// Survey Builder — local mock types (no Prisma / API)

export type QuestionType =
  | 'nps'
  | 'short_answer'
  | 'long_answer'
  | 'multiple_choice'
  | 'checkbox'
  | 'dropdown'
  | 'yes_no'
  | 'email'
  | 'phone'
  | 'date'

export interface QuestionOption {
  id: string
  label: string
}

export interface SurveyQuestion {
  id: string
  type: QuestionType
  title: string
  helpText: string
  required: boolean
  options: QuestionOption[] // for multiple_choice, checkbox, dropdown
}

export interface SurveyDraft {
  title: string
  description: string
  touchpoint: string
  department: string
  branch: string
  visibility: 'public' | 'private'
  expiryDate: string
  questions: SurveyQuestion[]
}

export const QUESTION_TYPE_META: Record<
  QuestionType,
  { label: string; icon: string; description: string }
> = {
  nps:             { label: 'NPS Rating',       icon: '⭐', description: '0–10 scale' },
  short_answer:    { label: 'Short Answer',      icon: '✏️', description: 'Single line text' },
  long_answer:     { label: 'Long Answer',       icon: '📝', description: 'Multi-line text' },
  multiple_choice: { label: 'Multiple Choice',   icon: '◉',  description: 'Pick one option' },
  checkbox:        { label: 'Checkbox',          icon: '☑️', description: 'Pick multiple' },
  dropdown:        { label: 'Dropdown',          icon: '▾',  description: 'Select from list' },
  yes_no:          { label: 'Yes / No',          icon: '⚡', description: 'Binary choice' },
  email:           { label: 'Email',             icon: '✉️', description: 'Email address' },
  phone:           { label: 'Phone',             icon: '📱', description: 'Phone number' },
  date:            { label: 'Date',              icon: '📅', description: 'Date picker' },
}

export const DEPARTMENTS = [
  'Customer Experience',
  'Claims',
  'Underwriting',
  'Sales',
  'Operations',
  'IT',
  'Finance',
  'HR',
]

export const TOUCHPOINTS = [
  'Claims Handling',
  'Policy Renewal',
  'Onboarding',
  'Customer Support',
  'Digital Experience',
  'Complaints',
]

export const BRANCHES = [
  'All Branches',
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Al Ain',
]

export function createQuestion(type: QuestionType): SurveyQuestion {
  const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const needsOptions = ['multiple_choice', 'checkbox', 'dropdown'].includes(type)
  return {
    id,
    type,
    title: '',
    helpText: '',
    required: false,
    options: needsOptions
      ? [
          { id: `opt_${id}_1`, label: 'Option 1' },
          { id: `opt_${id}_2`, label: 'Option 2' },
        ]
      : [],
  }
}

export const EMPTY_DRAFT: SurveyDraft = {
  title: '',
  description: '',
  touchpoint: '',
  department: '',
  branch: 'All Branches',
  visibility: 'public',
  expiryDate: '',
  questions: [],
}
