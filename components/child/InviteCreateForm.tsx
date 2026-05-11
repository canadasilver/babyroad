'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { InviteRole } from '@/types/child'

const ROLE_OPTIONS: Array<{ value: InviteRole; label: string; description: string }> = [
  { value: 'editor', label: '기록 가능',   description: '기록 조회 및 새 기록 입력 가능' },
  { value: 'viewer', label: '보기만 가능', description: '기록 조회만 가능, 입력 불가' },
]

interface Props {
  userId: string
  childId: string
  childName: string
}

export default function InviteCreateForm({ userId, childId, childName }: Props) {
  const [role, setRole]       = useState<InviteRole>('editor')
  const [loading, setLoading] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)

  async function handleCreate() {
    setLoading(true)
    setError(null)
    setCopied(false)

    try {
      const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const supabase = createClient()

      const { error: insertError } = await supabase
        .from('child_invites')
        .insert({
          child_id:     childId,
          invited_by:   userId,
          invite_token: token,
          role,
          status:     'pending',
          expires_at: expiresAt,
        } as never)

      if (insertError) {
        setError('초대 링크 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }

      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://babyroad.vercel.app'
      setInviteUrl(`${origin}/invite/${token}`)
    } catch {
      setError('초대 링크 생성 중 문제가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  return (
    <div className="space-y-5">
      {/* 아이 이름 안내 */}
      <div className="rounded-[1.25rem] border border-white/70 bg-white/58 px-4 py-3">
        <p className="text-xs font-semibold text-[#4FA99A]">초대 대상 아이</p>
        <p className="mt-1 text-lg font-black text-[#25344A]">{childName}</p>
      </div>

      {/* 권한 선택 */}
      <div>
        <p className="mb-2 text-sm font-bold text-[#25344A]">공동 보호자 권한</p>
        <div className="space-y-2">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                role === option.value
                  ? 'border-[#4FA99A] bg-[#EAF6F2] shadow-[0_8px_18px_rgba(79,169,154,0.12)]'
                  : 'border-[#D9E6DF] bg-white/78 hover:border-[#CFE3D8]'
              }`}
            >
              <p className={`text-sm font-bold ${role === option.value ? 'text-[#2F766E]' : 'text-[#25344A]'}`}>
                {option.label}
              </p>
              <p className="mt-0.5 text-xs text-[#6B7A90]">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 유효기간 안내 */}
      <p className="rounded-2xl border border-[#F6D7C8] bg-[#FFF3E9]/72 px-3 py-2 text-xs leading-5 text-[#B86C4E]">
        초대 링크는 생성 후 7일간 유효합니다. 링크를 가족에게만 공유해 주세요.
      </p>

      {/* 에러 */}
      {error && (
        <p role="alert" className="rounded-[1.25rem] border border-[#F4C8C1] bg-[#FFF0EF]/86 px-4 py-3 text-sm text-[#C45B50]">
          {error}
        </p>
      )}

      {/* 생성 버튼 */}
      {!inviteUrl && (
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="min-h-12 w-full rounded-2xl bg-[#4FA99A] text-sm font-bold text-white transition-colors hover:bg-[#3D9489] disabled:opacity-60"
        >
          {loading ? '링크 생성 중...' : '초대 링크 만들기'}
        </button>
      )}

      {/* 초대 링크 표시 */}
      {inviteUrl && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#CFE3D8] bg-[#EAF6F2]/60 px-4 py-3">
            <p className="mb-1 text-xs font-semibold text-[#4FA99A]">초대 링크가 생성되었어요</p>
            <p className="break-all text-xs text-[#3D4F65]">{inviteUrl}</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-12 w-full rounded-2xl border border-[#4FA99A] bg-white text-sm font-bold text-[#4FA99A] transition-colors hover:bg-[#EAF6F2]"
          >
            {copied ? '복사됨!' : '링크 복사하기'}
          </button>
          <p className="text-center text-xs text-[#9AA8BA]">
            가족에게 이 링크를 공유해 주세요
          </p>
          <button
            type="button"
            onClick={() => { setInviteUrl(null); setCopied(false) }}
            className="w-full text-xs text-[#9AA8BA] underline underline-offset-2 hover:text-[#6B7A90]"
          >
            새 링크 만들기
          </button>
        </div>
      )}
    </div>
  )
}
