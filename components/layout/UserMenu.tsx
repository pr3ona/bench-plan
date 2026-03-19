'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/app.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, User } from 'lucide-react'
import { useRouter as useNextRouter } from 'next/navigation'
import Link from 'next/link'

export function UserMenu({ profile }: { profile: Profile }) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile.email.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      {/* Base UI Trigger renders as a button natively — no asChild needed */}
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-100 transition-colors cursor-pointer">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {profile.full_name ?? profile.email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{profile.full_name ?? 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Base UI uses render prop instead of asChild */}
        <DropdownMenuItem render={<Link href="/settings" />}>
          <User className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={signOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
