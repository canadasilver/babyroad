'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CommunityDeleteButtonProps {
  postId: string
  userId: string | null
}

export default function CommunityDeleteButton({ postId, userId }: CommunityDeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!userId) return

    const confirmed = window.confirm(
      '이 게시글을 삭제할까요? 삭제하면 목록과 상세 화면에서 보이지 않습니다.'
    )
    if (!confirmed) return

    setIsDeleting(true)
    const supabase = createClient()
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('community_posts')
      .update({ deleted_at: now, updated_at: now, status: 'deleted' } as never)
      .eq('id', postId)
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) {
      alert('삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsDeleting(false)
      return
    }

    router.push('/community')
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-full bg-[#FFF3E9] px-3 py-1 text-xs font-semibold text-[#C47B5A] transition-colors hover:bg-[#FDEADE] disabled:opacity-50"
    >
      {isDeleting ? '삭제 중...' : '삭제'}
    </button>
  )
}
