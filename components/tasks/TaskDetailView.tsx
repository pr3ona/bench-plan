'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import type { TaskWithRelations, CommentWithAuthor, Profile } from '@/lib/types/app.types'
import { StatusBadge } from './StatusBadge'
import { PriorityIcon } from './PriorityIcon'
import { updateTask } from '@/lib/actions/tasks'
import { upsertCertification, upsertOpportunity, upsertInvestment } from '@/lib/actions/category-details'
import { CommentThread } from '@/components/comments/CommentThread'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { CertificationFields } from '@/components/certifications/CertificationFields'
import { OpportunityFields } from '@/components/opportunities/OpportunityFields'
import { InvestmentFields } from '@/components/investments/InvestmentFields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { PRIORITIES, STATUSES } from '@/lib/types/app.types'
import { formatDate, isOverdue } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface TaskDetailViewProps {
  task: TaskWithRelations
  profiles: Profile[]
  comments: CommentWithAuthor[]
  activity: never[]
  currentUserId: string
  category: string
}

const categoryBackPath: Record<string, string> = {
  certification: '/certifications',
  opportunity: '/opportunities',
  investment: '/investments',
}

export function TaskDetailView({
  task,
  profiles,
  comments,
  activity,
  currentUserId,
  category,
}: TaskDetailViewProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [isPending, startTransition] = useTransition()
  const [savedIndicator, setSavedIndicator] = useState(false)

  function showSaved() {
    setSavedIndicator(true)
    setTimeout(() => setSavedIndicator(false), 2000)
  }

  function saveField(data: Parameters<typeof updateTask>[0]) {
    startTransition(async () => {
      await updateTask(data)
      showSaved()
    })
  }

  function saveCategoryDetails(formData: FormData) {
    startTransition(async () => {
      if (category === 'certification') {
        await upsertCertification(task.id, {
          provider: formData.get('cert_provider') as string || null,
          exam_name: formData.get('cert_exam_name') as string || null,
          exam_code: formData.get('cert_exam_code') as string || null,
          target_date: formData.get('cert_target_date') as string || null,
          exam_date: formData.get('cert_exam_date') as string || null,
          cost: formData.get('cert_cost') ? Number(formData.get('cert_cost')) : null,
          study_hours: formData.get('cert_study_hours') ? Number(formData.get('cert_study_hours')) : null,
        })
      } else if (category === 'opportunity') {
        await upsertOpportunity(task.id, {
          type: (formData.get('opp_type') as 'positive' | 'negative') ?? 'positive',
          client_name: formData.get('opp_client_name') as string || null,
          contact_name: formData.get('opp_contact_name') as string || null,
          deal_size: formData.get('opp_deal_size') ? Number(formData.get('opp_deal_size')) : null,
          probability: formData.get('opp_probability') ? Number(formData.get('opp_probability')) : null,
          stage: formData.get('opp_stage') as string || null,
          close_date: formData.get('opp_close_date') as string || null,
        })
      } else if (category === 'investment') {
        await upsertInvestment(task.id, {
          investment_type: formData.get('inv_investment_type') as string || null,
          sponsor: formData.get('inv_sponsor') as string || null,
          budget: formData.get('inv_budget') ? Number(formData.get('inv_budget')) : null,
          spent: formData.get('inv_spent') ? Number(formData.get('inv_spent')) : 0,
          roi_estimate: formData.get('inv_roi_estimate') ? Number(formData.get('inv_roi_estimate')) : null,
          business_case: formData.get('inv_business_case') as string || null,
        })
      }
      showSaved()
    })
  }

  const overdue = isOverdue(task.due_date)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href={categoryBackPath[category] ?? '/dashboard'}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content — left 2 cols */}
        <div className="col-span-2 space-y-6">
          {/* Title */}
          <div>
            {editingTitle ? (
              <div className="flex gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-semibold"
                  autoFocus
                  onBlur={() => {
                    setEditingTitle(false)
                    if (title !== task.title) saveField({ id: task.id, title })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setEditingTitle(false)
                      if (title !== task.title) saveField({ id: task.id, title })
                    }
                    if (e.key === 'Escape') {
                      setTitle(task.title)
                      setEditingTitle(false)
                    }
                  }}
                />
              </div>
            ) : (
              <h2
                className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-50 rounded p-1 -ml-1"
                onClick={() => setEditingTitle(true)}
              >
                {title}
              </h2>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add a description…"
              onBlur={() => {
                if (description !== (task.description ?? '')) {
                  saveField({ id: task.id, description })
                }
              }}
            />
          </div>

          {/* Category-specific fields */}
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {category === 'certification' && 'Certification Details'}
              {category === 'opportunity' && 'Opportunity Details'}
              {category === 'investment' && 'Investment Details'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveCategoryDetails(new FormData(e.currentTarget))
              }}
            >
              {category === 'certification' && (
                <CertificationFields defaults={task.certification ?? undefined} />
              )}
              {category === 'opportunity' && (
                <OpportunityFields defaults={task.opportunity ?? undefined} />
              )}
              {category === 'investment' && (
                <InvestmentFields defaults={task.investment ?? undefined} />
              )}
              <div className="flex justify-end mt-4">
                <Button size="sm" type="submit" disabled={isPending} variant="outline">
                  Save details
                </Button>
              </div>
            </form>
          </div>

          {/* Comments + Activity */}
          <Tabs defaultValue="comments">
            <TabsList>
              <TabsTrigger value="comments">
                Comments {comments.length > 0 && `(${comments.length})`}
              </TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="mt-4">
              <CommentThread
                comments={comments}
                taskId={task.id}
                category={category}
                currentUserId={currentUserId}
              />
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <ActivityFeed activity={activity as never} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar — right col */}
        <div className="space-y-5">
          {savedIndicator && (
            <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1 text-center">
              Saved
            </div>
          )}

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Status</Label>
            <Select
              defaultValue={task.status}
              onValueChange={(v) => saveField({ id: task.id, status: v as never })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Priority</Label>
            <Select
              defaultValue={task.priority ?? undefined}
              onValueChange={(v) => v && saveField({ id: task.id, priority: v as string })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Progress: {task.progress}%</Label>
            <Progress value={task.progress} className="h-2" />
            <Input
              type="range"
              min={0}
              max={100}
              step={5}
              defaultValue={task.progress}
              className="w-full accent-primary h-4"
              onChange={(e) => saveField({ id: task.id, progress: Number(e.target.value) })}
            />
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Assignee</Label>
            <Select
              defaultValue={task.assignee_id ?? ''}
              onValueChange={(v) => saveField({ id: task.id, assignee_id: v || null })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name ?? p.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {task.assignee && (
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task.assignee.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[9px]">
                    {(task.assignee.full_name ?? task.assignee.email).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600">{task.assignee.full_name ?? task.assignee.email}</span>
              </div>
            )}
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Due date</Label>
            <Input
              type="date"
              defaultValue={task.due_date ?? ''}
              className={cn('h-8 text-sm', overdue && 'border-red-400 text-red-600')}
              onBlur={(e) => saveField({ id: task.id, due_date: e.target.value || null })}
            />
          </div>

          {/* Created by */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Created by</Label>
            <p className="text-sm text-gray-700">
              {task.creator?.full_name ?? task.creator?.email ?? '—'}
            </p>
            <p className="text-xs text-gray-400">{formatDate(task.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
