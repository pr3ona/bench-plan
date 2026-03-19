import { AlertCircle, ArrowDown, ArrowUp, Minus } from 'lucide-react'
import type { TaskPriority } from '@/lib/types/app.types'
import { cn } from '@/lib/utils/cn'

const config: Record<TaskPriority, { icon: React.ElementType; color: string; label: string }> = {
  low: { icon: ArrowDown, color: 'text-gray-400', label: 'Low' },
  medium: { icon: Minus, color: 'text-yellow-500', label: 'Medium' },
  high: { icon: ArrowUp, color: 'text-orange-500', label: 'High' },
  urgent: { icon: AlertCircle, color: 'text-red-500', label: 'Urgent' },
}

export function PriorityIcon({ priority, showLabel = false }: { priority: TaskPriority; showLabel?: boolean }) {
  const { icon: Icon, color, label } = config[priority]
  return (
    <span className={cn('flex items-center gap-1 text-xs font-medium', color)}>
      <Icon className="h-3.5 w-3.5" />
      {showLabel && label}
    </span>
  )
}
