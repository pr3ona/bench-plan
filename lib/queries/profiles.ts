import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types/app.types'

// cache() deduplicates within a single request — profile is fetched in both
// the dashboard layout AND each page, so this prevents a double round-trip.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
})

// unstable_cache persists across requests — profiles rarely change and are
// the same for all users, so a 60-second cache is safe.
export const getAllProfiles = unstable_cache(
  async (): Promise<Profile[]> => {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')

    return data ?? []
  },
  ['all-profiles'],
  { revalidate: 60, tags: ['profiles'] }
)
