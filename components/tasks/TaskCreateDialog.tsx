'use client'

import { useState, useRef, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { createTask } from '@/lib/actions/tasks'
import { upsertCertification, upsertOpportunity, upsertInvestment } from '@/lib/actions/category-details'
import type { Category } from '@/lib/types/app.types'
import { CATEGORIES, PRIORITIES, STATUSES } from '@/lib/types/app.types'
import { CertificationFields } from '@/components/certifications/CertificationFields'
import { OpportunityFields } from '@/components/opportunities/OpportunityFields'
import { InvestmentFields } from '@/components/investments/InvestmentFields'
import type { Profile } from '@/lib/types/app.types'

interface TaskCreateDialogProps {
  defaultCategory?: Category
  profiles: Profile[]
}

export function TaskCreateDialog({ defaultCategory, profiles }: TaskCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<Category>(defaultCategory ?? 'certification')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('category', category)

    startTransition(async () => {
      try {
        const task = await createTask(formData)

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

        setOpen(false)
        formRef.current?.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Base UI uses render prop instead of asChild */}
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New task
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required placeholder="Task title" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} placeholder="Optional description…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as Category)}
                name="category"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue="todo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select name="assignee_id">
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name ?? p.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-date">Due date</Label>
            <Input id="due-date" name="due_date" type="date" />
          </div>

          <Separator />
          <p className="text-sm font-semibold text-gray-700">
            {category === 'certification' && 'Certification Details'}
            {category === 'opportunity' && 'Opportunity Details'}
            {category === 'investment' && 'Investment Details'}
          </p>

          {category === 'certification' && <CertificationFields />}
          {category === 'opportunity' && <OpportunityFields />}
          {category === 'investment' && <InvestmentFields />}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
