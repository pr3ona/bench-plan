'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function upsertCertification(taskId: string, data: {
  provider?: string | null
  exam_name?: string | null
  exam_code?: string | null
  target_date?: string | null
  exam_date?: string | null
  passed?: boolean
  score?: number | null
  cost?: number | null
  study_hours?: number | null
  voucher_code?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const clean = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('certifications')
    .upsert({ task_id: taskId, ...clean }, { onConflict: 'task_id' })

  if (error) throw new Error(error.message)

  revalidatePath(`/certifications/${taskId}`)
}

export async function upsertOpportunity(taskId: string, data: {
  type?: 'positive' | 'negative'
  deal_size?: number | null
  currency?: string
  stage?: string | null
  client_name?: string | null
  contact_name?: string | null
  probability?: number | null
  close_date?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const clean = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('opportunities')
    .upsert({ task_id: taskId, ...clean }, { onConflict: 'task_id' })

  if (error) throw new Error(error.message)

  revalidatePath(`/opportunities/${taskId}`)
}

export async function upsertInvestment(taskId: string, data: {
  investment_type?: string | null
  budget?: number | null
  spent?: number
  currency?: string
  roi_estimate?: number | null
  roi_actual?: number | null
  sponsor?: string | null
  business_case?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const clean = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('internal_investments')
    .upsert({ task_id: taskId, ...clean }, { onConflict: 'task_id' })

  if (error) throw new Error(error.message)

  revalidatePath(`/investments/${taskId}`)
}
