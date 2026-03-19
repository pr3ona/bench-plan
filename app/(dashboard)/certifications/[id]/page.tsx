import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTask } from '@/lib/queries/tasks'
import { getAllProfiles, getCurrentProfile } from '@/lib/queries/profiles'
import { TopNav } from '@/components/layout/TopNav'
import { TaskDetailView } from '@/components/tasks/TaskDetailView'

export default async function CertificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [task, profile, profiles] = await Promise.all([
    getTask(id),
    getCurrentProfile(),
    getAllProfiles(),
  ])

  if (!task || task.category !== 'certification') notFound()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data: comments } = await supabase
    .from('comments')
    .select('*, author:profiles(*)')
    .eq('task_id', id)
    .order('created_at', { ascending: true })

  const { data: activity } = await supabase
    .from('activity_log')
    .select('*, actor:profiles(*)')
    .eq('task_id', id)
    .order('created_at', { ascending: false })

  return (
    <>
      <TopNav profile={profile} title="Certifications" />
      <main className="flex-1 overflow-y-auto p-6">
        <TaskDetailView
          task={task}
          profiles={profiles}
          comments={(comments ?? []) as never}
          activity={(activity ?? []) as never}
          currentUserId={profile.id}
          category="certification"
        />
      </main>
    </>
  )
}
