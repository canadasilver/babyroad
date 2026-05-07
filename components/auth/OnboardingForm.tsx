'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'

export default function OnboardingForm() {
  const [status, setStatus] = useState<'pregnancy' | 'born'>('born')
  const [nickname, setNickname] = useState('')
  const [childName, setChildName] = useState('')
  const [dateValue, setDateValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: Supabase profiles + children 저장 구현 예정
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 닉네임 */}
      <label className="block">
        <span className="text-sm font-medium text-slate-700">닉네임</span>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="사용할 닉네임을 입력해 주세요"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          required
          maxLength={20}
        />
      </label>

      {/* 임신 중 / 출생 후 */}
      <div>
        <span className="text-sm font-medium text-slate-700">현재 상태</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(
            [
              { value: 'pregnancy', label: '🤰 임신 중' },
              { value: 'born', label: '👶 출생 후' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`rounded-xl border py-3 text-sm font-medium transition-colors ${
                status === option.value
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 아이 이름 / 태명 */}
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          {status === 'pregnancy' ? '태명' : '아이 이름'}
        </span>
        <input
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder={
            status === 'pregnancy'
              ? '태명을 입력해 주세요'
              : '아이 이름을 입력해 주세요'
          }
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          required
          maxLength={30}
        />
      </label>

      {/* 출산예정일 / 출생일 */}
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          {status === 'pregnancy' ? '출산예정일' : '출생일'}
        </span>
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          required
        />
      </label>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        시작하기
      </Button>
    </form>
  )
}
