import { formatDateRelative } from '@/lib/utils/format'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type ActivityItem = {
  id: string
  action: string
  field_name: string | null
  old_value: string | null
  new_value: string | null
  created_at: string
  actor: { full_name: string | null; email: string; avatar_url: string | null }
}

function describeAction(item: ActivityItem): string {
  switch (item.action) {
    case 'created': return 'created this task'
    case 'status_changed': return `changed status to ${item.new_value}`
    case 'assigned': return item.new_value ? `assigned to ${item.new_value}` : 'unassigned'
    case 'commented': return 'left a comment'
    case 'progress_updated': return `updated progress to ${item.new_value}%`
    case 'field_updated': return `updated ${item.field_name}`
    case 'collaborator_added': return 'added a collaborator'
    default: return item.action
  }
}

interface ActivityFeedProps {
  activity: ActivityItem[]
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  if (activity.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
  }

  return (
    <div className="space-y-3">
      {activity.map((item) => {
        const initials = item.actor.full_name
          ? item.actor.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
          : item.actor.email.slice(0, 2).toUpperCase()

        return (
          <div key={item.id} className="flex gap-3 items-start">
            <Avatar className="h-6 w-6 shrink-0 mt-0.5">
              <AvatarImage src={item.actor.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-sm text-gray-600 flex-1 min-w-0">
              <span className="font-medium text-gray-900">
                {item.actor.full_name ?? item.actor.email}
              </span>{' '}
              {describeAction(item)}
              <span className="text-gray-400 ml-2 text-xs">{formatDateRelative(item.created_at)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
