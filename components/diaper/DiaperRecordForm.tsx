'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import { toLocalDateTimeString } from '@/lib/date'
import type { DiaperType, StoolColor, StoolTexture, DiaperAmount } from '@/types/database'

const DIAPER_TYPES: { value: DiaperType; label: string }[] = [
  { value: 'urine', label: '소변' },
  { value: 'stool', label: '대변' },
  { value: 'both', label: '소변+대변' },
]

const STOOL_COLORS: { value: StoolColor; label: string }[] = [
  { value: 'yellow', label: '노란색' },
  { value: 'brown', label: '갈색' },
  { value: 'green', label: '초록색' },
  { value: 'dark', label: '어두운색' },
  { value: 'red', label: '붉은색' },
  { value: 'white', label: '흰색' },
  { value: 'other', label: '기타' },
]

const STOOL_TEXTURES: { value: StoolTexture; label: string }[] = [
  { value: 'watery', label: '묽음' },
  { value: 'soft', label: '부드러움' },
  { value: 'normal', label: '보통' },
  { value: 'hard', label: '딱딱함' },
  { value: 'mucus', label: '점액 섞임' },
  { value: 'other', label: '기타' },
]

const AMOUNTS: { value: DiaperAmount; label: string }[] = [
  { value: 'small', label: '적음' },
  { value: 'normal', label: '보통' },
  { value: 'large', label: '많음' },
]

const diaperSchema = z.object({
  recordedAt: z.string().min(1, '기록 일시를 입력해 주세요.'),
  diaperType: z.enum(['urine', 'stool', 'both'], {
    errorMap: () => ({ message: '유형을 선택해 주세요.' }),
  }),
  amount: z.enum(['small', 'normal', 'large']).optional(),
  stoolColor: z.enum(['yellow', 'brown', 'green', 'dark', 'red', 'white', 'other']).optional(),
  stoolTexture: z.enum(['watery', 'soft', 'normal', 'hard', 'mucus', 'other']).optional(),
  memo: z.string().trim().max(300, '메모는 300자 이내로 입력해 주세요.').optional(),
})

interface DiaperRecordFormProps {
  userId: string
  childId: string
}

export default function DiaperRecordForm({ userId, childId }: DiaperRecordFormProps) {
  const router = useRouter()
  const defaultDateTime = useMemo(() => toLocalDateTimeString(), [])

  const [recordedAt, setRecordedAt] = useState(defaultDateTime)
  const [diaperType, setDiaperType] = useState<DiaperType>('urine')
  const [amount, setAmount] = useState<DiaperAmount | ''>('')
  const [stoolColor, setStoolColor] = useState<StoolColor | ''>('')
  const [stoolTexture, setStoolTexture] = useState<StoolTexture | ''>('')
  const [memo, setMemo] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const showStoolFields = diaperType === 'stool' || diaperType === 'both'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = diaperSchema.safeParse({
      recordedAt,
      diaperType,
      amount: amount || undefined,
      stoolColor: showStoolFields && stoolColor ? stoolColor : undefined,
      stoolTexture: showStoolFields && stoolTexture ? stoolTexture : undefined,
      memo,
    })

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = String(err.path[0])
        if (!errors[key]) errors[key] = err.message
      })
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.from('child_diaper_records').insert([{
      user_id: userId,
      child_id: childId,
      recorded_at: new Date(result.data.recordedAt).toISOString(),
      diaper_type: result.data.diaperType,
      amount: result.data.amount ?? null,
      stool_color: result.data.stoolColor ?? null,
      stool_texture: result.data.stoolTexture ?? null,
      memo: result.data.memo || null,
    }] as never[])

    if (error) {
      setMessage({ type: 'error', text: '저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.' })
      setIsSaving(false)
      return
    }

    setRecordedAt(toLocalDateTimeString())
    setDiaperType('urine')
    setAmount('')
    setStoolColor('')
    setStoolTexture('')
    setMemo('')
    setMessage({ type: 'success', text: '배변 기록을 저장했어요.' })
    setIsSaving(false)
    router.refresh()
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">새 기록 추가</h2>
        <p className="mt-1 text-sm text-slate-500">배변 내용을 빠르게 기록해요.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div
            role="status"
            className={
              message.type === 'success'
                ? 'rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700'
                : 'rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700'
            }
          >
            {message.text}
          </div>
        )}

        <div>
          <label htmlFor="recordedAt" className="block text-sm font-medium text-slate-700">
            기록 일시
          </label>
          <input
            id="recordedAt"
            type="datetime-local"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.recordedAt && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.recordedAt}</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">유형</p>
          <div className="flex gap-2">
            {DIAPER_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setDiaperType(t.value)
                  if (t.value === 'urine') {
                    setStoolColor('')
                    setStoolTexture('')
                  }
                }}
                className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition-colors ${
                  diaperType === t.value
                    ? 'bg-[#4FA99A] text-white'
                    : 'bg-[#EAF6F2] text-[#4FA99A] hover:bg-[#D4EDE6]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {fieldErrors.diaperType && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.diaperType}</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">
            양 <span className="text-slate-400">(선택)</span>
          </p>
          <div className="flex gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setAmount(amount === a.value ? '' : a.value)}
                className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition-colors ${
                  amount === a.value
                    ? 'bg-[#D77C5B] text-white'
                    : 'bg-[#FFF3E9] text-[#D77C5B] hover:bg-[#FDEADE]'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {showStoolFields && (
          <>
            <div>
              <label htmlFor="stoolColor" className="block text-sm font-medium text-slate-700">
                대변 색상 <span className="text-slate-400">(선택)</span>
              </label>
              <select
                id="stoolColor"
                value={stoolColor}
                onChange={(e) => setStoolColor(e.target.value as StoolColor | '')}
                className="babyroad-input"
              >
                <option value="">선택 안함</option>
                {STOOL_COLORS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="stoolTexture" className="block text-sm font-medium text-slate-700">
                대변 상태 <span className="text-slate-400">(선택)</span>
              </label>
              <select
                id="stoolTexture"
                value={stoolTexture}
                onChange={(e) => setStoolTexture(e.target.value as StoolTexture | '')}
                className="babyroad-input"
              >
                <option value="">선택 안함</option>
                {STOOL_TEXTURES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-slate-700">
            메모 <span className="text-slate-400">(선택)</span>
          </label>
          <textarea
            id="memo"
            rows={2}
            placeholder="자유롭게 기록해요."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="babyroad-input resize-none"
          />
          {fieldErrors.memo && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.memo}</p>
          )}
        </div>

        <Button type="submit" size="lg" loading={isSaving} className="w-full">
          {isSaving ? '저장 중...' : '기록 저장'}
        </Button>
      </form>
    </Card>
  )
}
