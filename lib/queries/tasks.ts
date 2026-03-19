import { createClient } from '@/lib/supabase/server'
import type { TaskWithRelations } from '@/lib/types/app.types'

export async function getTasks(category?: string, status?: string): Promise<TaskWithRelations[]> {
  const supabase = await createClient()

  let query = supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(*),
      creator:profiles!tasks_created_by_fkey(*),
      certification:certifications(*),
      opportunity:opportunities(*),
      investment:internal_investments(*)
    `)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error

  // Add comment counts
  const taskIds = (data ?? []).map((t) => t.id)
  let commentCounts: Record<string, number> = {}

  if (taskIds.length > 0) {
    const { data: counts } = await supabase
      .from('comments')
      .select('task_id')
      .in('task_id', taskIds)

    commentCounts = (counts ?? []).reduce<Record<string, number>>((acc, c) => {
      acc[c.task_id] = (acc[c.task_id] ?? 0) + 1
      return acc
    }, {})
  }

  return (data ?? []).map((t) => ({
    ...t,
    comment_count: commentCounts[t.id] ?? 0,
  })) as TaskWithRelations[]
}

export async function getTask(id: string): Promise<TaskWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(*),
      creator:profiles!tasks_created_by_fkey(*),
      certification:certifications(*),
      opportunity:opportunities(*),
      investment:internal_investments(*)
    `)
    .eq('id', id)
    .single()

  if (error) return null

  const { data: counts } = await supabase
    .from('comments')
    .select('id')
    .eq('task_id', id)

  return {
    ...data,
    comment_count: counts?.length ?? 0,
  } as TaskWithRelations
}
