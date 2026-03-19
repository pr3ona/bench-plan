import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { INVESTMENT_TYPES } from '@/lib/types/app.types'
import type { Investment } from '@/lib/types/app.types'

interface InvestmentFieldsProps {
  defaults?: Partial<Investment>
}

export function InvestmentFields({ defaults }: InvestmentFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="investment-type">Investment Type</Label>
          <Select name="inv_investment_type" defaultValue={defaults?.investment_type ?? ''}>
            <SelectTrigger id="investment-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {INVESTMENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sponsor">Business Sponsor</Label>
          <Input id="sponsor" name="inv_sponsor" placeholder="John Doe" defaultValue={defaults?.sponsor ?? ''} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget ($)</Label>
          <Input id="budget" name="inv_budget" type="number" min="0" step="0.01" placeholder="100000" defaultValue={defaults?.budget ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="spent">Spent ($)</Label>
          <Input id="spent" name="inv_spent" type="number" min="0" step="0.01" placeholder="0" defaultValue={defaults?.spent ?? '0'} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="roi-estimate">ROI Estimate (%)</Label>
          <Input id="roi-estimate" name="inv_roi_estimate" type="number" step="0.1" placeholder="15" defaultValue={defaults?.roi_estimate ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="roi-actual">ROI Actual (%)</Label>
          <Input id="roi-actual" name="inv_roi_actual" type="number" step="0.1" placeholder="0" defaultValue={defaults?.roi_actual ?? ''} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-case">Business Case</Label>
        <Textarea
          id="business-case"
          name="inv_business_case"
          placeholder="Describe the business justification…"
          rows={3}
          defaultValue={defaults?.business_case ?? ''}
        />
      </div>
    </div>
  )
}
