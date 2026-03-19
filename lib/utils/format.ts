import { format, formatDistanceToNow, isPast, isToday } from 'date-fns'

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateRelative(date: string | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isOverdue(date: string | null | undefined): boolean {
  if (!date) return false
  const d = new Date(date)
  return isPast(d) && !isToday(d)
}

export function formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value}%`
}

export function statusLabel(status: string): string {
  return {
    todo: 'Todo',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
    cancelled: 'Cancelled',
  }[status] ?? status
}

export function priorityLabel(priority: string): string {
  return {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  }[priority] ?? priority
}
