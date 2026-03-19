import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OPPORTUNITY_STAGES } from '@/lib/types/app.types'
import type { Opportunity } from '@/lib/types/app.types'

interface OpportunityFieldsProps {
  defaults?: Partial<Opportunity>
}

export function OpportunityFields({ defaults }: OpportunityFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Opportunity Type</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="opp_type"
              value="positive"
              defaultChecked={!defaults?.type || defaults.type === 'positive'}
              className="accent-green-600"
            />
            <span className="text-sm font-medium text-green-700">Positive</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="opp_type"
              value="negative"
              defaultChecked={defaults?.type === 'negative'}
              className="accent-red-600"
            />
            <span className="text-sm font-medium text-red-700">Negative / Risk</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client-name">Client Name</Label>
          <Input id="client-name" name="opp_client_name" placeholder="Acme Corp" defaultValue={defaults?.client_name ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-name">Contact Name</Label>
          <Input id="contact-name" name="opp_contact_name" placeholder="Jane Smith" defaultValue={defaults?.contact_name ?? ''} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deal-size">Deal Size ($)</Label>
          <Input id="deal-size" name="opp_deal_size" type="number" min="0" step="0.01" placeholder="50000" defaultValue={defaults?.deal_size ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="probability">Probability (%)</Label>
          <Input id="probability" name="opp_probability" type="number" min="0" max="100" placeholder="50" defaultValue={defaults?.probability ?? ''} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <Select name="opp_stage" defaultValue={defaults?.stage ?? ''}>
            <SelectTrigger id="stage">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {OPPORTUNITY_STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="close-date">Close Date</Label>
          <Input id="close-date" name="opp_close_date" type="date" defaultValue={defaults?.close_date ?? ''} />
        </div>
      </div>
    </div>
  )
}
