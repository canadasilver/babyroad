'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppButton from '@/components/ui/AppButton'
import { createClient } from '@/lib/supabase/client'

type ChildSwitcherButtonProps = {
  userId: string
  childId: string
  disabled?: boolean
  className?: string
}

export default function ChildSwitcherButton({
  userId,
  childId,
  disabled = false,
  className,
}: ChildSwitcherButtonProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSwitch() {
    if (disabled || isSaving) return

    setIsSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle()

    if (!child) {
      setMessage('선택할 수 없는 아이 정보입니다.')
      setIsSaving(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        active_child_id: childId,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) {
      setMessage('아이 전환 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsSaving(false)
      return
    }

    router.refresh()
    setIsSaving(false)
  }

  return (
    <div className="space-y-1">
      <AppButton
        type="button"
        variant={disabled ? 'secondary' : 'outline'}
        size="sm"
        loading={isSaving}
        disabled={disabled}
        onClick={handleSwitch}
        className={className}
      >
        {disabled ? '현재 선택 중' : '이 아이로 보기'}
      </AppButton>
      {message ? <p className="text-xs font-medium text-[#C45B50]">{message}</p> : null}
    </div>
  )
}
