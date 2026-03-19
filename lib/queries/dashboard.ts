import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface CategoryStats {
  total: number
  todo: number
  in_progress: number
  review: number
  done: number
}

export interface DashboardData {
  certifications: CategoryStats
  opportunities: CategoryStats & { positive_count: number; negative_count: number }
  investments: CategoryStats & { total_budget: number; total_spent: number }
}

// Cache dashboard stats for 30 seconds — invalidated by the 'tasks' tag
// whenever a task is created/updated/deleted via a Server Action.
export const getDashboardStats = unstable_cache(
  async (): Promise<DashboardData> => {
    const supabase = await createClient()

    // Fetch all three tables in parallel
    const [{ data: tasks }, { data: investments }, { data: opportunities }] =
      await Promise.all([
        supabase.from('tasks').select('id, category, status'),
        supabase.from('internal_investments').select('task_id, budget, spent'),
        supabase.from('opportunities').select('task_id, type'),
      ])

    const allTasks = tasks ?? []
    const allInvestments = investments ?? []
    const allOpps = opportunities ?? []

    function statsFor(category: string): CategoryStats {
      const cat = allTasks.filter((t) => t.category === category)
      return {
        total: cat.length,
        todo: cat.filter((t) => t.status === 'todo').length,
        in_progress: cat.filter((t) => t.status === 'in_progress').length,
        review: cat.filter((t) => t.status === 'review').length,
        done: cat.filter((t) => t.status === 'done').length,
      }
    }

    const oppTaskIds = new Set(allTasks.filter((t) => t.category === 'opportunity').map((t) => t.id))
    const positive_count = allOpps.filter((o) => oppTaskIds.has(o.task_id) && o.type === 'positive').length
    const negative_count = allOpps.filter((o) => oppTaskIds.has(o.task_id) && o.type === 'negative').length

    const investTaskIds = new Set(allTasks.filter((t) => t.category === 'investment').map((t) => t.id))
    const total_budget = allInvestments
      .filter((i) => investTaskIds.has(i.task_id))
      .reduce((s, i) => s + (i.budget ?? 0), 0)
    const total_spent = allInvestments
      .filter((i) => investTaskIds.has(i.task_id))
      .reduce((s, i) => s + (i.spent ?? 0), 0)

    return {
      certifications: statsFor('certification'),
      opportunities: { ...statsFor('opportunity'), positive_count, negative_count },
      investments: { ...statsFor('investment'), total_budget, total_spent },
    }
  },
  ['dashboard-stats'],
  { revalidate: 30, tags: ['tasks'] }
)

export async function getRecentActivity(limit = 20) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('activity_log')
    .select('*, actor:profiles(*), task:tasks(id, title, category)')
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function getMyTasks(userId: string): Promise<{
  id: string
  title: string
  status: string
  due_date: string | null
  category: string
}[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select('id, title, status, due_date, category')
    .eq('assignee_id', userId)
    .not('status', 'in', '(done,cancelled)')
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(10)

  return (data ?? []) as {
    id: string
    title: string
    status: string
    due_date: string | null
    category: string
  }[]
}
