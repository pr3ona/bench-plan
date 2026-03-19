'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { TaskStatus } from '@/lib/types/app.types'

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(['certification', 'opportunity', 'investment']),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'cancelled']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  progress: z.coerce.number().min(0).max(100).default(0),
  due_date: z.string().nullable().optional(),
  assignee_id: z.string().uuid().nullable().optional(),
})

const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  id: z.string().uuid(),
})

async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  taskId: string,
  actorId: string,
  action: string,
  fieldName?: string,
  oldValue?: string,
  newValue?: string
) {
  await supabase.from('activity_log').insert({
    task_id: taskId,
    actor_id: actorId,
    action: action as never,
    field_name: fieldName ?? null,
    old_value: oldValue ?? null,
    new_value: newValue ?? null,
  })
}

export async function createTask(formData: FormData): Promise<{ id: string; category: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const raw = Object.fromEntries(formData.entries())
  const parsed = CreateTaskSchema.parse({
    ...raw,
    progress: raw.progress ? Number(raw.progress) : 0,
    due_date: raw.due_date || null,
    assignee_id: raw.assignee_id || null,
  })

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({ ...parsed, created_by: user.id })
    .select()
    .single()

  if (error || !task) throw new Error(error?.message ?? 'Failed to create task')

  await logActivity(supabase, task.id, user.id, 'created')

  revalidateTag('tasks')
  revalidatePath(`/${parsed.category}s`)
  revalidatePath('/dashboard')

  return { id: task.id, category: task.category }
}

export async function updateTask(data: {
  id: string
  title?: string
  description?: string
  status?: TaskStatus
  priority?: string
  progress?: number
  due_date?: string | null
  assignee_id?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = UpdateTaskSchema.parse(data)
  const { id, ...updates } = parsed

  // Get current task to log diffs
  const { data: current } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Task not found')

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Log changed fields
  if (updates.status && updates.status !== current.status) {
    await logActivity(supabase, id, user.id, 'status_changed', 'status', current.status, updates.status)
  }
  if (updates.assignee_id !== undefined && updates.assignee_id !== current.assignee_id) {
    await logActivity(supabase, id, user.id, 'assigned', 'assignee_id', current.assignee_id ?? '', updates.assignee_id ?? '')
  }
  if (updates.progress !== undefined && updates.progress !== current.progress) {
    await logActivity(supabase, id, user.id, 'progress_updated', 'progress', String(current.progress), String(updates.progress))
  }

  revalidateTag('tasks')
  revalidatePath(`/${current.category}s`)
  revalidatePath(`/${current.category}s/${id}`)
  revalidatePath('/dashboard')
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  return updateTask({ id, status })
}

export async function deleteTask(id: string, category: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) throw new Error(error.message)

  revalidateTag('tasks')
  revalidatePath(`/${category}s`)
  revalidatePath('/dashboard')
}
