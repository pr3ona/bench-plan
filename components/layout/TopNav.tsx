import type { Profile } from '@/lib/types/app.types'
import { UserMenu } from './UserMenu'

interface TopNavProps {
  profile: Profile
  title: string
  actions?: React.ReactNode
}

export function TopNav({ profile, title, actions }: TopNavProps) {
  return (
    <header className="h-14 border-b bg-white flex items-center px-6 gap-4 shrink-0">
      <h1 className="text-base font-semibold text-gray-900 flex-1">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
      <UserMenu profile={profile} />
    </header>
  )
}
