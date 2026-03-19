import type { Database } from './database.types'

type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']
export type Task = Tables['tasks']['Row']
export type Certification = Tables['certifications']['Row']
export type Opportunity = Tables['opportunities']['Row']
export type Investment = Tables['internal_investments']['Row']
export type Comment = Tables['comments']['Row']
export type ActivityLog = Tables['activity_log']['Row']
export type TaskCollaborator = Tables['task_collaborators']['Row']

export type Category = Task['category']
export type TaskStatus = Task['status']
export type TaskPriority = Task['priority']
export type OpportunityType = Opportunity['type']

export type TaskWithRelations = Task & {
  assignee: Profile | null
  creator: Profile | null
  certification: Certification | null
  opportunity: Opportunity | null
  investment: Investment | null
  comment_count: number
}

export type CommentWithAuthor = Comment & {
  author: Profile
}

export type ActivityWithActor = ActivityLog & {
  actor: Profile
}

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'certification', label: 'Certifications', color: 'blue' },
  { value: 'opportunity', label: 'Opportunities', color: 'green' },
  { value: 'investment', label: 'Internal Investments', color: 'purple' },
]

export const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export const CERT_PROVIDERS = [
  'AWS', 'Google Cloud', 'Microsoft Azure', 'Salesforce',
  'CompTIA', 'Cisco', 'PMI', 'Scrum Alliance', 'Other',
]

export const OPPORTUNITY_STAGES: { value: string; label: string }[] = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
]

export const INVESTMENT_TYPES: { value: string; label: string }[] = [
  { value: 'tooling', label: 'Tooling' },
  { value: 'training', label: 'Training' },
  { value: 'headcount', label: 'Headcount' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'process', label: 'Process' },
  { value: 'other', label: 'Other' },
]

export const KANBAN_COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']
