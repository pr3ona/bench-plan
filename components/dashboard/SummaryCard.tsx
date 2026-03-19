import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface StatRow {
  label: string
  value: string | number
  highlight?: boolean
}

interface SummaryCardProps {
  title: string
  href: string
  icon: LucideIcon
  total: number
  stats: StatRow[]
  accentColor: string
}

export function SummaryCard({ title, href, icon: Icon, total, stats, accentColor }: SummaryCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
            <div className={`p-2 rounded-lg ${accentColor}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-400">total tasks</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{s.label}</span>
                <span className={s.highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
