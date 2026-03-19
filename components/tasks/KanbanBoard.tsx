'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { TaskWithRelations, TaskStatus } from '@/lib/types/app.types'
import { TaskCard } from './TaskCard'
import { updateTaskStatus } from '@/lib/actions/tasks'
import { KANBAN_COLUMNS, STATUSES } from '@/lib/types/app.types'
import { cn } from '@/lib/utils/cn'

interface KanbanBoardProps {
  tasks: TaskWithRelations[]
}

function KanbanColumn({
  status,
  tasks,
}: {
  status: TaskStatus
  tasks: TaskWithRelations[]
}) {
  const label = STATUSES.find((s) => s.value === status)?.label ?? status

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          className={cn(
            'flex flex-col gap-2 min-h-[120px] rounded-lg p-2 bg-gray-50',
            tasks.length === 0 && 'border-2 border-dashed border-gray-200'
          )}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard({ tasks: initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function getStatusForTask(taskId: string): TaskStatus {
    return tasks.find((t) => t.id === taskId)?.status ?? 'todo'
  }

  function onDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = String(active.id)
    const overId = String(over.id)

    // Determine target column: over could be a column id or a task id
    const targetStatus = KANBAN_COLUMNS.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : getStatusForTask(overId)

    const currentStatus = getStatusForTask(taskId)
    if (targetStatus === currentStatus) return

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    )

    startTransition(async () => {
      try {
        await updateTaskStatus(taskId, targetStatus)
      } catch {
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: currentStatus } : t))
        )
      }
    })
  }

  const columnTasks = (status: TaskStatus) => tasks.filter((t) => t.status === status)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn key={status} status={status} tasks={columnTasks(status)} />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 shadow-xl">
            <TaskCard task={activeTask} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
