import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/logout-button'
import { ProfileForm } from '@/components/settings/profile-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  // getClaims verifies the JWT on the server; never trust client state here.
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) redirect('/auth/login?next=/settings')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          ← Feedme
        </Link>
        <LogoutButton />
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">설정</CardTitle>
          <CardDescription>{claims?.claims.email} 계정으로 로그인했어요.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm displayName={profile?.display_name ?? ''} />
        </CardContent>
      </Card>
    </main>
  )
}
