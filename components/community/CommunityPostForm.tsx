'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import { COMMUNITY_CATEGORIES } from '@/types/community'
import type { TablesInsert } from '@/types/database'

const postSchema = z.object({
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

interface CommunityPostFormProps {
  userId: string
  authorNickname: string
}

export default function CommunityPostForm({ userId, authorNickname }: CommunityPostFormProps) {
  const router = useRouter()
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function validate() {
    const result = postSchema.safeParse({ category, title, content })
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = String(err.path[0])
        if (!errors[key]) errors[key] = err.message
      })
      setFieldErrors(errors)
      return null
    }
    setFieldErrors({})
    return result.data
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = validate()
    if (!data) return

    setIsSaving(true)
    setMessage(null)

    const payload: TablesInsert<'community_posts'> = {
      user_id: userId,
      category: data.category,
      title: data.title,
      content: data.content,
      author_nickname: authorNickname,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      status: 'active',
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('community_posts')
      .insert([payload] as never[])

    if (error) {
      setMessage('저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsSaving(false)
      return
    }

    router.push('/community')
    router.refresh()
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-slate-900">글쓰기</h2>

      {message && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
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
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
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
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
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
            className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
          <p className="mt-1 text-right text-xs text-slate-400">{content.length}/2000</p>
          {fieldErrors.content && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.content}</p>
          )}
        </div>

        <Button type="submit" size="lg" loading={isSaving} className="w-full">
          {isSaving ? '등록 중...' : '작성하기'}
        </Button>
      </form>
    </Card>
  )
}
