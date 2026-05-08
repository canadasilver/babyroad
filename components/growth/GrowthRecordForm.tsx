'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import { toISODateString } from '@/lib/date'
import type { TablesInsert } from '@/types/database'

const decimalTextSchema = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label}를 입력해 주세요.`)
    .refine((value) => Number.isFinite(Number(value)), `${label}는 숫자로 입력해 주세요.`)
    .refine((value) => Number(value) >= min, `${label}는 ${min} 이상으로 입력해 주세요.`)
    .refine((value) => Number(value) <= max, `${label}는 ${max} 이하로 입력해 주세요.`)

const optionalDecimalTextSchema = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || Number.isFinite(Number(value)),
      `${label}는 숫자로 입력해 주세요.`
    )
    .refine((value) => !value || Number(value) >= min, `${label}는 ${min} 이상으로 입력해 주세요.`)
    .refine((value) => !value || Number(value) <= max, `${label}는 ${max} 이하로 입력해 주세요.`)

const growthRecordSchema = z.object({
  recordDate: z.string().min(1, '기록일을 입력해 주세요.'),
  height: decimalTextSchema('키', 20, 250),
  weight: decimalTextSchema('몸무게', 0.5, 200),
  headCircumference: optionalDecimalTextSchema('머리둘레', 10, 80),
  memo: z.string().trim().max(300, '메모는 300자 이내로 입력해 주세요.').optional(),
})

type GrowthRecordFormData = z.infer<typeof growthRecordSchema>

interface GrowthRecordFormProps {
  userId: string
  childId: string
}

function parseOptionalNumber(value: string | undefined): number | null {
  if (!value) return null
  return Number(value)
}

function toPayloadNumber(value: string): number {
  return Number(value)
}

export default function GrowthRecordForm({ userId, childId }: GrowthRecordFormProps) {
  const router = useRouter()
  const today = useMemo(() => toISODateString(), [])

  const [recordDate, setRecordDate] = useState(today)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [headCircumference, setHeadCircumference] = useState('')
  const [memo, setMemo] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function validate(): GrowthRecordFormData | null {
    const result = growthRecordSchema.safeParse({
      recordDate,
      height,
      weight,
      headCircumference,
      memo,
    })

    if (!result.success) {
      const nextErrors: Record<string, string> = {}
      result.error.errors.forEach((error) => {
        const key = String(error.path[0])
        nextErrors[key] = error.message
      })
      setFieldErrors(nextErrors)
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

    const payload: TablesInsert<'child_growth_records'> = {
      user_id: userId,
      child_id: childId,
      record_date: data.recordDate,
      height: toPayloadNumber(data.height),
      weight: toPayloadNumber(data.weight),
      head_circumference: parseOptionalNumber(data.headCircumference),
      memo: data.memo ? data.memo : null,
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('child_growth_records')
      .insert([payload] as never[])

    if (error) {
      setMessage('성장 기록을 저장하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsSaving(false)
      return
    }

    setHeight('')
    setWeight('')
    setHeadCircumference('')
    setMemo('')
    setRecordDate(today)
    setMessage('성장 기록을 저장했어요.')
    setIsSaving(false)
    router.refresh()
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">성장 기록 입력</h2>
        <p className="mt-1 text-sm text-slate-500">
          오늘의 키와 몸무게를 남겨두면 다음에 쉽게 비교할 수 있어요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message ? (
          <div
            role="status"
            className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700"
          >
            {message}
          </div>
        ) : null}

        <div>
          <label htmlFor="recordDate" className="block text-sm font-medium text-slate-700">
            기록일
          </label>
          <input
            id="recordDate"
            type="date"
            value={recordDate}
            onChange={(event) => setRecordDate(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
          {fieldErrors.recordDate ? (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.recordDate}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-slate-700">
              키 cm
            </label>
            <input
              id="height"
              type="number"
              inputMode="decimal"
              min="20"
              max="250"
              step="0.1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              placeholder="예: 82.5"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
            {fieldErrors.height ? (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.height}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-slate-700">
              몸무게 kg
            </label>
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              min="0.5"
              max="200"
              step="0.01"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="예: 10.2"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
            {fieldErrors.weight ? (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.weight}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor="headCircumference"
            className="block text-sm font-medium text-slate-700"
          >
            머리둘레 cm <span className="text-slate-400">(선택)</span>
          </label>
          <input
            id="headCircumference"
            type="number"
            inputMode="decimal"
            min="10"
            max="80"
            step="0.1"
            value={headCircumference}
            onChange={(event) => setHeadCircumference(event.target.value)}
            placeholder="예: 46.0"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
          {fieldErrors.headCircumference ? (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.headCircumference}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-slate-700">
            메모 <span className="text-slate-400">(선택)</span>
          </label>
          <textarea
            id="memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="특이사항이나 기억하고 싶은 내용을 적어 주세요."
            rows={3}
            className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
          {fieldErrors.memo ? (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.memo}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" loading={isSaving} className="w-full">
          {isSaving ? '저장 중...' : '성장 기록 저장'}
        </Button>
      </form>
    </Card>
  )
}
