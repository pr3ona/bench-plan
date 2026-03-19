'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types/app.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile.email.slice(0, 2).toUpperCase()

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id)

      if (error) {
        setError(error.message)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">{profile.full_name ?? 'No name set'}</p>
              <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile.email} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-400">Email cannot be changed here</p>
          </div>

          <Button type="submit" disabled={isPending}>
            {saved ? 'Saved!' : isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
