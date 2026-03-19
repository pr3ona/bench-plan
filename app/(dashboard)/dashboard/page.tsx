import { redirect } from 'next/navigation'
import { Award, TrendingUp, Briefcase } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profiles'
import { getDashboardStats, getRecentActivity, getMyTasks } from '@/lib/queries/dashboard'
import { TopNav } from '@/components/layout/TopNav'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { StatusBadge } from '@/components/tasks/StatusBadge'
import { formatDate, formatCurrency, isOverdue } from '@/lib/utils/format'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export default async function DashboardPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const [stats, activity, myTasks] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(15),
    getMyTasks(profile.id),
  ])

  const categoryPath: Record<string, string> = {
    certification: 'certifications',
    opportunity: 'opportunities',
    investment: 'investments',
  }

  return (
    <>
      <TopNav profile={profile} title={`Good to see you, ${profile.full_name?.split(' ')[0] ?? 'there'}`} />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard
            title="Certifications"
            href="/certifications"
            icon={Award}
            total={stats.certifications.total}
            accentColor="bg-blue-500"
            stats={[
              { label: 'In progress', value: stats.certifications.in_progress },
              { label: 'Review', value: stats.certifications.review },
              { label: 'Done', value: stats.certifications.done },
            ]}
          />
          <SummaryCard
            title="Opportunities"
            href="/opportunities"
            icon={TrendingUp}
            total={stats.opportunities.total}
            accentColor="bg-green-500"
            stats={[
              { label: 'Positive', value: stats.opportunities.positive_count, highlight: true },
              { label: 'Negative / Risk', value: stats.opportunities.negative_count },
              { label: 'In progress', value: stats.opportunities.in_progress },
            ]}
          />
          <SummaryCard
            title="Investments"
            href="/investments"
            icon={Briefcase}
            total={stats.investments.total}
            accentColor="bg-purple-500"
            stats={[
              { label: 'Total budget', value: formatCurrency(stats.investments.total_budget), highlight: true },
              { label: 'Total spent', value: formatCurrency(stats.investments.total_spent) },
              { label: 'Done', value: stats.investments.done },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* My tasks */}
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">My Tasks</h2>
            {myTasks.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No tasks assigned to you</p>
            ) : (
              <div className="space-y-2">
                {myTasks.map((task) => {
                  const overdue = isOverdue(task.due_date)
                  return (
                    <Link
                      key={task.id}
                      href={`/${categoryPath[task.category]}/${task.id}`}
                      className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        {task.due_date && (
                          <p className={cn('text-xs mt-0.5', overdue ? 'text-red-500' : 'text-gray-400')}>
                            Due {formatDate(task.due_date)}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={task.status as never} />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
            <ActivityFeed activity={activity as never} />
          </div>
        </div>

      </main>
    </>
  )
}
