'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import { toLocalDateTimeString } from '@/lib/date'
import type { Tables } from '@/types/database'

const FEEDING_TYPES = [
  { value: 'breast_milk', label: '모유' },
  { value: 'formula', label: '분유' },
  { value: 'baby_food', label: '이유식' },
  { value: 'solid_food', label: '유아식' },
  { value: 'snack', label: '간식' },
  { value: 'water', label: '물' },
] as const

const UNITS = [
  { value: 'ml', label: 'ml' },
  { value: 'g', label: 'g' },
  { value: 'count', label: '회' },
  { value: 'spoon', label: '숟가락' },
  { value: 'other', label: '기타' },
] as const

type FeedingType = 'breast_milk' | 'formula' | 'baby_food' | 'solid_food' | 'snack' | 'water'
type UnitType = 'ml' | 'g' | 'count' | 'spoon' | 'other'

const editSchema = z.object({
  recordedAt: z.string().min(1, '기록 일시를 입력해 주세요.'),
  feedingType: z.enum(
    ['breast_milk', 'formula', 'baby_food', 'solid_food', 'snack', 'water'],
    { errorMap: () => ({ message: '수유/식사 유형을 선택해 주세요.' }) }
  ),
  amount: z
    .string()
    .trim()
    .min(1, '양을 입력해 주세요.')
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, '유효한 양을 입력해 주세요.'),
  unit: z.enum(['ml', 'g', 'count', 'spoon', 'other'], {
    errorMap: () => ({ message: '단위를 선택해 주세요.' }),
  }),
  foodName: z.string().trim().max(100, '음식명은 100자 이내로 입력해 주세요.').optional(),
  reaction: z.string().trim().max(200, '반응/알레르기는 200자 이내로 입력해 주세요.').optional(),
  memo: z.string().trim().max(300, '메모는 300자 이내로 입력해 주세요.').optional(),
})

function isoToDatetimeLocal(iso: string): string {
  return toLocalDateTimeString(new Date(iso))
}

interface FeedingEditFormProps {
  record: Tables<'child_feeding_records'>
}

export default function FeedingEditForm({ record }: FeedingEditFormProps) {
  const router = useRouter()

  const [recordedAt, setRecordedAt] = useState(isoToDatetimeLocal(record.recorded_at))
  const [feedingType, setFeedingType] = useState<FeedingType>(record.feeding_type)
  const [amount, setAmount] = useState(record.amount !== null ? String(record.amount) : '')
  const [unit, setUnit] = useState<UnitType>((record.unit as UnitType) ?? 'ml')
  const [foodName, setFoodName] = useState(record.food_name ?? '')
  const [reaction, setReaction] = useState(record.reaction ?? '')
  const [memo, setMemo] = useState(record.memo ?? '')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = editSchema.safeParse({
      recordedAt,
      feedingType,
      amount,
      unit,
      foodName,
      reaction,
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
      .from('child_feeding_records')
      .update({
        recorded_at: new Date(data.recordedAt).toISOString(),
        feeding_type: data.feedingType,
        amount: Number(data.amount),
        unit: data.unit,
        food_name: data.foodName || null,
        reaction: data.reaction || null,
        memo: data.memo || null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', record.id)
      .eq('user_id', record.user_id)
      .eq('child_id', record.child_id)
      .is('deleted_at', null)

    if (error) {
      setErrorMessage('수정 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsSaving(false)
      return
    }

    router.push('/feeding')
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
          <label htmlFor="feedingType" className="block text-sm font-medium text-slate-700">
            수유/식사 유형
          </label>
          <select
            id="feedingType"
            value={feedingType}
            onChange={(e) => setFeedingType(e.target.value as FeedingType)}
            className="babyroad-input"
          >
            {FEEDING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {fieldErrors.feedingType && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.feedingType}</p>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
              양
            </label>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="예: 120"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="babyroad-input"
            />
            {fieldErrors.amount && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.amount}</p>
            )}
          </div>
          <div className="w-28">
            <label htmlFor="unit" className="block text-sm font-medium text-slate-700">
              단위
            </label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as UnitType)}
              className="babyroad-input"
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
            {fieldErrors.unit && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.unit}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="foodName" className="block text-sm font-medium text-slate-700">
            음식명 <span className="text-slate-400">(선택)</span>
          </label>
          <input
            id="foodName"
            type="text"
            placeholder="예: 사과퓨레, 쌀죽"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.foodName && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.foodName}</p>
          )}
        </div>

        <div>
          <label htmlFor="reaction" className="block text-sm font-medium text-slate-700">
            반응/알레르기 <span className="text-slate-400">(선택)</span>
          </label>
          <input
            id="reaction"
            type="text"
            placeholder="예: 잘 먹음, 발진 있음"
            value={reaction}
            onChange={(e) => setReaction(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.reaction && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.reaction}</p>
          )}
        </div>

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
