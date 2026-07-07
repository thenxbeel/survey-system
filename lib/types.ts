import { LucideIcon } from 'lucide-react';

export type QuestionType = 'NPS_RATING' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'DROPDOWN' | 'YES_NO' | 'EMAIL' | 'PHONE' | 'DATE';

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  label: string;
  helpText?: string;
  required: boolean;
  options?: string[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  department: string;
  branch: string;
  touchpoint: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  expiry: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  questions: SurveyQuestion[];
}

export interface NpsResponse {
  id: string;
  customerName: string;
  customerEmail: string;
  touchpoint: string;
  score: number;
  feedback: string;
  submittedAt: string;
  status: 'NEW' | 'REVIEWED' | 'ESCALATED';
}

export interface FollowUpCase {
  id: string;
  customerName: string;
  assignedTo: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
  dueDate: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  avgNps: number;
  totalSurveys: number;
  policies: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
  department: string;
  branch: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Department {
  id: string;
  name: string;
  branchCount: number;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface Touchpoint {
  id: string;
  name: string;
  description: string;
}