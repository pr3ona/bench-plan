import { redirect } from 'next/navigation'
import { getTasks } from '@/lib/queries/tasks'
import { getCurrentProfile, getAllProfiles } from '@/lib/queries/profiles'
import { TopNav } from '@/components/layout/TopNav'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskCreateDialog } from '@/components/tasks/TaskCreateDialog'

export default async function InvestmentsPage() {
  const [profile, tasks, profiles] = await Promise.all([
    getCurrentProfile(),
    getTasks('investment'),
    getAllProfiles(),
  ])

  if (!profile) redirect('/login')

  return (
    <>
      <TopNav
        profile={profile}
        title="Internal Investments"
        actions={
          <TaskCreateDialog defaultCategory="investment" profiles={profiles} />
        }
      />
      <main className="flex-1 overflow-auto p-6">
        <KanbanBoard tasks={tasks} />
      </main>
    </>
  )
}
