'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateCommentSchema = z.object({
  task_id: z.string().uuid(),
  body: z.string().min(1),
  parent_id: z.string().uuid().nullable().optional(),
  category: z.string(),
})

export async function createComment(data: {
  task_id: string
  body: string
  parent_id?: string | null
  category: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = CreateCommentSchema.parse(data)

  const { error } = await supabase.from('comments').insert({
    task_id: parsed.task_id,
    body: parsed.body,
    parent_id: parsed.parent_id ?? null,
    author_id: user.id,
  })

  if (error) throw new Error(error.message)

  await supabase.from('activity_log').insert({
    task_id: parsed.task_id,
    actor_id: user.id,
    action: 'commented',
  })

  revalidatePath(`/${parsed.category}s/${parsed.task_id}`)
}

export async function deleteComment(id: string, task_id: string, category: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/${category}s/${task_id}`)
}
