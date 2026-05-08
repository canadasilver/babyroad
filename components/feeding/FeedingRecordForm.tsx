'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import { toLocalDateTimeString } from '@/lib/date'
import type { TablesInsert } from '@/types/database'

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

const feedingSchema = z.object({
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

type FeedingFormData = z.infer<typeof feedingSchema>

interface FeedingRecordFormProps {
  userId: string
  childId: string
}

export default function FeedingRecordForm({ userId, childId }: FeedingRecordFormProps) {
  const router = useRouter()
  const defaultDateTime = useMemo(() => toLocalDateTimeString(), [])

  const [recordedAt, setRecordedAt] = useState(defaultDateTime)
  const [feedingType, setFeedingType] = useState<FeedingFormData['feedingType']>('breast_milk')
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState<FeedingFormData['unit']>('ml')
  const [foodName, setFoodName] = useState('')
  const [reaction, setReaction] = useState('')
  const [memo, setMemo] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function validate(): FeedingFormData | null {
    const result = feedingSchema.safeParse({
      recordedAt,
      feedingType,
      amount,
      unit,
      foodName,
      reaction,
      memo,
    })

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = validate()
    if (!data) return

    setIsSaving(true)
    setMessage(null)

    const payload: TablesInsert<'child_feeding_records'> = {
      user_id: userId,
      child_id: childId,
      recorded_at: new Date(data.recordedAt).toISOString(),
      feeding_type: data.feedingType,
      amount: Number(data.amount),
      unit: data.unit,
      food_name: data.foodName || null,
      reaction: data.reaction || null,
      memo: data.memo || null,
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('child_feeding_records')
      .insert([payload] as never[])

    if (error) {
      setMessage({ type: 'error', text: '저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.' })
      setIsSaving(false)
      return
    }

    setAmount('')
    setFoodName('')
    setReaction('')
    setMemo('')
    setRecordedAt(toLocalDateTimeString())
    setMessage({ type: 'success', text: '수유/식사 기록을 저장했어요.' })
    setIsSaving(false)
    router.refresh()
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">새 기록 추가</h2>
        <p className="mt-1 text-sm text-slate-500">
          수유 또는 식사 내용을 빠르게 기록해요.
        </p>
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
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
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
            onChange={(e) => setFeedingType(e.target.value as FeedingFormData['feedingType'])}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
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
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
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
              onChange={(e) => setUnit(e.target.value as FeedingFormData['unit'])}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
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
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
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
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
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
            className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
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
