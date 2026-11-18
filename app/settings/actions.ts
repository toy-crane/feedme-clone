'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export type ProfileFormState = { status: 'idle' | 'saved' | 'error'; message?: string }

export async function updateDisplayName(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) return { status: 'error', message: '로그인이 필요해요.' }

  const displayName = String(formData.get('display_name') ?? '').trim()
  if (displayName.length > 50) {
    return { status: 'error', message: '표시 이름은 50자 이하로 적어 주세요.' }
  }

  // RLS limits this update to the caller's own row.
  const { data, error } = await supabase
    .from('profiles')
    .update({ display_name: displayName || null })
    .eq('id', userId)
    .select('id')

  if (error) return { status: 'error', message: error.message }
  if (!data?.length) return { status: 'error', message: '프로필을 찾지 못했어요.' }

  revalidatePath('/settings')
  return { status: 'saved' }
}
