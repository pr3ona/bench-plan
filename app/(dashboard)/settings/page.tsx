import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/queries/profiles'
import { TopNav } from '@/components/layout/TopNav'
import { SettingsForm } from './SettingsForm'

export default async function SettingsPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  return (
    <>
      <TopNav profile={profile} title="Settings" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg space-y-6">
          <SettingsForm profile={profile} />
        </div>
      </main>
    </>
  )
}
