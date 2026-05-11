'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { InviteRole } from '@/types/child'

const ROLE_LABELS: Record<InviteRole, string> = {
  editor: '기록 가능',
  viewer: '보기만 가능',
}

interface InviteInfo {
  id: string
  child_id: string
  invited_by: string
  role: InviteRole
  expires_at: string
}

interface Props {
  invite: InviteInfo
  userId: string
}

export default function InviteAcceptForm({ invite, userId }: Props) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const expiryDate = new Date(invite.expires_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  async function handleAccept() {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const now = new Date().toISOString()

      // 1. child_collaborators upsert — 이미 존재하면 active로 복구
      const { error: collabError } = await supabase
        .from('child_collaborators')
        .insert({
          child_id:    invite.child_id,
          user_id:     userId,
          role:        invite.role,
          status:      'active',
          invited_by:  invite.invited_by,
          accepted_at: now,
        } as never)

      if (collabError && collabError.code !== '23505') {
        setError('초대 수락 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }

      // 2. child_invites 상태 업데이트
      const { error: inviteError } = await supabase
        .from('child_invites')
        .update({
          status:      'accepted',
          accepted_by: userId,
          accepted_at: now,
        } as never)
        .eq('id', invite.id)

      if (inviteError) {
        setError('초대 수락 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }

      // 3. profiles.active_child_id를 초대받은 아이로 설정
      await supabase
        .from('profiles')
        .update({
          active_child_id: invite.child_id,
          updated_at:      now,
        } as never)
        .eq('user_id', userId)
        .is('deleted_at', null)

      router.push('/dashboard')
    } catch {
      setError('초대 수락 중 예상치 못한 문제가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 초대 내용 */}
      <div className="rounded-[1.35rem] border border-[#CFE3D8] bg-[#EAF6F2]/60 px-4 py-4">
        <p className="text-xs font-semibold text-[#4FA99A]">초대 내용</p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7A90]">권한</span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#25344A]">
              {ROLE_LABELS[invite.role]}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7A90]">만료일</span>
            <span className="text-xs font-medium text-[#25344A]">{expiryDate}까지</span>
          </div>
        </div>
      </div>

      {/* 안내 문구 */}
      <p className="rounded-2xl border border-[#F6D7C8] bg-[#FFF3E9]/72 px-3 py-2 text-xs leading-5 text-[#B86C4E]">
        수락하면 해당 아이의 기록을 함께 볼 수 있어요. 신뢰할 수 있는 가족의 초대인지 확인 후 수락해 주세요.
      </p>

      {/* 에러 */}
      {error && (
        <p role="alert" className="rounded-[1.25rem] border border-[#F4C8C1] bg-[#FFF0EF]/86 px-4 py-3 text-sm text-[#C45B50]">
          {error}
        </p>
      )}

      {/* 수락 버튼 */}
      <button
        type="button"
        onClick={handleAccept}
        disabled={loading}
        className="min-h-12 w-full rounded-2xl bg-[#4FA99A] text-sm font-bold text-white transition-colors hover:bg-[#3D9489] disabled:opacity-60"
      >
        {loading ? '수락 처리 중...' : '공동 보호자 수락하기'}
      </button>
    </div>
  )
}
