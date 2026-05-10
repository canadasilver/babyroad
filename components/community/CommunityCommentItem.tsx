'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/date'
import CommunityReportButton from '@/components/community/CommunityReportButton'
import type { Tables } from '@/types/database'

const editSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, '댓글은 2자 이상 입력해 주세요.')
    .max(500, '댓글은 500자 이내로 입력해 주세요.'),
})

interface CommunityCommentItemProps {
  comment: Tables<'community_comments'>
  userId: string | null
}

export default function CommunityCommentItem({ comment, userId }: CommunityCommentItemProps) {
  const router = useRouter()
  const isAuthor = !!userId && userId === comment.user_id

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [editError, setEditError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSave() {
    const parsed = editSchema.safeParse({ content: editContent })
    if (!parsed.success) {
      setEditError(parsed.error.errors[0]?.message ?? '입력을 확인해 주세요.')
      return
    }
    setEditError(null)
    setIsSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('community_comments')
      .update({
        content: parsed.data.content,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', comment.id)
      .eq('post_id', comment.post_id)
      .eq('user_id', userId!)
      .is('deleted_at', null)

    if (error) {
      setEditError('수정 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsSaving(false)
      return
    }

    setIsEditing(false)
    setIsSaving(false)
    router.refresh()
  }

  function handleCancel() {
    setEditContent(comment.content)
    setEditError(null)
    setIsEditing(false)
  }

  async function handleDelete() {
    const confirmed = window.confirm('이 댓글을 삭제할까요?')
    if (!confirmed) return

    setIsDeleting(true)
    const supabase = createClient()
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('community_comments')
      .update({ deleted_at: now, updated_at: now, status: 'deleted' } as never)
      .eq('id', comment.id)
      .eq('post_id', comment.post_id)
      .eq('user_id', userId!)
      .is('deleted_at', null)

    if (error) {
      alert('삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsDeleting(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="rounded-[1.25rem] border border-[#E8EEE9] bg-white/82 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">
              {comment.author_nickname ?? '익명'}
            </span>
            <span className="text-xs text-slate-400">{formatDateTime(comment.created_at)}</span>
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                rows={3}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={500}
                className="babyroad-input resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{editContent.length}/500</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-full bg-[#4FA99A] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#428F84] disabled:opacity-50"
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
              {editError && <p className="text-xs text-red-500">{editError}</p>}
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{comment.content}</p>
          )}
        </div>

        {!isEditing && (
          <div className="flex shrink-0 items-center gap-1.5">
            {isAuthor && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full bg-[#EAF6F2] px-2.5 py-1 text-xs font-semibold text-[#2F8F84] transition-colors hover:bg-[#D4EDE6]"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-full bg-[#FFF3E9] px-2.5 py-1 text-xs font-semibold text-[#C47B5A] transition-colors hover:bg-[#FDEADE] disabled:opacity-50"
                >
                  {isDeleting ? '삭제 중' : '삭제'}
                </button>
              </>
            )}
            <CommunityReportButton commentId={comment.id} userId={userId} />
          </div>
        )}
      </div>
    </div>
  )
}
