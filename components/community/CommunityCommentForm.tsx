'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert } from '@/types/database'

const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, '댓글은 2자 이상 입력해 주세요.')
    .max(500, '댓글은 500자 이내로 입력해 주세요.'),
})

interface CommunityCommentFormProps {
  postId: string
  userId: string
  authorNickname: string
}

export default function CommunityCommentForm({
  postId,
  userId,
  authorNickname,
}: CommunityCommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const result = commentSchema.safeParse({ content })
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? '입력을 확인해 주세요.')
      return
    }
    setError(null)
    setLoading(true)

    const payload: TablesInsert<'community_comments'> = {
      user_id: userId,
      post_id: postId,
      parent_id: null,
      content: result.data.content,
      author_nickname: authorNickname,
      status: 'active',
    }

    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('community_comments')
      .insert([payload] as never[])

    if (dbError) {
      setError('댓글 등록 중 문제가 발생했습니다. 다시 시도해 주세요.')
      setLoading(false)
      return
    }

    setContent('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        rows={3}
        placeholder="댓글을 입력해 주세요."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={500}
        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{content.length}/500</p>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-orange-600"
        >
          {loading ? '등록 중...' : '댓글 등록'}
        </button>
      </div>
    </form>
  )
}
