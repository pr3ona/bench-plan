import { Badge } from '@/components/ui/badge'
import type { TaskStatus } from '@/lib/types/app.types'
import { cn } from '@/lib/utils/cn'

const styles: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  in_progress: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  review: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  done: 'bg-green-100 text-green-700 hover:bg-green-100',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
}

const labels: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
  cancelled: 'Cancelled',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge className={cn('font-medium text-xs', styles[status])}>
      {labels[status]}
    </Badge>
  )
}
