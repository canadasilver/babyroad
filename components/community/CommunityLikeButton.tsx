'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CommunityLikeButtonProps {
  postId: string
  userId: string | null
  initialLikeCount: number
  initialIsLiked: boolean
}

export default function CommunityLikeButton({
  postId,
  userId,
  initialLikeCount,
  initialIsLiked,
}: CommunityLikeButtonProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialIsLiked)
  const [count, setCount] = useState(initialLikeCount)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!userId) {
      router.push('/login')
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (liked) {
      const { error } = await supabase
        .from('community_likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId)
        .is('deleted_at', null)

      if (!error) {
        setLiked(false)
        setCount((c) => Math.max(0, c - 1))
      }
    } else {
      const { error } = await supabase
        .from('community_likes')
        .insert([{ user_id: userId, post_id: postId }] as never[])

      if (!error) {
        setLiked(true)
        setCount((c) => c + 1)
      }
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        liked
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      <span>{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  )
}
