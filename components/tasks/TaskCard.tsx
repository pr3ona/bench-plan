'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import type { TaskWithRelations } from '@/lib/types/app.types'
import { StatusBadge } from './StatusBadge'
import { PriorityIcon } from './PriorityIcon'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatDate, isOverdue } from '@/lib/utils/format'

const categoryHref: Record<string, string> = {
  certification: 'certifications',
  opportunity: 'opportunities',
  investment: 'investments',
}

interface TaskCardProps {
  task: TaskWithRelations
  isDragging?: boolean
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: dndDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const href = `/${categoryHref[task.category]}/${task.id}`
  const overdue = isOverdue(task.due_date)
  const assigneeInitials = task.assignee?.full_name
    ? task.assignee.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : task.assignee?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing',
        'hover:shadow-md transition-shadow',
        (isDragging || dndDragging) && 'opacity-50 shadow-lg rotate-1'
      )}
    >
      <Link href={href} onClick={(e) => e.stopPropagation()} className="block">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{task.title}</p>
          <PriorityIcon priority={task.priority} />
        </div>

        {task.progress > 0 && (
          <div className="mb-2">
            <Progress value={task.progress} className="h-1.5" />
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {task.due_date && (
              <span className={cn('flex items-center gap-1 text-xs', overdue ? 'text-red-600' : 'text-gray-500')}>
                <Calendar className="h-3 w-3" />
                {formatDate(task.due_date)}
              </span>
            )}
            {task.comment_count > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MessageSquare className="h-3 w-3" />
                {task.comment_count}
              </span>
            )}
          </div>

          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">{assigneeInitials}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </Link>
    </div>
  )
}
