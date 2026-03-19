import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CERT_PROVIDERS } from '@/lib/types/app.types'
import type { Certification } from '@/lib/types/app.types'

interface CertificationFieldsProps {
  defaults?: Partial<Certification>
}

export function CertificationFields({ defaults }: CertificationFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Select name="cert_provider" defaultValue={defaults?.provider ?? ''}>
            <SelectTrigger id="provider">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {CERT_PROVIDERS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="exam-code">Exam Code</Label>
          <Input id="exam-code" name="cert_exam_code" placeholder="e.g. SAA-C03" defaultValue={defaults?.exam_code ?? ''} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="exam-name">Exam Name</Label>
        <Input id="exam-name" name="cert_exam_name" placeholder="e.g. AWS Solutions Architect" defaultValue={defaults?.exam_name ?? ''} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target-date">Target Date</Label>
          <Input id="target-date" name="cert_target_date" type="date" defaultValue={defaults?.target_date ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exam-date">Exam Date</Label>
          <Input id="exam-date" name="cert_exam_date" type="date" defaultValue={defaults?.exam_date ?? ''} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost">Cost ($)</Label>
          <Input id="cost" name="cert_cost" type="number" min="0" step="0.01" placeholder="300" defaultValue={defaults?.cost ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="study-hours">Study Hours</Label>
          <Input id="study-hours" name="cert_study_hours" type="number" min="0" placeholder="40" defaultValue={defaults?.study_hours ?? ''} />
        </div>
      </div>
    </div>
  )
}
