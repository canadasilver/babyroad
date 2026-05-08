'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CommunityDeleteButtonProps {
  postId: string
  userId: string
}

export default function CommunityDeleteButton({ postId, userId }: CommunityDeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true)
      return
    }

    setLoading(true)
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('community_posts') as any)
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('user_id', userId)

    if (!error) {
      router.push('/community')
      router.refresh()
    } else {
      setLoading(false)
      setConfirm(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
        confirm
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {loading ? '삭제 중...' : confirm ? '정말 삭제' : '삭제'}
    </button>
  )
}
