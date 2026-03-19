'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  Award,
  TrendingUp,
  Briefcase,
  Settings,
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/certifications', label: 'Certifications', icon: Award },
  { href: '/opportunities', label: 'Opportunities', icon: TrendingUp },
  { href: '/investments', label: 'Investments', icon: Briefcase },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 border-r bg-white flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b">
        <span className="text-lg font-bold tracking-tight text-gray-900">Bench Plan</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
