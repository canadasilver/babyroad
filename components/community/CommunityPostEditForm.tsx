'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import { COMMUNITY_CATEGORIES } from '@/types/community'
import type { Tables } from '@/types/database'

const editSchema = z.object({
  category: z.string().min(1, '카테고리를 선택해 주세요.'),
  title: z
    .string()
    .trim()
    .min(2, '제목은 2자 이상 입력해 주세요.')
    .max(100, '제목은 100자 이내로 입력해 주세요.'),
  content: z
    .string()
    .trim()
    .min(10, '내용은 10자 이상 입력해 주세요.')
    .max(2000, '내용은 2000자 이내로 입력해 주세요.'),
})

interface CommunityPostEditFormProps {
  post: Tables<'community_posts'>
  userId: string
}

export default function CommunityPostEditForm({ post, userId }: CommunityPostEditFormProps) {
  const router = useRouter()

  const [category, setCategory] = useState(post.category)
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const parsed = editSchema.safeParse({ category, title, content })
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      parsed.error.errors.forEach((err) => {
        const key = String(err.path[0])
        if (!errors[key]) errors[key] = err.message
      })
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsSaving(true)
    setErrorMessage(null)

    const { data } = parsed
    const supabase = createClient()
    const { error } = await supabase
      .from('community_posts')
      .update({
        category: data.category,
        title: data.title,
        content: data.content,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', post.id)
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) {
      setErrorMessage('수정 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsSaving(false)
      return
    }

    router.push(`/community/${post.id}`)
    router.refresh()
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-slate-900">게시글 수정</h2>

      {errorMessage && (
        <div
          role="alert"
          className="mb-4 rounded-[1.25rem] border border-[#F6D6C4] bg-[#FFF3E9]/80 px-4 py-3 text-sm text-[#9A4E2A]"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">
            카테고리
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="babyroad-input"
          >
            <option value="">카테고리 선택</option>
            {COMMUNITY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {fieldErrors.category && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.category}</p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            제목
          </label>
          <input
            id="title"
            type="text"
            placeholder="제목을 입력해 주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="babyroad-input"
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700">
            내용
          </label>
          <textarea
            id="content"
            rows={8}
            placeholder="내용을 입력해 주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            className="babyroad-input resize-none"
          />
          <p className="mt-1 text-right text-xs text-slate-400">{content.length}/2000</p>
          {fieldErrors.content && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.content}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button type="submit" size="lg" loading={isSaving} className="flex-1">
            {isSaving ? '저장 중...' : '수정 완료'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
