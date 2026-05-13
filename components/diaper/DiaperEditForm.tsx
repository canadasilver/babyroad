'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import { toLocalDateTimeString } from '@/lib/date'
import type { Tables, DiaperType, StoolColor, StoolTexture, DiaperAmount } from '@/types/database'

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

const editSchema = z.object({
  recordedAt: z.string().min(1, '기록 일시를 입력해 주세요.'),
  diaperType: z.enum(['urine', 'stool', 'both'], {
    errorMap: () => ({ message: '유형을 선택해 주세요.' }),
  }),
  amount: z.enum(['small', 'normal', 'large']).optional(),
  stoolColor: z.enum(['yellow', 'brown', 'green', 'dark', 'red', 'white', 'other']).optional(),
  stoolTexture: z.enum(['watery', 'soft', 'normal', 'hard', 'mucus', 'other']).optional(),
  memo: z.string().trim().max(300, '메모는 300자 이내로 입력해 주세요.').optional(),
})

function isoToDatetimeLocal(iso: string): string {
  return toLocalDateTimeString(new Date(iso))
}

interface DiaperEditFormProps {
  record: Tables<'child_diaper_records'>
}

export default function DiaperEditForm({ record }: DiaperEditFormProps) {
  const router = useRouter()

  const [recordedAt, setRecordedAt] = useState(isoToDatetimeLocal(record.recorded_at))
  const [diaperType, setDiaperType] = useState<DiaperType>(record.diaper_type)
  const [amount, setAmount] = useState<DiaperAmount | ''>(record.amount ?? '')
  const [stoolColor, setStoolColor] = useState<StoolColor | ''>(record.stool_color ?? '')
  const [stoolTexture, setStoolTexture] = useState<StoolTexture | ''>(record.stool_texture ?? '')
  const [memo, setMemo] = useState(record.memo ?? '')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const showStoolFields = diaperType === 'stool' || diaperType === 'both'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = editSchema.safeParse({
      recordedAt,
      diaperType,
      amount: amount || undefined,
      stoolColor: showStoolFields && stoolColor ? stoolColor : undefined,
      stoolTexture: showStoolFields && stoolTexture ? stoolTexture : undefined,
      memo,
    })

    if (!parsed.success) {
      const errors: Record<string, string> = {}
      parsed.error.errors.forEach((e) => {
        const key = String(e.path[0])
        if (!errors[key]) errors[key] = e.message
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
      .from('child_diaper_records')
      .update({
        recorded_at: new Date(data.recordedAt).toISOString(),
        diaper_type: data.diaperType,
        amount: data.amount ?? null,
        stool_color: data.stoolColor ?? null,
        stool_texture: data.stoolTexture ?? null,
        memo: data.memo || null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', record.id)
      .eq('child_id', record.child_id)
      .is('deleted_at', null)

    if (error) {
      setErrorMessage('수정 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsSaving(false)
      return
    }

    router.push('/diaper')
    router.refresh()
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="rounded-[1.25rem] border border-[#F6D6C4] bg-[#FFF3E9]/80 px-4 py-3 text-sm text-[#9A4E2A]"
          >
            {errorMessage}
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
