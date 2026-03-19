import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types/app.types'

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  return data ?? []
}
