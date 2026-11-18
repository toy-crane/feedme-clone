'use client'

import { useActionState } from 'react'

import { updateDisplayName, type ProfileFormState } from '@/app/settings/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: ProfileFormState = { status: 'idle' }

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, formAction, isPending] = useActionState(updateDisplayName, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="display_name">표시 이름</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          maxLength={50}
          placeholder="이름을 적어 주세요"
        />
      </div>
      {state.status === 'error' && <p className="text-sm text-destructive">{state.message}</p>}
      {state.status === 'saved' && <p className="text-sm text-muted-foreground">저장했어요.</p>}
      <Button type="submit" className="self-start" disabled={isPending}>
        {isPending ? '저장 중…' : '저장'}
      </Button>
    </form>
  )
}
