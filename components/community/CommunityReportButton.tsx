'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert } from '@/types/database'

const REPORT_REASONS = [
  '스팸/광고',
  '욕설/혐오',
  '허위 정보',
  '개인정보 노출',
  '의료 오해 유발',
  '기타',
]

interface CommunityReportButtonProps {
  postId?: string
  commentId?: string
  userId: string | null
}

export default function CommunityReportButton({
  postId,
  commentId,
  userId,
}: CommunityReportButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function handleOpen() {
    if (!userId) {
      router.push('/login')
      return
    }
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!userId || !reason) return

    setLoading(true)

    const payload: TablesInsert<'community_reports'> = {
      user_id: userId,
      post_id: postId ?? null,
      comment_id: commentId ?? null,
      reason,
      content: content.trim() || null,
      status: 'pending',
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('community_reports')
      .insert([payload] as never[])

    setLoading(false)

    if (!error) {
      setDone(true)
      setOpen(false)
    }
  }

  if (done) {
    return (
      <span className="text-xs text-slate-400">신고 완료</span>
    )
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs text-slate-400 hover:text-slate-600"
      >
        신고
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">신고하기</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">신고 사유</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                >
                  <option value="">선택해 주세요</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  상세 내용 <span className="text-slate-400">(선택)</span>
                </label>
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={500}
                  placeholder="추가 내용을 입력해 주세요."
                  className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {loading ? '신고 중...' : '신고하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
