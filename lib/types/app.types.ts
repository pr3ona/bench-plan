// Manual type definitions — will be replaced by generated types after supabase db push

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'member'
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  title: string
  description: string | null
  category: 'certification' | 'opportunity' | 'investment'
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress: number
  due_date: string | null
  created_by: string
  assignee_id: string | null
  created_at: string
  updated_at: string
}

export type Certification = {
  id: string
  task_id: string
  provider: string | null
  exam_name: string | null
  exam_code: string | null
  target_date: string | null
  exam_date: string | null
  passed: boolean
  score: number | null
  cost: number | null
  study_hours: number | null
  voucher_code: string | null
}

export type Opportunity = {
  id: string
  task_id: string
  type: 'positive' | 'negative'
  deal_size: number | null
  currency: string
  stage: 'prospecting' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | null
  client_name: string | null
  contact_name: string | null
  probability: number | null
  close_date: string | null
}

export type Investment = {
  id: string
  task_id: string
  investment_type: 'tooling' | 'training' | 'headcount' | 'infrastructure' | 'process' | 'other' | null
  budget: number | null
  spent: number
  currency: string
  roi_estimate: number | null
  roi_actual: number | null
  sponsor: string | null
  business_case: string | null
}

export type Comment = {
  id: string
  task_id: string
  author_id: string
  parent_id: string | null
  body: string
  edited: boolean
  created_at: string
  updated_at: string
}

export type ActivityLog = {
  id: string
  task_id: string
  actor_id: string
  action: 'created' | 'status_changed' | 'assigned' | 'commented' | 'progress_updated' | 'field_updated' | 'collaborator_added'
  field_name: string | null
  old_value: string | null
  new_value: string | null
  created_at: string
}

export type TaskCollaborator = {
  task_id: string
  user_id: string
  role: 'editor' | 'viewer'
  added_at: string
}

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
